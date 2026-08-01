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
import { parseConversationMessage } from "packages/products/src/socratic-draft/server/http/conversation-request";
import { CONVERSATION_ERROR_CODES } from "packages/products/src/socratic-draft/shared";
import { failure, success } from "packages/shared/src";

export type CreateConversationsRouteDependencies = {
  getPersistentConversationStore: (
    request: Request,
  ) => Promise<PersistentConversationStore | null>;
  conversationService?: ConversationResponder;
};

export function createConversationsRoute({
  getPersistentConversationStore,
  conversationService = new ConversationService(),
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
    const message = await parseConversationMessage(context.req.raw);

    if (typeof message !== "string") {
      return context.json(
        failure(
          CONVERSATION_ERROR_CODES.invalidRequest,
          "Conversation requests require a message.",
        ),
        400,
      );
    }

    const result = await respondInWorkspace({
      conversationId,
      message,
      conversation: conversationService,
      conversations: conversationStore,
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

  return route;
}
