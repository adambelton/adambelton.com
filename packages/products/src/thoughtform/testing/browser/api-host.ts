import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { ConversationService, type ConversationModelRequest } from "packages/products/src/thoughtform/server/capabilities/conversation";
import { createThoughtFormApiRoute } from "packages/products/src/thoughtform/server/delivery/http";
import { createDiscoveryTestModel } from "packages/products/src/thoughtform/testing/fixtures/discovery-scenario";
import { createTestConversationStore } from "packages/products/src/thoughtform/testing/fakes/test-conversation-persistence";
import { createDraftStore } from "packages/products/src/thoughtform/server/capabilities/drafting";
import { TestDraftPersistence } from "packages/products/src/thoughtform/testing/fakes/test-draft-persistence";
import {
  IDEA_DISPOSITIONS,
  IDEA_EXPLORATION_ASSESSMENTS,
  IDEA_IMPORTANCE_ASSESSMENTS,
} from "packages/products/src/thoughtform/shared";
import { hasAttachedDraftMaterial } from "packages/products/src/thoughtform/testing/fixtures/workspace-context";
import { IdeaMapAnalysisService } from "packages/products/src/thoughtform/server/capabilities/idea-map";
import {
  createConversationalThinkingResponse,
  selectIdeaMapAnalysis,
} from "packages/products/src/thoughtform/testing/fixtures/conversational-thinking-scenario";

const port = Number(process.env.PORT ?? 8788);
let conversationStore = createTestConversationStore();
let draftStore = createDraftStore(new TestDraftPersistence());
let shouldUseConversationalThinkingScenario = false;
const discoveryModel = createDiscoveryTestModel();
const conversationService = new ConversationService({
  conversationModel: {
    createResponse: (request) => shouldUseConversationalThinkingScenario
      ? Promise.resolve(createConversationalThinkingResponse(request))
      : hasAttachedDraftMaterial(request.context)
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
const ideaMapAnalysis = new IdeaMapAnalysisService({
  async createAnalysis(request) {
    const combined = shouldUseConversationalThinkingScenario
      ? await createConversationalThinkingResponse(request as ConversationModelRequest)
      : hasAttachedDraftMaterial(request.context)
        ? { content: JSON.stringify({
            proposedIdeas: null,
            ideaActions: null,
            resolvedPotentialConflictIds: null,
          }) }
        : await discoveryModel.createResponse(request as ConversationModelRequest);
    return selectIdeaMapAnalysis(combined.content, request);
  },
});
const app = new Hono();

app.get("/products/thoughtform/ai-disclosure", (context) => context.json({
  ok: true,
  data: {
    activeProvider: {
      id: "anthropic",
      name: "Anthropic",
      service: "Claude API",
      retentionSummary: "Test retention summary.",
      trainingSummary: "Test training summary.",
      policyUrl: "https://example.com/anthropic",
    },
    supportedProviders: [{
      id: "anthropic",
      name: "Anthropic",
      service: "Claude API",
      retentionSummary: "Test retention summary.",
      trainingSummary: "Test training summary.",
      policyUrl: "https://example.com/anthropic",
    }],
  },
}));

app.post("/testing/reset", (context) => {
  conversationStore = createTestConversationStore();
  draftStore = createDraftStore(new TestDraftPersistence());
  shouldUseConversationalThinkingScenario = false;
  return context.json({ ok: true });
});

app.post("/testing/conversational-thinking", (context) => {
  conversationStore = createTestConversationStore();
  draftStore = createDraftStore(new TestDraftPersistence());
  shouldUseConversationalThinkingScenario = true;
  return context.json({ ok: true });
});

app.post("/testing/draft-workspace", async (context) => {
  const conversationId = "draft-browser-conversation";
  await conversationStore.appendConversationTurn({
    conversationId,
    operationId: "seed-draft-browser-workspace",
    expectedMessageCount: 0,
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

app.use("/products/thoughtform/conversation/respond-stream", async (_context, next) => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  await next();
});

app.route("/products/thoughtform", createThoughtFormApiRoute({
  conversationService,
  streamingConversationService: conversationService,
  ideaMapAnalysis,
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
  interpretationModel: {
    interpret: async () => ({
      type: "conceptual_change",
      assistantMessage: "It sounds as though this edit changes what matters to you. Is that right?",
      potentialConflicts: [],
    }),
  },
  proposalModel: {
    propose: async ({ originalContent, userInstruction }) => ({
      proposedContent: `${originalContent}\n\n${userInstruction}`,
      intendedEffect: userInstruction,
    }),
  },
}));

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`ThoughtForm test API listening on http://127.0.0.1:${info.port}`);
});
