import { Hono } from "hono";
import type { TemporaryConversationStore } from "packages/products/src/socratic-draft/server/conversation";
import { failure, success } from "packages/shared/src";

export type CreateTemporaryConversationRouteDependencies = {
  getTemporaryConversationStore: (
    request: Request,
  ) => Promise<TemporaryConversationStore | null>;
};

export function createTemporaryConversationRoute({
  getTemporaryConversationStore,
}: CreateTemporaryConversationRouteDependencies) {
  const route = new Hono();

  route.get("/current", async (context) => {
    const conversationStore = await getTemporaryConversationStore(
      context.req.raw,
    );

    if (!conversationStore) {
      return context.json(
        failure("not_found", "The requested resource was not found."),
        404,
      );
    }

    return context.json(success(await conversationStore.getCurrentConversation()));
  });

  route.delete("/current", async (context) => {
    const conversationStore = await getTemporaryConversationStore(
      context.req.raw,
    );

    if (!conversationStore) {
      return context.json(
        failure("not_found", "The requested resource was not found."),
        404,
      );
    }

    await conversationStore.clearCurrentConversation();
    return context.json(success(null));
  });

  return route;
}
