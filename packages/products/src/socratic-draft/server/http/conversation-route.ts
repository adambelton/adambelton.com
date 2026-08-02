import { Hono } from "hono";
import {
  ConversationService,
} from "packages/products/src/socratic-draft/server/conversation";
import type {
  TemporaryConversationStore,
} from "packages/products/src/socratic-draft/server/conversation";
import {
  respondInWorkspace,
  type ConversationResponder,
} from "packages/products/src/socratic-draft/server/workspace";
import { parseConversationRequest } from "packages/products/src/socratic-draft/server/http/conversation-request";
import { handleIdeaActionRequest } from "packages/products/src/socratic-draft/server/http/idea-action-handler";
import { CONVERSATION_ERROR_CODES } from "packages/products/src/socratic-draft/shared";
import { failure, success } from "packages/shared/src";
import type { DraftStore } from "packages/products/src/socratic-draft/server/draft";
import { validateDraftSelection } from "packages/products/src/socratic-draft/server/http/draft-selection-context";

export type CreateConversationRouteDependencies = {
  conversationStore?: TemporaryConversationStore;
  getConversationStore?: (
    request: Request,
  ) => Promise<TemporaryConversationStore | null>;
  conversationService?: ConversationResponder;
  getDraftStore?: (request: Request) => Promise<DraftStore | null>;
};

export function createConversationRoute({
  conversationStore,
  getConversationStore,
  conversationService = new ConversationService(),
  getDraftStore,
}: CreateConversationRouteDependencies) {
  const route = new Hono();
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
    if (
      request.draftSelection &&
      (!conversationId || !await validateDraftSelection({
        conversationId,
        drafts: getDraftStore ? await getDraftStore(context.req.raw) : null,
        selection: request.draftSelection,
      }))
    ) {
      return context.json(failure(
        CONVERSATION_ERROR_CODES.invalidRequest,
        "The selected draft passage is stale or invalid.",
      ), 409);
    }

    const result = await respondInWorkspace({
      conversationId: request.conversationId,
      message: request.message,
      conversation: conversationService,
      conversations: requestConversationStore,
      draftSelection: request.draftSelection,
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
          "The Socratic Draft is currently disabled.",
        ),
        503,
      );
    }

    if (result.status === CONVERSATION_ERROR_CODES.hostedAiUnavailable) {
      return context.json(
        failure(
          CONVERSATION_ERROR_CODES.hostedAiUnavailable,
          "The Socratic Draft could not respond. Try again shortly.",
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
