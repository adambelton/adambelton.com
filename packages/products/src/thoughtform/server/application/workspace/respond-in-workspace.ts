import {
  ConversationInputTooLargeError,
  type ConversationService,
} from "packages/products/src/thoughtform/server/capabilities/conversation/conversation-service";
import {
  HostedAiDisabledError,
  HostedAiUnavailableError,
} from "packages/products/src/thoughtform/server/capabilities/conversation/ports/conversation-model";
import {
  CONVERSATION_TURN_RETENTION_STATUSES,
  type ConversationStore,
} from "packages/products/src/thoughtform/server/capabilities/conversation/conversation-store";
import { WORKSPACE_EVENT_TYPES } from "packages/products/src/thoughtform/server/application/workspace/workspace-events";
import type { WorkspaceEvent } from "packages/products/src/thoughtform/server/application/workspace/workspace-events";
import {
  CONVERSATION_ERROR_CODES,
  CONVERSATION_MESSAGE_ROLES,
  type ConversationResponse,
  type DraftSelection,
  type DraftChange,
} from "packages/products/src/thoughtform/shared";
import {
  applyIdeaAction,
  applyProposedIdeas,
  removeResolvedPotentialConflicts,
  IDEA_MAP_UPDATE_STATUSES,
} from "packages/products/src/thoughtform/server/capabilities/idea-map";
import {
  noOpObservability,
  OBSERVATION_ATTRIBUTE_NAMES,
  type Observability,
} from "packages/observability/src";

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
  observability?: Observability;
  observationCorrelationId?: string;
}): Promise<RespondInWorkspaceResult> {
  const observability = input.observability ?? noOpObservability;
  return observability.observe("thoughtform.workspace.turn", {
    [OBSERVATION_ATTRIBUTE_NAMES.operation]: "conversation_turn",
    ...(input.observationCorrelationId
      ? { [OBSERVATION_ATTRIBUTE_NAMES.correlationId]: input.observationCorrelationId }
      : {}),
  }, async () => {
  const workspace = await observability.observe("thoughtform.workspace.load", {}, async () => input.conversationId
    ? await input.conversations.getConversationWorkspace(input.conversationId)
    : { messages: [], ideaMap: { revision: 0, ideas: [] } });

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
  const {
    proposedIdeas: _proposedIdeas,
    proposedIdeaActions,
    resolvedPotentialConflictIds,
    ...generatedConversationResponse
  } = generatedResponse;
  const ideaMap = await observability.observe(
    "thoughtform.workspace.apply_idea_map",
    {},
    async () => {
      const proposedMap = applyProposedIdeas({
        current: workspace.ideaMap,
        proposedIdeas: input.draftChange ? null : generatedResponse.proposedIdeas,
      });
      let nextIdeaMap =
        proposedMap.status === IDEA_MAP_UPDATE_STATUSES.invalid
          ? workspace.ideaMap
          : proposedMap.ideaMap;
      let invalidIdeaChanges =
        proposedMap.status === IDEA_MAP_UPDATE_STATUSES.invalid;
      for (const action of input.draftChange ? [] : (proposedIdeaActions ?? [])) {
        const actionResult = applyIdeaAction({
          current: nextIdeaMap,
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
        nextIdeaMap = actionResult.ideaMap;
      }
      if (
        !invalidIdeaChanges &&
        !input.draftChange &&
        resolvedPotentialConflictIds?.length
      ) {
        const conflictResult = removeResolvedPotentialConflicts({
          current: nextIdeaMap,
          conflictIds: resolvedPotentialConflictIds,
        });
        if (conflictResult.status === IDEA_MAP_UPDATE_STATUSES.invalid) {
          invalidIdeaChanges = true;
        } else {
          nextIdeaMap = conflictResult.ideaMap;
        }
      }
      if (invalidIdeaChanges) {
        return workspace.ideaMap;
      }
      if (nextIdeaMap.revision !== workspace.ideaMap.revision) {
        return {
          ...nextIdeaMap,
          revision: workspace.ideaMap.revision + 1,
        };
      }
      return nextIdeaMap;
    });
  const response: ConversationResponse = {
    ...generatedConversationResponse,
    conversationId,
    ideaMap,
  };
  const appendResult = await observability.observe("thoughtform.workspace.retain_turn", {}, async () => input.conversations.appendConversationTurn({
    conversationId,
    operationId,
    userMessage: {
      role: CONVERSATION_MESSAGE_ROLES.user,
      content: input.message,
    },
    assistantMessage: response.message,
    expectedIdeaMapRevision: workspace.ideaMap.revision,
    ideaMap,
  }));

  if (appendResult.status === CONVERSATION_TURN_RETENTION_STATUSES.conflict) {
    return { status: CONVERSATION_ERROR_CODES.conflict };
  }
  if (appendResult.status !== CONVERSATION_TURN_RETENTION_STATUSES.retained) {
    return { status: CONVERSATION_ERROR_CODES.unavailable };
  }

  observability.record({
    [OBSERVATION_ATTRIBUTE_NAMES.result]: "responded",
    [OBSERVATION_ATTRIBUTE_NAMES.ideaCount]: ideaMap.ideas.length,
    [OBSERVATION_ATTRIBUTE_NAMES.ideaMapRevision]: ideaMap.revision,
  });
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
  });
}
