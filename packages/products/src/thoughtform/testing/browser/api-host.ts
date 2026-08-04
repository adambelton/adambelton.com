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

const port = Number(process.env.PORT ?? 8788);
let conversationStore = createTestConversationStore();
let draftStore = createDraftStore(new TestDraftPersistence());
let useConversationalThinkingScenario = false;
const discoveryModel = createDiscoveryTestModel();
const conversationService = new ConversationService({
  conversationModel: {
    createResponse: (request) => useConversationalThinkingScenario
      ? Promise.resolve(createConversationalThinkingResponse(request))
      : request.system.includes("explicitly attached")
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
  useConversationalThinkingScenario = false;
  return context.json({ ok: true });
});

app.post("/testing/conversational-thinking", (context) => {
  conversationStore = createTestConversationStore();
  draftStore = createDraftStore(new TestDraftPersistence());
  useConversationalThinkingScenario = true;
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

app.use("/products/thoughtform/conversation/respond", async (_context, next) => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  await next();
});

app.route(
  "/products/thoughtform",
  createThoughtFormApiRoute({
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
  }),
);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(
    `ThoughtForm test API listening on http://127.0.0.1:${info.port}`,
  );
});

function createConversationalThinkingResponse(request: ConversationModelRequest) {
  const message = request.messages.filter((entry) => entry.role === "user").at(-1)?.content ?? "";
  const mapMarker = "Current idea map: ";
  const map = JSON.parse(request.system.slice(request.system.lastIndexOf(mapMarker) + mapMarker.length)) as {
    ideas: Array<{ id: string; title: string }>;
  };
  const cases = [
    {
      match: "friendship ended",
      response: "The relief seems connected to no longer performing a closeness that felt unsafe. What did honesty require that the friendship could no longer hold?",
      title: "Relief after an ending",
      synthesis: "I feel relief because I no longer have to perform closeness where honesty felt unsafe.",
      substance: "I felt unexpectedly relieved when a long friendship ended. I had been performing closeness after I stopped feeling safe enough to be honest.",
      question: "What did honesty require that the friendship could no longer hold?",
    },
    {
      match: "new role",
      response: "Pride and resentment are both present, and neither has to cancel the other. What freedom are you grieving as you choose the opportunity?",
      title: "Pride and grief can coexist",
      synthesis: "I am proud of the opportunity and grieving the freedom it will cost me.",
      substance: "I want the new role and I resent what it will take from my life. Both feelings are truthful, and I am not ready to reconcile them.",
      question: "What freedom am I grieving as I choose this opportunity?",
    },
    {
      match: "two job offers",
      response: "The decision turns on autonomy versus security, not on finding an objectively correct option. Which loss would be harder for you to accept?",
      title: "Autonomy or security",
      synthesis: "I am choosing between autonomy and security.",
      substance: "I have two job offers. One offers autonomy and the other offers security; I need to decide which loss I can accept.",
      question: "Which loss would be harder for me to accept?",
    },
    {
      match: "convenience hides",
      response: "Your claim distinguishes convenience itself from costs made invisible to its beneficiary. Where does that distinction become most important?",
      title: "Invisible costs of convenience",
      synthesis: "I question convenience when it hides who bears its cost.",
      substance: "I do not think convenience is inherently bad. I think it deserves scrutiny when effort and cost merely become invisible to the beneficiary.",
      question: "Where does this distinction become most important?",
    },
    {
      match: "articulate this now",
      response: "You want to leave and feel guilty about wanting it; that unresolved tension is already enough to articulate. You can create a Draft now if seeing those words together would help.",
      title: "Wanting to leave",
      synthesis: "I want to leave, and I feel guilty about wanting it.",
      substance: "I want to leave, and I feel guilty about wanting it. I do not yet know what that guilt means, and I do not need to resolve it before saying what is true now.",
      question: "What does my guilt seem to ask of me?",
      move: "offer_draft",
    },
    {
      match: "not more control",
      response: "The correction is that control is not the issue; the unspoken deliberate trade-off is. What would naming that trade-off make possible?",
      title: "The unnamed trade-off",
      synthesis: "I am frustrated that nobody will name the trade-off we deliberately chose.",
      substance: "My frustration is not about needing more control or merely about delay. It is about nobody naming the trade-off we deliberately chose.",
      question: "What would naming the trade-off make possible?",
    },
  ];
  const selected = cases.find((candidate) => message.includes(candidate.match)) ?? cases[0]!;
  const existing = map.ideas.find((idea) => idea.title === selected.title);
  return { content: JSON.stringify({
    response: selected.response,
    move: selected.move ?? "partial_reflection",
    assistantReadiness: [
      { action: "reflect", assessment: "ready_with_uncertainty", explanation: "The current shape can be reflected without resolving it." },
      { action: "compose", assessment: "ready_with_uncertainty", explanation: "A brief articulation can preserve what remains open." },
    ],
    userIntention: selected.move ? "compose" : "explore",
    proposedIdeas: [{
      id: existing?.id ?? null,
      title: selected.title,
      synthesis: selected.synthesis,
      substance: selected.substance,
      unresolvedQuestions: [selected.question],
      disposition: "active",
      assistantAssessment: { exploration: "developing", importance: "central" },
      evidence: [{ quote: message }],
    }],
    ideaActions: null,
    resolvedPotentialConflictIds: null,
  }) };
}
