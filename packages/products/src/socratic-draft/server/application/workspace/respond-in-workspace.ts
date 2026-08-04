import {
  ConversationInputTooLargeError,
  type ConversationService,
} from "packages/products/src/socratic-draft/server/capabilities/conversation/conversation-service";
import {
  HostedAiDisabledError,
  HostedAiUnavailableError,
} from "packages/products/src/socratic-draft/server/capabilities/conversation/ports/conversation-model";
import {
  CONVERSATION_TURN_RETENTION_STATUSES,
  type ConversationStore,
} from "packages/products/src/socratic-draft/server/capabilities/conversation/conversation-store";
import { WORKSPACE_EVENT_TYPES } from "packages/products/src/socratic-draft/server/application/workspace/workspace-events";
import type { WorkspaceEvent } from "packages/products/src/socratic-draft/server/application/workspace/workspace-events";
import {
  CONVERSATION_ERROR_CODES,
  CONVERSATION_MESSAGE_ROLES,
  type ConversationResponse,
  type DraftSelection,
  type DraftChange,
} from "packages/products/src/socratic-draft/shared";
import {
  applyIdeaAction,
  applyProposedIdeas,
  removeResolvedPotentialConflicts,
  IDEA_MAP_UPDATE_STATUSES,
} from "packages/products/src/socratic-draft/server/capabilities/idea-map";

export const WORKSPACE_RESPONSE_STATUSES = {
  responded: "responded",
} as const;

export type ConversationResponder = Pick<ConversationService, "respond">;

export type RespondInWorkspaceResult =
  | {
      status: typeof WORKSPACE_RESPONSE_STATUSES.responded;
      response: ConversationResponse;
      events: WorkspaceEvent[];
    }
  | { status: typeof CONVERSATION_ERROR_CODES.notFound }
  | { status: typeof CONVERSATION_ERROR_CODES.unavailable }
  | { status: typeof CONVERSATION_ERROR_CODES.inputTooLarge }
  | { status: typeof CONVERSATION_ERROR_CODES.hostedAiDisabled }
  | { status: typeof CONVERSATION_ERROR_CODES.hostedAiUnavailable }
  | { status: typeof CONVERSATION_ERROR_CODES.conflict };

export async function respondInWorkspace(input: {
  conversationId: string | null;
  message: string;
  conversation: ConversationResponder;
  conversations: ConversationStore;
  draftSelection?: DraftSelection;
  draftChange?: DraftChange;
  hasDraft?: boolean;
}): Promise<RespondInWorkspaceResult> {
  const workspace = input.conversationId
    ? await input.conversations.getConversationWorkspace(input.conversationId)
    : { messages: [], ideaMap: { revision: 0, ideas: [] } };

  if (workspace === null) {
    return { status: CONVERSATION_ERROR_CODES.notFound };
  }

  let generatedResponse: Awaited<ReturnType<ConversationResponder["respond"]>>;

  try {
    generatedResponse = await input.conversation.respond({
      conversationId: input.conversationId,
      message: input.message,
      previousMessages: workspace.messages,
      ideaMap: workspace.ideaMap,
      draftSelection: input.draftSelection,
      draftChange: input.draftChange,
      hasDraft: input.hasDraft,
    });
  } catch (error) {
    if (error instanceof ConversationInputTooLargeError) {
      return { status: CONVERSATION_ERROR_CODES.inputTooLarge };
    }
    if (error instanceof HostedAiDisabledError) {
      return { status: CONVERSATION_ERROR_CODES.hostedAiDisabled };
    }
    if (error instanceof HostedAiUnavailableError) {
      return { status: CONVERSATION_ERROR_CODES.hostedAiUnavailable };
    }
    throw error;
  }

  const operationId = globalThis.crypto.randomUUID();
  const conversationId =
    input.conversationId ?? input.conversations.createConversationId();
  const proposedMap = applyProposedIdeas({
    current: workspace.ideaMap,
    proposedIdeas: input.draftChange ? null : generatedResponse.proposedIdeas,
  });
  let ideaMap =
    proposedMap.status === IDEA_MAP_UPDATE_STATUSES.invalid
      ? workspace.ideaMap
      : proposedMap.ideaMap;
  let invalidIdeaChanges =
    proposedMap.status === IDEA_MAP_UPDATE_STATUSES.invalid;
  const {
    proposedIdeas: _proposedIdeas,
    proposedIdeaActions,
    resolvedPotentialConflictIds,
    ...generatedConversationResponse
  } = generatedResponse;
  for (const action of input.draftChange ? [] : (proposedIdeaActions ?? [])) {
    const actionResult = applyIdeaAction({
      current: ideaMap,
      ideaId: action.ideaId,
      request: {
        action: action.action,
        expectedRevision: workspace.ideaMap.revision,
        userInterpretation: action.userInterpretation,
      },
    });
    if (actionResult.status === IDEA_MAP_UPDATE_STATUSES.invalid) {
      invalidIdeaChanges = true;
      break;
    }
    ideaMap = actionResult.ideaMap;
  }
  if (!invalidIdeaChanges && !input.draftChange && resolvedPotentialConflictIds?.length) {
    const conflictResult = removeResolvedPotentialConflicts({
      current: ideaMap,
      conflictIds: resolvedPotentialConflictIds,
    });
    if (conflictResult.status === IDEA_MAP_UPDATE_STATUSES.invalid) {
      invalidIdeaChanges = true;
    } else {
      ideaMap = conflictResult.ideaMap;
    }
  }
  if (invalidIdeaChanges) {
    ideaMap = workspace.ideaMap;
  } else if (ideaMap.revision !== workspace.ideaMap.revision) {
    ideaMap = { ...ideaMap, revision: workspace.ideaMap.revision + 1 };
  }
  const response: ConversationResponse = {
    ...generatedConversationResponse,
    conversationId,
    ideaMap,
  };
  const appendResult = await input.conversations.appendConversationTurn({
    conversationId,
    operationId,
    userMessage: {
      role: CONVERSATION_MESSAGE_ROLES.user,
      content: input.message,
    },
    assistantMessage: response.message,
    expectedIdeaMapRevision: workspace.ideaMap.revision,
    ideaMap,
  });

  if (appendResult.status === CONVERSATION_TURN_RETENTION_STATUSES.conflict) {
    return { status: CONVERSATION_ERROR_CODES.conflict };
  }
  if (appendResult.status !== CONVERSATION_TURN_RETENTION_STATUSES.retained) {
    return { status: CONVERSATION_ERROR_CODES.unavailable };
  }

  return {
    status: WORKSPACE_RESPONSE_STATUSES.responded,
    response,
    events: [
      {
        type: WORKSPACE_EVENT_TYPES.conversationTurnRetained,
        conversationId,
      },
      ...(ideaMap.revision !== workspace.ideaMap.revision
        ? [
            {
              type: WORKSPACE_EVENT_TYPES.ideaMapChanged,
              conversationId,
              revision: ideaMap.revision,
            },
          ]
        : []),
    ],
  };
}
