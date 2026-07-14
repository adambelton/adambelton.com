import { Hono } from "hono";
import { createConversationRoute } from "apps/api/src/routes/socratic-draft/conversation";
import { createInMemoryEntryStore } from "apps/api/src/routes/socratic-draft/in-memory-entry-store";

export const socraticDraftRoute = new Hono();

const entryStore = createInMemoryEntryStore();

socraticDraftRoute.route(
  "/conversation",
  createConversationRoute({
    entryStore,
  }),
);
