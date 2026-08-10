import type { Context } from "hono";
import {
  noOpIdeaMapAnalyser,
  respondInWorkspace,
  streamResponseInWorkspace,
  type ConversationResponder,
  type IdeaMapAnalyser,
  type RespondInWorkspaceResult,
  type StreamingConversationResponder,
  WORKSPACE_RESPONSE_STATUSES,
} from "packages/products/src/thoughtform/server/application/workspace";
import type {
  ConversationStore,
  TemporaryConversationStore,
} from "packages/products/src/thoughtform/server/capabilities/conversation";
import type { DraftStore } from "packages/products/src/thoughtform/server/capabilities/drafting";
import { parseConversationRequest } from "packages/products/src/thoughtform/server/delivery/http/conversation-request";
import { conversationStreamResponse } from "packages/products/src/thoughtform/server/delivery/http/conversation-stream-response";
import { validateDraftChange } from "packages/products/src/thoughtform/server/delivery/http/draft-change-context";
import { validateDraftSelection } from "packages/products/src/thoughtform/server/delivery/http/draft-selection-context";
import {
  CONVERSATION_ERROR_CODES,
  CONVERSATION_STREAM_EVENT_TYPES,
  WORKSPACE_PERSISTENCE_TYPES,
  type ConversationRequest,
  type ConversationStreamEvent,
  type WorkspacePersistenceType,
} from "packages/products/src/thoughtform/shared";
import {
  noOpObservability,
  OBSERVATION_ATTRIBUTE_NAMES,
  observeStream,
  type Observability,
} from "packages/observability/src";
import { failure, success } from "packages/shared/src";
import type { HostedAttemptLifecycle } from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";
import { CONVERSATION_OPERATION_KINDS } from "packages/products/src/thoughtform/server/capabilities/conversation/ports/conversation-persistence";

type ConversationResponseHandlerInput = {
  context: Context;
  conversationId: string | null;
  conversation: ConversationResponder;
  conversations: ConversationStore;
  draftStore: DraftStore | null;
  persistenceType: WorkspacePersistenceType;
  observability?: Observability;
  hostedAttempts?: HostedAttemptLifecycle;
};

type ConversationStreamHandlerInput = Omit<
  ConversationResponseHandlerInput,
  "conversation"
> & {
  conversation: StreamingConversationResponder;
  ideaMapAnalysis?: IdeaMapAnalyser;
};

export async function handleConversationResponse(
  input: ConversationResponseHandlerInput,
) {
  const prepared = await prepareConversationRequest(input);
  if (prepared instanceof Response) return prepared;

  const result = await respondInWorkspace({
    conversationId: prepared.conversationId,
    message: prepared.request.message,
    conversation: input.conversation,
    conversations: input.conversations,
    draftSelection: prepared.request.draftSelection,
    draftChange: prepared.request.draftChange,
    hasDraft: prepared.hasDraft,
    observability: input.observability,
    observationCorrelationId: parseObservationCorrelationId(
      input.context.req.header("x-thoughtform-observation-id"),
    ),
    hostedAttempts: input.hostedAttempts,
    operationId: requestOperationId(input.context.req.raw),
  });
  if (result.status !== WORKSPACE_RESPONSE_STATUSES.responded) {
    return conversationFailureResponse(
      input.context,
      result,
      input.persistenceType,
    );
  }

  if (input.persistenceType === WORKSPACE_PERSISTENCE_TYPES.temporary) {
    const current = await temporaryStore(input.conversations)
      .getCurrentConversation();
    if (!current) {
      return unavailableWorkspaceResponse(input.context);
    }
    return input.context.json(success({
      ...result.response,
      expiresAt: current.expiresAt,
    }), 201);
  }

  return input.context.json(success(result.response), 201);
}

export async function handleConversationStream(
  input: ConversationStreamHandlerInput,
) {
  const prepared = await prepareConversationRequest(input);
  if (prepared instanceof Response) return prepared;

  const createEvents = () => streamResponseInWorkspace({
    conversationId: prepared.conversationId,
    message: prepared.request.message,
    conversation: input.conversation,
    ideaMapAnalysis: input.ideaMapAnalysis ?? noOpIdeaMapAnalyser,
    conversations: input.conversations,
    draftSelection: prepared.request.draftSelection,
    draftChange: prepared.request.draftChange,
    hasDraft: prepared.hasDraft,
    observability: input.observability,
    hostedAttempts: input.hostedAttempts,
    operationId: requestOperationId(input.context.req.raw),
  });

  if (input.persistenceType === WORKSPACE_PERSISTENCE_TYPES.temporary) {
    return conversationStreamResponse(withTemporaryExpiry(
      createEvents(),
      temporaryStore(input.conversations),
    ));
  }

  const correlationId = parseObservationCorrelationId(
    input.context.req.header("x-thoughtform-observation-id"),
  );
  return conversationStreamResponse(observeStream(
    input.observability ?? noOpObservability,
    "thoughtform.workspace.stream_turn",
    {
      [OBSERVATION_ATTRIBUTE_NAMES.operation]:
        CONVERSATION_OPERATION_KINDS.conversationTurn,
      [OBSERVATION_ATTRIBUTE_NAMES.sessionId]:
        prepared.conversationId ?? correlationId ?? globalThis.crypto.randomUUID(),
      ...(correlationId
        ? { [OBSERVATION_ATTRIBUTE_NAMES.correlationId]: correlationId }
        : {}),
    },
    createEvents,
  ));
}

