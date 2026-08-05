import {
  ConversationInputTooLargeError,
  type ConversationGeneration,
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
import type { IdeaMapAnalysisService } from "packages/products/src/thoughtform/server/capabilities/idea-map";
import {
  CONVERSATION_ERROR_CODES,
  CONVERSATION_MESSAGE_ROLES,
  CONVERSATION_STREAM_EVENT_TYPES,
  type ConversationStreamEvent,
  type DraftChange,
  type DraftSelection,
} from "packages/products/src/thoughtform/shared";
import { applyIdeaMapAnalysis } from "packages/products/src/thoughtform/server/application/workspace/respond-in-workspace";
import {
  noOpObservability,
  OBSERVATION_ATTRIBUTE_NAMES,
  type Observability,
} from "packages/observability/src";

export type StreamingConversationResponder = Pick<ConversationService, "respondStream">;

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

  const conversationId = input.conversationId ?? input.conversations.createConversationId();
  await observability.observe(
    "thoughtform.workspace.request_accepted",
    {},
    async () => undefined,
  );
  yield { type: CONVERSATION_STREAM_EVENT_TYPES.accepted, conversationId };

  const ideaMapResult = input.ideaMapAnalysis.analyse({
    message: input.message,
    previousMessages: workspace.messages,
    ideaMap: workspace.ideaMap,
    draftChange: input.draftChange,
  }).then(
    (analysis) => ({ status: "completed" as const, analysis }),
    () => ({ status: "failed" as const }),
  );

  let generation: ConversationGeneration | null = null;
  try {
    for await (const event of input.conversation.respondStream({
      conversationId,
      message: input.message,
      previousMessages: workspace.messages,
      ideaMap: workspace.ideaMap,
      draftSelection: input.draftSelection,
      draftChange: input.draftChange,
      hasDraft: input.hasDraft,
    })) {
      if (event.type === "text_delta") {
        yield {
          type: CONVERSATION_STREAM_EVENT_TYPES.assistantDelta,
          delta: event.text,
        };
      } else {
        generation = event.generation;
      }
    }
  } catch (error) {
    yield conversationFailure(error);
    return;
  }
  if (!generation) {
    yield failure(
      CONVERSATION_ERROR_CODES.hostedAiUnavailable,
      "ThoughtForm could not complete its response.",
    );
    return;
  }

  const turnResult = await observability.observe("thoughtform.workspace.retain_turn", {}, async () => input.conversations.appendConversationTurn({
    conversationId,
    operationId: globalThis.crypto.randomUUID(),
    userMessage: { role: CONVERSATION_MESSAGE_ROLES.user, content: input.message },
    assistantMessage: generation.message,
    expectedIdeaMapRevision: workspace.ideaMap.revision,
    ideaMap: workspace.ideaMap,
  }));
  if (turnResult.status !== CONVERSATION_TURN_RETENTION_STATUSES.retained) {
    yield failure(
      turnResult.status === CONVERSATION_TURN_RETENTION_STATUSES.conflict
        ? CONVERSATION_ERROR_CODES.conflict
        : CONVERSATION_ERROR_CODES.unavailable,
      "The conversation changed while the response was being retained.",
    );
    return;
  }
  yield {
    type: CONVERSATION_STREAM_EVENT_TYPES.assistantCompleted,
    response: generation,
  };
  observability.record({
    [OBSERVATION_ATTRIBUTE_NAMES.result]: "assistant_retained",
  });

  const analysed = await ideaMapResult;
  if (analysed.status === "failed") {
    yield {
      type: CONVERSATION_STREAM_EVENT_TYPES.ideaMapFailed,
      code: "idea_map_unavailable",
      message: "The response was saved, but the Idea Map could not be updated.",
    };
    yield { type: CONVERSATION_STREAM_EVENT_TYPES.completed };
    return;
  }
  const ideaMap = await observability.observe(
    "thoughtform.workspace.apply_idea_map",
    {},
    async () => applyIdeaMapAnalysis({
      current: workspace.ideaMap,
      analysis: analysed.analysis,
      ignoreChanges: Boolean(input.draftChange),
    }),
  );
  if (ideaMap.revision !== workspace.ideaMap.revision) {
    const mapResult = await observability.observe("thoughtform.workspace.retain_idea_map", {}, async () => input.conversations.replaceIdeaMap({
      conversationId,
      operationId: globalThis.crypto.randomUUID(),
      expectedRevision: workspace.ideaMap.revision,
      ideaMap,
    }));
    if (mapResult.status !== CONVERSATION_TURN_RETENTION_STATUSES.retained) {
      yield {
        type: CONVERSATION_STREAM_EVENT_TYPES.ideaMapFailed,
        code: mapResult.status === CONVERSATION_TURN_RETENTION_STATUSES.conflict
          ? "idea_map_conflict"
          : "idea_map_unavailable",
        message: "The response was saved, but the Idea Map changed before this update could be retained.",
      };
      yield { type: CONVERSATION_STREAM_EVENT_TYPES.completed };
      return;
    }
  }
  observability.record({
    [OBSERVATION_ATTRIBUTE_NAMES.result]: "idea_map_retained",
    [OBSERVATION_ATTRIBUTE_NAMES.ideaCount]: ideaMap.ideas.length,
    [OBSERVATION_ATTRIBUTE_NAMES.ideaMapRevision]: ideaMap.revision,
  });
  yield { type: CONVERSATION_STREAM_EVENT_TYPES.ideaMapCompleted, ideaMap };
  yield { type: CONVERSATION_STREAM_EVENT_TYPES.completed };
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
