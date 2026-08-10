import {
  ConversationInputTooLargeError,
  MAX_CONVERSATION_INPUT_BYTES,
  measureConversationRequestInputBytes,
  type ConversationGeneration,
  type ConversationService,
} from "packages/products/src/thoughtform/server/capabilities/conversation/conversation-service";
import {
  CONVERSATION_MODEL_STREAM_EVENT_TYPES,
  HostedAiDisabledError,
  HostedAiUnavailableError,
} from "packages/products/src/thoughtform/server/capabilities/conversation/ports/conversation-model";
import {
  CONVERSATION_TURN_RETENTION_STATUSES,
  type ConversationStore,
} from "packages/products/src/thoughtform/server/capabilities/conversation/conversation-store";
import type {
  IdeaMapAnalysis,
  IdeaMapAnalysisService,
} from "packages/products/src/thoughtform/server/capabilities/idea-map";
import {
  CONVERSATION_ERROR_CODES,
  CONVERSATION_MESSAGE_ROLES,
  CONVERSATION_STREAM_EVENT_TYPES,
  IDEA_MAP_ERROR_CODES,
  type ConversationStreamEvent,
  type ConversationMessage,
  type DraftChange,
  type DraftSelection,
  type IdeaMap,
} from "packages/products/src/thoughtform/shared";
import { applyIdeaMapAnalysis } from "packages/products/src/thoughtform/server/application/workspace/respond-in-workspace";
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

export type StreamingConversationResponder = Pick<ConversationService, "respondStream">;

const IDEA_MAP_ANALYSIS_RESULT_STATUSES = {
  completed: "completed",
  failed: "failed",
} as const;

