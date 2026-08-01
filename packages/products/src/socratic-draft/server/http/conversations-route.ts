import { Hono } from "hono";
import {
  ConversationService,
  respondToConversation,
} from "packages/products/src/socratic-draft/server/conversation";
import type {
  ConversationResponder,
  PersistentConversationStore,
} from "packages/products/src/socratic-draft/server/conversation";
import { parseConversationMessage } from "packages/products/src/socratic-draft/server/http/conversation-request";
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
          "conversation_not_found",
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
          "invalid_conversation_request",
          "Conversation requests require a message.",
        ),
        400,
      );
    }

    const result = await respondToConversation({
      conversationId,
      message,
      conversationService,
      conversationStore,
    });

    if (result.status !== "responded") {
      return context.json(
        failure(
          "conversation_not_found",
          "The requested conversation was not found.",
        ),
        404,
      );
    }

    return context.json(success(result.response), 201);
  });

  return route;
}
