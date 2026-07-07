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

export type EntryConversationState = {
  phase: ConversationPhase;
  exploredEnough: boolean;
  nearReadyToReflect: boolean;
  readyToReflect: boolean;
  shouldOfferComposition: boolean;
  centralThought?: string;
  threads: unknown[];
  claims: unknown[];
};