export async function* streamResponseInWorkspace(input: {
  conversationId: string | null;
  message: string;
  conversation: StreamingConversationResponder;
  ideaMapAnalysis: Pick<IdeaMapAnalysisService, "analyse">;
  conversations: ConversationStore;
  draftSelection?: DraftSelection;
  draftChange?: DraftChange;
  hasDraft?: boolean;
  observability?: Observability;
  hostedAttempts?: HostedAttemptLifecycle;
  operationId?: string;
}): AsyncIterable<ConversationStreamEvent> {
  const observability = input.observability ?? noOpObservability;
  const workspace = await observability.observe(
    "thoughtform.workspace.load",
    {},
    async () => input.conversationId
      ? await input.conversations.getConversationWorkspace(input.conversationId)
      : { messages: [], ideaMap: { revision: 0, ideas: [] } },
  );
  if (!workspace) {
    yield failure(CONVERSATION_ERROR_CODES.notFound, "The requested conversation was not found.");
    return;
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
    yield failure(CONVERSATION_ERROR_CODES.inputTooLarge, "This conversation is too large to continue.");
    return;
  }

  const conversationId = input.conversationId ?? input.conversations.createConversationId();
  await observability.observe(
    "thoughtform.workspace.request_accepted",
    {},
    async () => undefined,
  );
  yield { type: CONVERSATION_STREAM_EVENT_TYPES.accepted, conversationId };

  const operationId = input.operationId ?? globalThis.crypto.randomUUID();
  const [conversationAttempt, ideaMapAttempt] = await Promise.all([
    (input.hostedAttempts ?? noOpHostedAttemptLifecycle).admit({
      action: HOSTED_ATTEMPT_ACTIONS.conversationResponse,
      operationId,
    }),
    (input.hostedAttempts ?? noOpHostedAttemptLifecycle).admit({
      action: HOSTED_ATTEMPT_ACTIONS.ideaMapAnalysis,
      operationId: `${operationId}:idea-map`,
    }),
  ]);

  const ideaMapResult = ideaMapAttempt.run(() => input.ideaMapAnalysis.analyse({
    message: input.message,
    previousMessages: workspace.messages,
    ideaMap: workspace.ideaMap,
    draftChange: input.draftChange,
  })).then(
    (analysis) => ({ status: IDEA_MAP_ANALYSIS_RESULT_STATUSES.completed, analysis }),
    async (error) => {
      if (error instanceof ConversationInputTooLargeError) {
        await ideaMapAttempt.discard();
      } else {
        await ideaMapAttempt.complete(HOSTED_ATTEMPT_OUTCOMES.providerFailed);
      }
      return { status: IDEA_MAP_ANALYSIS_RESULT_STATUSES.failed };
    },
  );

  let generation: ConversationGeneration | null = null;
  try {
    for await (const event of conversationAttempt.runStream(() => input.conversation.respondStream({
      conversationId,
      message: input.message,
      previousMessages: workspace.messages,
      ideaMap: workspace.ideaMap,
      draftSelection: input.draftSelection,
      draftChange: input.draftChange,
      hasDraft: input.hasDraft,
    }))) {
      if (event.type === CONVERSATION_MODEL_STREAM_EVENT_TYPES.textDelta) {
        yield {
          type: CONVERSATION_STREAM_EVENT_TYPES.assistantDelta,
          delta: event.text,
        };
      } else {
        generation = event.generation;
      }
    }
  } catch (error) {
    if (error instanceof ConversationInputTooLargeError) {
      await conversationAttempt.discard();
    } else {
      await conversationAttempt.complete(HOSTED_ATTEMPT_OUTCOMES.providerFailed);
    }
    void completeUnretainedIdeaMapAttempt(ideaMapResult, ideaMapAttempt).catch(() => undefined);
    yield conversationFailure(error);
    return;
  }
  if (!generation) {
    await conversationAttempt.complete(HOSTED_ATTEMPT_OUTCOMES.providerFailed);
    void completeUnretainedIdeaMapAttempt(ideaMapResult, ideaMapAttempt).catch(() => undefined);
    yield failure(
      CONVERSATION_ERROR_CODES.hostedAiUnavailable,
      "ThoughtForm could not complete its response.",
    );
    return;
  }

  const turnResult = await observability.observe(
    "thoughtform.workspace.retain_turn",
    {},
    async () => retainTurnAgainstLatestMap({
      conversations: input.conversations,
      conversationId,
      originalMessages: workspace.messages,
      originalIdeaMap: workspace.ideaMap,
      userMessage: { role: CONVERSATION_MESSAGE_ROLES.user, content: input.message },
      assistantMessage: generation.message,
    }),
  );
  if (turnResult.status !== CONVERSATION_TURN_RETENTION_STATUSES.retained) {
    await conversationAttempt.complete(HOSTED_ATTEMPT_OUTCOMES.persistenceFailed);
    void completeUnretainedIdeaMapAttempt(ideaMapResult, ideaMapAttempt).catch(() => undefined);
    yield failure(
      turnResult.status === CONVERSATION_TURN_RETENTION_STATUSES.conflict
        ? CONVERSATION_ERROR_CODES.conflict
        : CONVERSATION_ERROR_CODES.unavailable,
      "The conversation changed while the response was being retained.",
    );
    return;
  }
  await conversationAttempt.complete(HOSTED_ATTEMPT_OUTCOMES.succeeded);
  yield {
    type: CONVERSATION_STREAM_EVENT_TYPES.assistantCompleted,
    response: generation,
  };
  observability.record({
    [OBSERVATION_ATTRIBUTE_NAMES.result]: "assistant_retained",
  });

  const analysed = await ideaMapResult;
  if (analysed.status === IDEA_MAP_ANALYSIS_RESULT_STATUSES.failed) {
    yield {
      type: CONVERSATION_STREAM_EVENT_TYPES.ideaMapFailed,
      code: IDEA_MAP_ERROR_CODES.unavailable,
      message: "The response was saved, but the Idea Map could not be updated.",
    };
    yield { type: CONVERSATION_STREAM_EVENT_TYPES.completed };
    return;
  }
  const mapResult = await retainAnalysisAgainstLatestMap({
    conversations: input.conversations,
    conversationId,
    originalIdeaMap: workspace.ideaMap,
    analysis: analysed.analysis,
    shouldIgnoreChanges: Boolean(input.draftChange),
    observability,
  });
  if (mapResult.status !== CONVERSATION_TURN_RETENTION_STATUSES.retained) {
    await ideaMapAttempt.complete(HOSTED_ATTEMPT_OUTCOMES.persistenceFailed);
    yield {
      type: CONVERSATION_STREAM_EVENT_TYPES.ideaMapFailed,
      code: mapResult.status === CONVERSATION_TURN_RETENTION_STATUSES.conflict
        ? IDEA_MAP_ERROR_CODES.conflict
        : IDEA_MAP_ERROR_CODES.unavailable,
      message: "The response was saved, but the Idea Map changed before this update could be retained.",
    };
    yield { type: CONVERSATION_STREAM_EVENT_TYPES.completed };
    return;
  }
  await ideaMapAttempt.complete(HOSTED_ATTEMPT_OUTCOMES.succeeded);
  const ideaMap = mapResult.ideaMap;
  observability.record({
    [OBSERVATION_ATTRIBUTE_NAMES.result]: "idea_map_retained",
    [OBSERVATION_ATTRIBUTE_NAMES.ideaCount]: ideaMap.ideas.length,
    [OBSERVATION_ATTRIBUTE_NAMES.ideaMapRevision]: ideaMap.revision,
  });
  yield { type: CONVERSATION_STREAM_EVENT_TYPES.ideaMapCompleted, ideaMap };
  yield { type: CONVERSATION_STREAM_EVENT_TYPES.completed };
}

