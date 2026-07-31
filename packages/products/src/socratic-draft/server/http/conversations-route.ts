import { Hono } from "hono";
import type { PersistentConversationStore } from "packages/products/src/socratic-draft/server/conversation";
import { failure, success } from "packages/shared/src";

export type CreateConversationsRouteDependencies = {
  getPersistentConversationStore: (
    request: Request,
  ) => Promise<PersistentConversationStore | null>;
};

export function createConversationsRoute({
  getPersistentConversationStore,
}: CreateConversationsRouteDependencies) {
  const route = new Hono();

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

  return route;
}
