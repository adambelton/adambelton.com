import { Hono } from "hono";
import {
  ConversationService,
} from "packages/products/src/socratic-draft/server/conversation";
import type {
  PersistentConversationStore,
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
import { validateDraftChange } from "packages/products/src/socratic-draft/server/http/draft-change-context";

export type CreateConversationsRouteDependencies = {
  getPersistentConversationStore: (
    request: Request,
  ) => Promise<PersistentConversationStore | null>;
  conversationService?: ConversationResponder;
  getPersistentDraftStore?: (request: Request) => Promise<DraftStore | null>;
};

export function createConversationsRoute({
  getPersistentConversationStore,
  conversationService = new ConversationService(),
  getPersistentDraftStore,
}: CreateConversationsRouteDependencies) {
  const route = new Hono();

  route.post("/", async (context) => {
    const conversationStore = await getPersistentConversationStore(
      context.req.raw,
    );

    if (!conversationStore) {
      return context.json(
        failure("not_found", "The requested resource was not found."),
        404,
      );
    }

    return context.json(
      success(await conversationStore.createConversation()),
      201,
    );
  });

  route.get("/", async (context) => {
    const conversationStore = await getPersistentConversationStore(
      context.req.raw,
    );

    if (!conversationStore) {
      return context.json(
        failure("not_found", "The requested resource was not found."),
        404,
      );
    }

    return context.json(success(await conversationStore.listConversations()));
  });

  route.get("/:conversationId", async (context) => {
    const conversationStore = await getPersistentConversationStore(
      context.req.raw,
    );

    if (!conversationStore) {
      return context.json(
        failure("not_found", "The requested resource was not found."),
        404,
      );
    }

    const conversation = await conversationStore.getConversation(
      context.req.param("conversationId"),
    );

    if (!conversation) {
      return context.json(
        failure(
          CONVERSATION_ERROR_CODES.notFound,
          "The requested conversation was not found.",
        ),
        404,
      );
    }

    return context.json(success(conversation));
  });

  route.post("/:conversationId/respond", async (context) => {
    const conversationStore = await getPersistentConversationStore(
      context.req.raw,
    );

    if (!conversationStore) {
      return context.json(
        failure("not_found", "The requested resource was not found."),
        404,
      );
    }

    const conversationId = context.req.param("conversationId");
    const request = await parseConversationRequest(context.req.raw);

    if (!request) {
      return context.json(
        failure(
          CONVERSATION_ERROR_CODES.invalidRequest,
          "Conversation requests require a message.",
        ),
        400,
      );
    }

    const draftStore = getPersistentDraftStore
      ? await getPersistentDraftStore(context.req.raw)
      : null;
    const hasDraft = Boolean(
      (await draftStore?.getDraftWorkspace(conversationId))?.draft,
    );
    if (request.draftSelection && !await validateDraftSelection({
      conversationId,
      drafts: draftStore,
      selection: request.draftSelection,
    })) {
      return context.json(failure(
        CONVERSATION_ERROR_CODES.invalidRequest,
        "The selected draft passage is stale or invalid.",
      ), 409);
    }
    if (request.draftChange && !await validateDraftChange({
      conversationId,
      drafts: draftStore,
      change: request.draftChange,
    })) {
      return context.json(failure(
        CONVERSATION_ERROR_CODES.invalidRequest,
        "The saved draft change is stale or invalid.",
      ), 409);
    }

    const result = await respondInWorkspace({
      conversationId,
      message: request.message,
      conversation: conversationService,
      conversations: conversationStore,
      draftSelection: request.draftSelection,
      draftChange: request.draftChange,
      hasDraft,
    });

    if (
      result.status === CONVERSATION_ERROR_CODES.notFound ||
      result.status === CONVERSATION_ERROR_CODES.unavailable
    ) {
      return context.json(
        failure(
          CONVERSATION_ERROR_CODES.notFound,
          "The requested conversation was not found.",
        ),
        404,
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

    if (result.status === CONVERSATION_ERROR_CODES.conflict) {
      return context.json(
        failure(result.status, "The idea map changed while the response was being prepared. Try again."),
        409,
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

    return context.json(success(result.response), 201);
  });

  route.post("/:conversationId/ideas/:ideaId", async (context) => {
    const store = await getPersistentConversationStore(context.req.raw);
    if (!store) {
      return context.json(failure("not_found", "The requested resource was not found."), 404);
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
