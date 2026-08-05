import { Hono } from "hono";
import { ConversationService } from "packages/products/src/thoughtform/server/capabilities/conversation";
import type {
  TemporaryConversationStore,
} from "packages/products/src/thoughtform/server/capabilities/conversation";
import {
  respondInWorkspace,
  streamResponseInWorkspace,
  type IdeaMapAnalyser,
  type ConversationResponder,
  type StreamingConversationResponder,
  noOpIdeaMapAnalyser,
} from "packages/products/src/thoughtform/server/application/workspace";
import { parseConversationRequest } from "packages/products/src/thoughtform/server/delivery/http/conversation-request";
import { handleIdeaActionRequest } from "packages/products/src/thoughtform/server/delivery/http/idea-action-handler";
import { CONVERSATION_ERROR_CODES } from "packages/products/src/thoughtform/shared";
import { failure, success } from "packages/shared/src";
import type { DraftStore } from "packages/products/src/thoughtform/server/capabilities/drafting";
import { validateDraftSelection } from "packages/products/src/thoughtform/server/delivery/http/draft-selection-context";
import { validateDraftChange } from "packages/products/src/thoughtform/server/delivery/http/draft-change-context";
import { conversationStreamResponse } from "packages/products/src/thoughtform/server/delivery/http/conversation-stream-response";

export type CreateConversationRouteDependencies = {
  conversationStore?: TemporaryConversationStore;
  getConversationStore?: (
    request: Request,
  ) => Promise<TemporaryConversationStore | null>;
  conversationService?: ConversationResponder;
  streamingConversationService?: StreamingConversationResponder;
  ideaMapAnalysis?: IdeaMapAnalyser;
  getDraftStore?: (request: Request) => Promise<DraftStore | null>;
};