async function completeUnretainedIdeaMapAttempt(
  result: Promise<
    | {
        status: typeof IDEA_MAP_ANALYSIS_RESULT_STATUSES.completed;
        analysis: IdeaMapAnalysis;
      }
    | { status: typeof IDEA_MAP_ANALYSIS_RESULT_STATUSES.failed }
  >,
  attempt: Awaited<ReturnType<HostedAttemptLifecycle["admit"]>>,
) {
  if ((await result).status === IDEA_MAP_ANALYSIS_RESULT_STATUSES.completed) {
    await attempt.complete(HOSTED_ATTEMPT_OUTCOMES.persistenceFailed);
  }
}

async function retainTurnAgainstLatestMap(input: {
  conversations: ConversationStore;
  conversationId: string;
  originalMessages: ConversationMessage[];
  originalIdeaMap: IdeaMap;
  userMessage: ConversationMessage;
  assistantMessage: ConversationMessage;
}) {
  const operationId = globalThis.crypto.randomUUID();
  const retain = (ideaMap: IdeaMap) => input.conversations.appendConversationTurn({
    conversationId: input.conversationId,
    operationId,
    userMessage: input.userMessage,
    assistantMessage: input.assistantMessage,
    expectedMessageCount: input.originalMessages.length,
    expectedIdeaMapRevision: ideaMap.revision,
    ideaMap,
  });
  const initialResult = await retain(input.originalIdeaMap);
  if (initialResult.status !== CONVERSATION_TURN_RETENTION_STATUSES.conflict) {
    return initialResult;
  }
  const latest = await input.conversations.getConversationWorkspace(input.conversationId);
  if (!latest || !messagesMatch(latest.messages, input.originalMessages)) {
    return initialResult;
  }
  return retain(latest.ideaMap);
}

async function retainAnalysisAgainstLatestMap(input: {
  conversations: ConversationStore;
  conversationId: string;
  originalIdeaMap: IdeaMap;
  analysis: IdeaMapAnalysis;
  shouldIgnoreChanges: boolean;
  observability: Observability;
}): Promise<
  | { status: typeof CONVERSATION_TURN_RETENTION_STATUSES.retained; ideaMap: IdeaMap }
  | { status: typeof CONVERSATION_TURN_RETENTION_STATUSES.conflict }
  | { status: typeof CONVERSATION_TURN_RETENTION_STATUSES.unavailable }
