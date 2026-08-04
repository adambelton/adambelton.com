import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { ConversationService } from "packages/products/src/socratic-draft/server/capabilities/conversation";
import { createSocraticDraftApiRoute } from "packages/products/src/socratic-draft/server/delivery/http";
import { createDiscoveryTestModel } from "packages/products/src/socratic-draft/testing/fixtures/discovery-scenario";
import { createTestConversationStore } from "packages/products/src/socratic-draft/testing/fakes/test-conversation-persistence";
import { createDraftStore } from "packages/products/src/socratic-draft/server/capabilities/drafting";
import { TestDraftPersistence } from "packages/products/src/socratic-draft/testing/fakes/test-draft-persistence";
import {
  IDEA_DISPOSITIONS,
  IDEA_EXPLORATION_ASSESSMENTS,
  IDEA_IMPORTANCE_ASSESSMENTS,
} from "packages/products/src/socratic-draft/shared";

const port = Number(process.env.PORT ?? 8788);
let conversationStore = createTestConversationStore();
let draftStore = createDraftStore(new TestDraftPersistence());
const discoveryModel = createDiscoveryTestModel();
const conversationService = new ConversationService({
  conversationModel: {
    createResponse: (request) => request.system.includes("explicitly attached")
      ? Promise.resolve({ content: JSON.stringify({
          response: "What feels most important to examine in that passage?",
          move: "probe",
          assistantReadiness: [],
          userIntention: null,
          proposedIdeas: null,
          ideaActions: null,
        }) })
      : discoveryModel.createResponse(request),
  },
});
const app = new Hono();

app.post("/testing/reset", (context) => {
  conversationStore = createTestConversationStore();
  draftStore = createDraftStore(new TestDraftPersistence());
  return context.json({ ok: true });
});

app.post("/testing/draft-workspace", async (context) => {
  const conversationId = "draft-browser-conversation";
  await conversationStore.appendConversationTurn({
    conversationId,
    operationId: "seed-draft-browser-workspace",
    expectedIdeaMapRevision: 0,
    userMessage: { role: "user", content: "Accountability is the central argument." },
    assistantMessage: { role: "assistant", content: "That gives the writing a clear centre." },
    ideaMap: {
      revision: 1,
      ideas: [{
        id: "idea-accountability",
        title: "Accountability gives legitimacy",
        synthesis: "Authority depends on accountability.",
        substance: "Football gives its institutions legitimacy, so their leaders must remain answerable to football's communities.",
        unresolvedQuestions: [],
        disposition: IDEA_DISPOSITIONS.active,
        assistantAssessment: {
          exploration: IDEA_EXPLORATION_ASSESSMENTS.wellExplored,
          importance: IDEA_IMPORTANCE_ASSESSMENTS.central,
        },
        userInterpretation: null,
      }],
    },
  });
  return context.json({ ok: true, conversationId });
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
    getPersistentDraftStore: async () => null,
    getTemporaryDraftStore: async () => draftStore,
    compositionModel: {
      compose: async ({ selectedIdeas }) => ({
        body: selectedIdeas.map((idea) => idea.substance).join("\n\n"),
      }),
    },
    proposalModel: {
      propose: async ({ originalContent, userInstruction }) => ({
        proposedContent: `${originalContent}\n\n${userInstruction}`,
        intendedEffect: userInstruction,
      }),
    },
  }),
);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(
    `Socratic Draft test API listening on http://127.0.0.1:${info.port}`,
  );
});
