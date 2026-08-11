import {
  ConversationInputTooLargeError,
  MAX_CONVERSATION_INPUT_BYTES,
  measureConversationRequestInputBytes,
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
  type IdeaMap,
  type DraftSelection,
  type DraftChange,
} from "packages/products/src/thoughtform/shared";
import {
  applyIdeaAction,
  applyIdeaStructure,
  applyProposedIdeas,
  type IdeaMapAnalysisService,
  type IdeaMapAnalysis,
  removeResolvedPotentialConflicts,
  IDEA_MAP_UPDATE_STATUSES,
} from "packages/products/src/thoughtform/server/capabilities/idea-map";
import {
  IDEA_STRUCTURE_CHANGE_SOURCES,
  IDEA_STRUCTURE_OPERATION_TYPES,
} from "packages/products/src/thoughtform/shared";
import {
  noOpObservability,
  OBSERVATION_ATTRIBUTE_NAMES,
  type Observability,
} from "packages/observability/src";
import {
  HOSTED_ATTEMPT_ACTIONS,
  HOSTED_ATTEMPT_OUTCOMES,
  noOpHostedAttemptLifecycle,
  type HostedAttemptLifecycle,
} from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";
import { CONVERSATION_OPERATION_KINDS } from "packages/products/src/thoughtform/server/capabilities/conversation/ports/conversation-persistence";

export const WORKSPACE_RESPONSE_STATUSES = {
  responded: "responded",
} as const;

export type ConversationResponder = Pick<ConversationService, "respond">;
export type IdeaMapAnalyser = Pick<IdeaMapAnalysisService, "analyse">;

