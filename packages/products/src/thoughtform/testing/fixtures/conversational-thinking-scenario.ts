import type { ConversationModelRequest } from "packages/products/src/thoughtform/server/capabilities/conversation";
import type { IdeaMapAnalysisModelRequest } from "packages/products/src/thoughtform/server/capabilities/idea-map";
import { readIdeaMapFromWorkspaceContext } from "packages/products/src/thoughtform/testing/fixtures/workspace-context";

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
    question: "What would naming that trade-off make possible?",
  },
];

export function createConversationalThinkingResponse(request: ConversationModelRequest) {
  const message = request.messages.filter((entry) => entry.role === "user").at(-1)?.content ?? "";
  const map = readIdeaMapFromWorkspaceContext<{
    ideas: Array<{ id: string; title: string }>;
  }>(request.context);
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

export function selectIdeaMapAnalysis(
  content: string,
  _request: IdeaMapAnalysisModelRequest,
) {
  const parsed = JSON.parse(content) as Record<string, unknown>;
  return { content: JSON.stringify({
    proposedIdeas: parsed.proposedIdeas ?? null,
    ideaActions: parsed.ideaActions ?? null,
    resolvedPotentialConflictIds: parsed.resolvedPotentialConflictIds ?? null,
  }) };
}