export function createConversationRoute({
  conversationStore,
  getConversationStore,
  conversationService = new ConversationService(),
  streamingConversationService = new ConversationService(),
  ideaMapAnalysis,
  getDraftStore,
}: CreateConversationRouteDependencies) {
  const route = new Hono();
  route.post("/respond-stream", async (context) => {
    const store = getConversationStore
      ? await getConversationStore(context.req.raw)
      : conversationStore;
    if (!store) {
      return context.json(failure("unauthorized", "Sign in to continue the conversation."), 401);
    }
    const request = await parseConversationRequest(context.req.raw);
    if (!request) {
      return context.json(failure(
        CONVERSATION_ERROR_CODES.invalidRequest,
        "Conversation requests require a message and optional conversationId.",
      ), 400);
    }
    const draftStore = getDraftStore ? await getDraftStore(context.req.raw) : null;
    const hasDraft = Boolean(
      request.conversationId &&
      (await draftStore?.getDraftingState(request.conversationId))?.draft,
    );
    if (
      request.draftSelection &&
      (!request.conversationId || !await validateDraftSelection({
        conversationId: request.conversationId,
        drafts: draftStore,
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
      (!request.conversationId || !await validateDraftChange({
        conversationId: request.conversationId,
        drafts: draftStore,
        change: request.draftChange,
      }))
    ) {
      return context.json(failure(
        CONVERSATION_ERROR_CODES.invalidRequest,
        "The saved draft change is stale or invalid.",
      ), 409);
    }
    return conversationStreamResponse(streamTemporaryEvents({
      events: streamResponseInWorkspace({
        conversationId: request.conversationId,
        message: request.message,
        conversation: streamingConversationService,
        ideaMapAnalysis: ideaMapAnalysis ?? noOpIdeaMapAnalyser,
        conversations: store,
        draftSelection: request.draftSelection,
        draftChange: request.draftChange,
        hasDraft,
      }),
      store,
    }));
  });
  route.post("/respond", async (context) => {
    const requestConversationStore = getConversationStore
      ? await getConversationStore(context.req.raw)
      : conversationStore;

    if (!requestConversationStore) {
      return context.json(
        failure("unauthorized", "Sign in to continue the conversation."),
        401,
      );
    }

    const request = await parseConversationRequest(context.req.raw);

    if (!request) {
      return context.json(
        failure(
          CONVERSATION_ERROR_CODES.invalidRequest,
          "Conversation requests require a message and optional conversationId.",
        ),
        400,
      );
    }

    const conversationId = request.conversationId;
    const draftStore = getDraftStore ? await getDraftStore(context.req.raw) : null;
    const hasDraft = Boolean(
      conversationId &&
      (await draftStore?.getDraftingState(conversationId))?.draft,
    );
    if (
      request.draftSelection &&
      (!conversationId || !await validateDraftSelection({
        conversationId,
        drafts: draftStore,
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
        drafts: draftStore,
        change: request.draftChange,
      }))
    ) {
      return context.json(failure(
        CONVERSATION_ERROR_CODES.invalidRequest,
        "The saved draft change is stale or invalid.",
      ), 409);
    }

    const result = await respondInWorkspace({
      conversationId: request.conversationId,
      message: request.message,
      conversation: conversationService,
      conversations: requestConversationStore,
      draftSelection: request.draftSelection,
      draftChange: request.draftChange,
      hasDraft,
    });

    if (result.status === CONVERSATION_ERROR_CODES.notFound) {
      return context.json(
        failure(
          CONVERSATION_ERROR_CODES.notFound,
          "The requested conversation was not found.",
        ),
        404,
      );
    }

    if (result.status === CONVERSATION_ERROR_CODES.unavailable) {
      return context.json(
        failure(
          CONVERSATION_ERROR_CODES.unavailable,
          "This temporary conversation is no longer available.",
        ),
        409,
      );
    }

    if (result.status === CONVERSATION_ERROR_CODES.conflict) {
      return context.json(
        failure(result.status, "The idea map changed while the response was being prepared. Try again."),
        409,
      );
    }

    if (result.status === CONVERSATION_ERROR_CODES.inputTooLarge) {
      return context.json(
        failure(
          CONVERSATION_ERROR_CODES.inputTooLarge,
          "This conversation is too large to continue. Shorten it and try again.",
        ),
        413,
      );
    }

    if (result.status === CONVERSATION_ERROR_CODES.hostedAiDisabled) {
      return context.json(
        failure(
          CONVERSATION_ERROR_CODES.hostedAiDisabled,
          "ThoughtForm is currently disabled.",
        ),
        503,
      );
    }

    if (result.status === CONVERSATION_ERROR_CODES.hostedAiUnavailable) {
      return context.json(
        failure(
          CONVERSATION_ERROR_CODES.hostedAiUnavailable,
          "ThoughtForm could not respond. Try again shortly.",
        ),
        503,
      );
    }

    const temporaryConversation =
      await requestConversationStore.getCurrentConversation();

    if (!temporaryConversation) {
      return context.json(
        failure(
          CONVERSATION_ERROR_CODES.unavailable,
          "This temporary conversation is no longer available.",
        ),
        409,
      );
    }

    return context.json(
      success({
        ...result.response,
        expiresAt: temporaryConversation.expiresAt,
      }),
      201,
    );
  });

  route.post("/:conversationId/ideas/:ideaId", async (context) => {
    const store = getConversationStore
      ? await getConversationStore(context.req.raw)
      : conversationStore;
    if (!store) {
      return context.json(failure("unauthorized", "Sign in to continue."), 401);
    }
    return handleIdeaActionRequest({
      request: context.req.raw,
      conversationId: context.req.param("conversationId"),
      ideaId: context.req.param("ideaId"),
      conversations: store,
    });
  });

  return route;
}

async function* streamTemporaryEvents(input: {
  events: AsyncIterable<import("packages/products/src/thoughtform/shared").ConversationStreamEvent>;
  store: TemporaryConversationStore;
}) {
  for await (const event of input.events) {
    if (event.type === "assistant_completed") {
      const current = await input.store.getCurrentConversation();
      yield { ...event, ...(current ? { expiresAt: current.expiresAt } : {}) };
    } else {
      yield event;
    }
  }
}
