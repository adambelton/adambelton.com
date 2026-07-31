export type AssistantMove =
  | "probe"
  | "clarify"
  | "challenge"
  | "surface_perspective"
  | "distinguish"
  | "ask_for_example"
  | "partial_reflection"
  | "full_reflection"
  | "branch_check"
  | "suggest_research"
  | "offer_draft"
  | "create_draft"
  | "revise_draft"
  | "offer_publishing";

export type ConversationPhase =
  | "new_conversation"
  | "private_exploration"
  | "deepening"
  | "synthesis"
  | "ready_to_draft"
  | "draft_created"
  | "publishing_intent"
  | "publishing_preparation"
  | "public_draft_ready"
  | "published";

export type ThreadStatus =
  | "surfaced"
  | "needs_fleshing_out"
  | "active"
  | "central"
  | "supporting"
  | "parked"
  | "separate_draft_candidate"
  | "resolved"
  | "discarded";

export type ThreadRelevance =
  | "central"
  | "supporting"
  | "uncertain"
  | "tangential"
  | "not_relevant";

export type ConversationThread = {
  id: string;
  label: string;
  summary: string;
  status: ThreadStatus;
  relevance: ThreadRelevance;
  evidence: string[];
  openQuestions: string[];
};

export type ClaimType =
  | "feeling"
  | "experience"
  | "self_judgement"
  | "moral_claim"
  | "interpretation"
  | "factual_claim"
  | "prediction";

export type ClaimStatus =
  | "accepted_as_feeling"
  | "accepted_as_experience"
  | "needs_clarification"
  | "needs_nuance"
  | "needs_challenge"
  | "research_candidate"
  | "supported"
  | "contradicted"
  | "unclear"
  | "opinion";

export type DetectedClaim = {
  id: string;
  text: string;
  type: ClaimType;
  status: ClaimStatus;
  relatedThreadIds: string[];
};

export type ConversationState = {
  phase: ConversationPhase;
  exploredEnough: boolean;
  nearReadyToReflect: boolean;
  readyToReflect: boolean;
  shouldOfferDraft: boolean;
  centralThought?: string;
  threads: ConversationThread[];
  claims: DetectedClaim[];
};

export type SuggestedReply = {
  label: string;
  message: string;
};

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ConversationRequest = {
  conversationId: string | null;
  message: string;
};

export type ConversationResponse = {
  conversationId: string;
  message: {
    role: "assistant";
    content: string;
  };
  move: AssistantMove;
  state: ConversationState;
  suggestedReplies: SuggestedReply[];
};

export type ConversationSummary = {
  id: string;
  label: string;
  createdAt: string;
  updatedAt: string;
};

export type Conversation = ConversationSummary & {
  messages: ConversationMessage[];
};
