import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { ConversationService } from "packages/products/src/socratic-draft/server/conversation";
import { createSocraticDraftApiRoute } from "packages/products/src/socratic-draft/server/http";
import { createDiscoveryTestModel } from "packages/products/src/socratic-draft/testing/discovery-scenario";
import { TestConversationStore } from "packages/products/src/socratic-draft/testing/test-conversation-store";

const port = Number(process.env.PORT ?? 8788);
let conversationStore = new TestConversationStore();
const conversationService = new ConversationService({
  conversationModel: createDiscoveryTestModel(),
});
const app = new Hono();

app.post("/testing/reset", (context) => {
  conversationStore = new TestConversationStore();
  return context.json({ ok: true });
});

app.use("/products/socratic-draft/conversation/respond", async (_context, next) => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  await next();
});

app.route(
  "/products/socratic-draft",
  createSocraticDraftApiRoute({
    conversationService,
    getConversationStore: async () => conversationStore,
    getTemporaryConversationStore: async () => conversationStore,
    getPersistentConversationStore: async () => null,
  }),
);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(
    `Socratic Draft test API listening on http://127.0.0.1:${info.port}`,
  );
});
