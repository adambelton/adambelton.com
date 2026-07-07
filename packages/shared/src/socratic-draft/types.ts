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
  | "offer_composition"
  | "compose_private"
  | "revise_private_entry"
  | "offer_publishing";

export type ConversationPhase =
  | "new_entry"
  | "private_exploration"
  | "deepening"
  | "synthesis"
  | "ready_to_compose"
  | "private_entry_composed"
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
  | "separate_entry_candidate"
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

export type EntryConversationState = {
  phase: ConversationPhase;
  exploredEnough: boolean;
  nearReadyToReflect: boolean;
  readyToReflect: boolean;
  shouldOfferComposition: boolean;
  centralThought?: string;
  threads: ConversationThread[];
  claims: DetectedClaim[];
};

export type SuggestedReply = {
  label: string;
  message: string;
};

export type SocraticDraftConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type SocraticDraftConversationRequest = {
  entryId: string | null;
  message: string;
};

export type SocraticDraftConversationResponse = {
  entryId: string;
  message: {
    role: "assistant";
    content: string;
  };
  move: AssistantMove;
  state: EntryConversationState;
  suggestedReplies: SuggestedReply[];
};