export const noOpIdeaMapAnalyser: IdeaMapAnalyser = {
  async analyse() {
    return {
      proposedIdeas: null,
      proposedIdeaActions: null,
      resolvedPotentialConflictIds: null,
    };
  },
};

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
  ideaMapAnalysis?: IdeaMapAnalyser;
  conversations: ConversationStore;
  draftSelection?: DraftSelection;
  draftChange?: DraftChange;
  hasDraft?: boolean;
  observability?: Observability;
  observationCorrelationId?: string;
  hostedAttempts?: HostedAttemptLifecycle;
  operationId?: string;
}): Promise<RespondInWorkspaceResult> {
  const observability = input.observability ?? noOpObservability;
  return observability.observe("thoughtform.workspace.turn", {
    [OBSERVATION_ATTRIBUTE_NAMES.operation]:
      CONVERSATION_OPERATION_KINDS.conversationTurn,
    ...(input.observationCorrelationId
      ? { [OBSERVATION_ATTRIBUTE_NAMES.correlationId]: input.observationCorrelationId }
      : {}),
    [OBSERVATION_ATTRIBUTE_NAMES.sessionId]:
      input.conversationId ?? input.observationCorrelationId ??
        globalThis.crypto.randomUUID(),
  }, async () => {
  const workspace = await observability.observe("thoughtform.workspace.load", {}, async () => input.conversationId
    ? await input.conversations.getConversationWorkspace(input.conversationId)
    : { messages: [], ideaMap: { revision: 0, ideas: [] } });

  if (workspace === null) {
    return { status: CONVERSATION_ERROR_CODES.notFound };
  }

  if (measureConversationRequestInputBytes({
    conversationId: input.conversationId,
    message: input.message,
    previousMessages: workspace.messages,
    ideaMap: workspace.ideaMap,
    draftSelection: input.draftSelection,
    draftChange: input.draftChange,
    hasDraft: input.hasDraft,
  }) > MAX_CONVERSATION_INPUT_BYTES) {
    return { status: CONVERSATION_ERROR_CODES.inputTooLarge };
  }

  const operationId = input.operationId ?? globalThis.crypto.randomUUID();
  const hostedAttempts = input.hostedAttempts ?? noOpHostedAttemptLifecycle;
  const conversationAttempt = await hostedAttempts.admit({
      action: HOSTED_ATTEMPT_ACTIONS.conversationResponse,
      operationId,
    });
  const ideaMapAttempt = input.ideaMapAnalysis
    ? await hostedAttempts.admit({
      action: HOSTED_ATTEMPT_ACTIONS.ideaMapAnalysis,
      operationId: `${operationId}:idea-map`,
    })
    : null;

  const ideaMapAnalysisPromise = input.ideaMapAnalysis
    ? ideaMapAttempt!.run(() => input.ideaMapAnalysis!.analyse({
      message: input.message,
      previousMessages: workspace.messages,
      ideaMap: workspace.ideaMap,
      draftChange: input.draftChange,
    }))
    .catch(async (error) => {
      if (error instanceof ConversationInputTooLargeError) {
        await ideaMapAttempt!.discard();
      } else {
        await ideaMapAttempt!.complete(HOSTED_ATTEMPT_OUTCOMES.providerFailed);
      }
      return {
      proposedIdeas: null,
      proposedIdeaActions: null,
      resolvedPotentialConflictIds: null,
      };
    }) : Promise.resolve({
      proposedIdeas: null,
      proposedIdeaActions: null,
      resolvedPotentialConflictIds: null,
    });

  let generatedResponse: Awaited<ReturnType<ConversationResponder["respond"]>>;

  try {
    generatedResponse = await conversationAttempt.run(() => input.conversation.respond({
      conversationId: input.conversationId,
      message: input.message,
      previousMessages: workspace.messages,
      ideaMap: workspace.ideaMap,
      draftSelection: input.draftSelection,
      draftChange: input.draftChange,
      hasDraft: input.hasDraft,
    }));
  } catch (error) {
    if (error instanceof ConversationInputTooLargeError) {
      await conversationAttempt.discard();
      return { status: CONVERSATION_ERROR_CODES.inputTooLarge };
    }
    await conversationAttempt.complete(HOSTED_ATTEMPT_OUTCOMES.providerFailed);
    if (ideaMapAttempt) {
      void ideaMapAnalysisPromise.then(() =>
        ideaMapAttempt.complete(HOSTED_ATTEMPT_OUTCOMES.persistenceFailed))
        .catch(() => undefined);
    }
    if (error instanceof HostedAiDisabledError) {
      return { status: CONVERSATION_ERROR_CODES.hostedAiDisabled };
    }
    if (error instanceof HostedAiUnavailableError) {
      return { status: CONVERSATION_ERROR_CODES.hostedAiUnavailable };
    }
    throw error;
  }

  const conversationId =
    input.conversationId ?? input.conversations.createConversationId();
  const ideaMapAnalysis = await ideaMapAnalysisPromise;
  const ideaMap = await observability.observe(
    "thoughtform.workspace.apply_idea_map",
    {},
    async () => applyIdeaMapAnalysis({
      current: workspace.ideaMap,
      analysis: ideaMapAnalysis,
      shouldIgnoreChanges: Boolean(input.draftChange),
    }));
  const response: ConversationResponse = {
    ...generatedResponse,
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
    expectedMessageCount: workspace.messages.length,
    expectedIdeaMapRevision: workspace.ideaMap.revision,
    ideaMap,
  }));

  if (appendResult.status === CONVERSATION_TURN_RETENTION_STATUSES.conflict) {
    await Promise.all([
      conversationAttempt.complete(HOSTED_ATTEMPT_OUTCOMES.persistenceFailed),
      ideaMapAttempt?.complete(HOSTED_ATTEMPT_OUTCOMES.persistenceFailed),
    ]);
    return { status: CONVERSATION_ERROR_CODES.conflict };
  }
  if (appendResult.status !== CONVERSATION_TURN_RETENTION_STATUSES.retained) {
    await Promise.all([
      conversationAttempt.complete(HOSTED_ATTEMPT_OUTCOMES.persistenceFailed),
      ideaMapAttempt?.complete(HOSTED_ATTEMPT_OUTCOMES.persistenceFailed),
    ]);
    return { status: CONVERSATION_ERROR_CODES.unavailable };
  }

  await Promise.all([
    conversationAttempt.complete(HOSTED_ATTEMPT_OUTCOMES.succeeded),
    ideaMapAttempt?.complete(HOSTED_ATTEMPT_OUTCOMES.succeeded),
  ]);

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

export function applyIdeaMapAnalysis(input: {
  current: IdeaMap;
  analysis: IdeaMapAnalysis;
  shouldIgnoreChanges: boolean;
}) {
  if (!input.shouldIgnoreChanges && input.analysis.proposedStructure) {
    const structuralResult = applyIdeaStructure({
      current: input.current,
      source: IDEA_STRUCTURE_CHANGE_SOURCES.assistant,
      request: input.analysis.proposedStructure.type === IDEA_STRUCTURE_OPERATION_TYPES.merge
        ? {
            ...input.analysis.proposedStructure,
            expectedRevision: input.current.revision,
          }
        : {
            ...input.analysis.proposedStructure,
            expectedRevision: input.current.revision,
          },
    });
    return structuralResult.status === IDEA_MAP_UPDATE_STATUSES.invalid
      ? input.current
      : structuralResult.ideaMap;
  }
  const proposedMap = applyProposedIdeas({
    current: input.current,
    proposedIdeas: input.shouldIgnoreChanges ? null : input.analysis.proposedIdeas,
  });
  let nextIdeaMap = proposedMap.status === IDEA_MAP_UPDATE_STATUSES.invalid
    ? input.current
    : proposedMap.ideaMap;
  let isInvalid = proposedMap.status === IDEA_MAP_UPDATE_STATUSES.invalid;
  for (const action of input.shouldIgnoreChanges
    ? []
    : (input.analysis.proposedIdeaActions ?? [])) {
    const result = applyIdeaAction({
      current: nextIdeaMap,
      ideaId: action.ideaId,
      request: {
        action: action.action,
        expectedRevision: input.current.revision,
        userInterpretation: action.userInterpretation,
      },
    });
    if (result.status === IDEA_MAP_UPDATE_STATUSES.invalid) {
      isInvalid = true;
      break;
    }
    nextIdeaMap = result.ideaMap;
  }
  if (
    !isInvalid &&
    !input.shouldIgnoreChanges &&
    input.analysis.resolvedPotentialConflictIds?.length
  ) {
    const result = removeResolvedPotentialConflicts({
      current: nextIdeaMap,
      conflictIds: input.analysis.resolvedPotentialConflictIds,
    });
    if (result.status === IDEA_MAP_UPDATE_STATUSES.invalid) isInvalid = true;
    else nextIdeaMap = result.ideaMap;
  }
  if (isInvalid) return input.current;
  return nextIdeaMap.revision === input.current.revision
    ? nextIdeaMap
    : { ...nextIdeaMap, revision: input.current.revision + 1 };
}