function requestOperationId(request: Request) {
  return request.headers.get("Idempotency-Key")?.trim() ||
    globalThis.crypto.randomUUID();
}

async function prepareConversationRequest(input: {
  context: Context;
  conversationId: string | null;
  draftStore: DraftStore | null;
}) {
  const request = await parseConversationRequest(input.context.req.raw);
  if (!request) {
    return input.context.json(failure(
      CONVERSATION_ERROR_CODES.invalidRequest,
      "Conversation requests require a message and optional conversationId.",
    ), 400);
  }
  const conversationId = input.conversationId ?? request.conversationId;
  const validationFailure = await validateDraftContext(
    input.context,
    conversationId,
    input.draftStore,
    request,
  );
  if (validationFailure) return validationFailure;
  return {
    conversationId,
    hasDraft: Boolean(
      conversationId &&
      (await input.draftStore?.getDraftingState(conversationId))?.draft,
    ),
    request,
  };
}

async function validateDraftContext(
  context: Context,
  conversationId: string | null,
  drafts: DraftStore | null,
  request: ConversationRequest,
) {
  if (
    request.draftSelection &&
    (!conversationId || !await validateDraftSelection({
      conversationId,
      drafts,
      selection: request.draftSelection,
    }))
  ) {
    return context.json(failure(
      CONVERSATION_ERROR_CODES.invalidRequest,
      "The selected draft passage is stale or invalid.",
    ), 409);
  }
  if (
    request.draftChange &&
    (!conversationId || !await validateDraftChange({
      conversationId,
      drafts,
      change: request.draftChange,
    }))
  ) {
    return context.json(failure(
      CONVERSATION_ERROR_CODES.invalidRequest,
      "The saved draft change is stale or invalid.",
    ), 409);
  }
  return null;
}

function conversationFailureResponse(
  context: Context,
  result: Exclude<
    RespondInWorkspaceResult,
    { status: typeof WORKSPACE_RESPONSE_STATUSES.responded }
  >,
  persistenceType: WorkspacePersistenceType,
) {
  if (result.status === CONVERSATION_ERROR_CODES.notFound) {
    return context.json(failure(
      CONVERSATION_ERROR_CODES.notFound,
      "The requested conversation was not found.",
    ), 404);
  }
  if (result.status === CONVERSATION_ERROR_CODES.unavailable) {
    return persistenceType === WORKSPACE_PERSISTENCE_TYPES.temporary
      ? unavailableWorkspaceResponse(context)
      : context.json(failure(
          CONVERSATION_ERROR_CODES.notFound,
          "The requested conversation was not found.",
        ), 404);
  }
  if (result.status === CONVERSATION_ERROR_CODES.conflict) {
    return context.json(failure(
      result.status,
      "The idea map changed while the response was being prepared. Try again.",
    ), 409);
  }
  if (result.status === CONVERSATION_ERROR_CODES.inputTooLarge) {
    return context.json(failure(
      result.status,
      "This conversation is too large to continue. Shorten it and try again.",
    ), 413);
  }
  if (result.status === CONVERSATION_ERROR_CODES.hostedAiDisabled) {
    return context.json(failure(
      result.status,
      "ThoughtForm is currently disabled.",
    ), 503);
  }
  return context.json(failure(
    CONVERSATION_ERROR_CODES.hostedAiUnavailable,
    "ThoughtForm could not respond. Try again shortly.",
  ), 503);
}

function unavailableWorkspaceResponse(context: Context) {
  return context.json(failure(
    CONVERSATION_ERROR_CODES.unavailable,
    "This temporary workspace is no longer available.",
  ), 409);
}

async function* withTemporaryExpiry(
  events: AsyncIterable<ConversationStreamEvent>,
  store: TemporaryConversationStore,
) {
  for await (const event of events) {
    if (event.type === CONVERSATION_STREAM_EVENT_TYPES.assistantCompleted) {
      const current = await store.getCurrentConversation();
      yield { ...event, ...(current ? { expiresAt: current.expiresAt } : {}) };
    } else {
      yield event;
    }
  }
}

function temporaryStore(store: ConversationStore) {
  return store as TemporaryConversationStore;
}

function parseObservationCorrelationId(value: string | undefined) {
  return value && /^[0-9a-f-]{36}$/i.test(value) ? value : undefined;
}