> {
  const operationId = globalThis.crypto.randomUUID();
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const latest = await input.conversations.getConversationWorkspace(input.conversationId);
    if (!latest) {
      return { status: CONVERSATION_TURN_RETENTION_STATUSES.unavailable };
    }
    const ideaMap = await input.observability.observe(
      "thoughtform.workspace.apply_idea_map",
      {},
      async () => applyIdeaMapAnalysis({
        current: latest.ideaMap,
        analysis: safeAnalysisAgainstLatest({
          original: input.originalIdeaMap,
          latest: latest.ideaMap,
          analysis: input.analysis,
        }),
        shouldIgnoreChanges: input.shouldIgnoreChanges,
      }),
    );
    if (ideaMap.revision === latest.ideaMap.revision) {
      return { status: CONVERSATION_TURN_RETENTION_STATUSES.retained, ideaMap };
    }
    const result = await input.observability.observe(
      "thoughtform.workspace.retain_idea_map",
      {},
      async () => input.conversations.replaceIdeaMap({
        conversationId: input.conversationId,
        operationId,
        expectedRevision: latest.ideaMap.revision,
        ideaMap,
      }),
    );
    if (result.status === CONVERSATION_TURN_RETENTION_STATUSES.retained) {
      return { ...result, ideaMap };
    }
    if (result.status !== CONVERSATION_TURN_RETENTION_STATUSES.conflict) {
      return result;
    }
  }
  return { status: CONVERSATION_TURN_RETENTION_STATUSES.conflict };
}

function safeAnalysisAgainstLatest(input: {
  original: IdeaMap;
  latest: IdeaMap;
  analysis: IdeaMapAnalysis;
}): IdeaMapAnalysis {
  const originalIdeas = new Map(input.original.ideas.map((idea) => [idea.id, idea]));
  const latestIdeas = new Map(input.latest.ideas.map((idea) => [idea.id, idea]));
  const isIdeaUnchanged = (ideaId: string) => originalIdeas.has(ideaId) &&
    latestIdeas.has(ideaId) &&
    JSON.stringify(originalIdeas.get(ideaId)) === JSON.stringify(latestIdeas.get(ideaId));
  const originalConflicts = new Map(
    (input.original.potentialConflicts ?? []).map((conflict) => [conflict.id, conflict]),
  );
  const latestConflicts = new Map(
    (input.latest.potentialConflicts ?? []).map((conflict) => [conflict.id, conflict]),
  );

  return {
    proposedIdeas: input.analysis.proposedIdeas?.filter((idea) =>
      idea.id === null || isIdeaUnchanged(idea.id)) ?? null,
    proposedIdeaActions: input.analysis.proposedIdeaActions?.filter((action) =>
      isIdeaUnchanged(action.ideaId)) ?? null,
    resolvedPotentialConflictIds: input.analysis.resolvedPotentialConflictIds?.filter(
      (conflictId) => JSON.stringify(originalConflicts.get(conflictId)) ===
        JSON.stringify(latestConflicts.get(conflictId)),
    ) ?? null,
  };
}

function messagesMatch(first: ConversationMessage[], second: ConversationMessage[]) {
  return first.length === second.length && first.every((message, index) =>
    message.role === second[index]?.role && message.content === second[index]?.content);
}

function conversationFailure(error: unknown): ConversationStreamEvent {
  if (error instanceof ConversationInputTooLargeError) {
    return failure(CONVERSATION_ERROR_CODES.inputTooLarge, "This conversation is too large to continue.");
  }
  if (error instanceof HostedAiDisabledError) {
    return failure(CONVERSATION_ERROR_CODES.hostedAiDisabled, "ThoughtForm is currently disabled.");
  }
  if (error instanceof HostedAiUnavailableError) {
    return failure(CONVERSATION_ERROR_CODES.hostedAiUnavailable, "ThoughtForm could not respond. Try again shortly.");
  }
  return failure(CONVERSATION_ERROR_CODES.hostedAiUnavailable, "ThoughtForm could not respond. Try again shortly.");
}

function failure(
  code: typeof CONVERSATION_ERROR_CODES[keyof typeof CONVERSATION_ERROR_CODES],
  message: string,
): ConversationStreamEvent {
  return { type: CONVERSATION_STREAM_EVENT_TYPES.failed, code, message };
}
