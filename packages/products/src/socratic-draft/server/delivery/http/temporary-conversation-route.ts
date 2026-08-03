import { Hono } from "hono";
import type { TemporaryConversationStore } from "packages/products/src/socratic-draft/server/capabilities/conversation";
import { failure, success } from "packages/shared/src";
import type { DraftStore } from "packages/products/src/socratic-draft/server/capabilities/drafting";

export type CreateTemporaryConversationRouteDependencies = {
  getTemporaryConversationStore: (
    request: Request,
  ) => Promise<TemporaryConversationStore | null>;
  getTemporaryDraftStore?: (request: Request) => Promise<DraftStore | null>;
};

export function createTemporaryConversationRoute({
  getTemporaryConversationStore,
  getTemporaryDraftStore,
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

    const current = await conversationStore.getCurrentConversation();
    if (current && getTemporaryDraftStore) {
      const drafts = await getTemporaryDraftStore(context.req.raw);
      await drafts?.deleteDraftingState(current.conversation.id);
    }
    await conversationStore.clearCurrentConversation();
    return context.json(success(null));
  });

  return route;
}
