import { Hono } from "hono";
import { createConversationRoute } from "apps/api/src/routes/socratic-draft/conversation";
import { createSocraticDraftEntryStore } from "apps/api/src/routes/socratic-draft/entry-store";

export const socraticDraftRoute = new Hono();

const entryStore = createSocraticDraftEntryStore();

socraticDraftRoute.route(
  "/conversation",
  createConversationRoute({
    entryStore,
  }),
);
