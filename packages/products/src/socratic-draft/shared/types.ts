export const ASSISTANT_MOVES = {
  askForExample: "ask_for_example",
  branchCheck: "branch_check",
  challenge: "challenge",
  clarify: "clarify",
  createDraft: "create_draft",
  distinguish: "distinguish",
  fullReflection: "full_reflection",
  offerDraft: "offer_draft",
  offerPublishing: "offer_publishing",
  partialReflection: "partial_reflection",
  probe: "probe",
  reviseDraft: "revise_draft",
  suggestResearch: "suggest_research",
  surfacePerspective: "surface_perspective",
} as const;

export type AssistantMove =
  (typeof ASSISTANT_MOVES)[keyof typeof ASSISTANT_MOVES];

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

export const CONVERSATION_MESSAGE_ROLES = {
  assistant: "assistant",
  user: "user",
} as const;

export type ConversationMessageRole =
  (typeof CONVERSATION_MESSAGE_ROLES)[keyof typeof CONVERSATION_MESSAGE_ROLES];

export type ConversationMessage = {
  role: ConversationMessageRole;
  content: string;
};

export const CONVERSATION_ERROR_CODES = {
  inputTooLarge: "conversation_input_too_large",
  invalidRequest: "invalid_conversation_request",
  notFound: "conversation_not_found",
  unavailable: "conversation_unavailable",
  hostedAiDisabled: "hosted_ai_disabled",
  hostedAiUnavailable: "hosted_ai_unavailable",
} as const;

export type ConversationErrorCode =
  (typeof CONVERSATION_ERROR_CODES)[keyof typeof CONVERSATION_ERROR_CODES];

export type ConversationRequest = {
  conversationId: string | null;
  message: string;
};

export type ConversationResponse = {
  conversationId: string;
  message: {
    role: typeof CONVERSATION_MESSAGE_ROLES.assistant;
    content: string;
  };
  move: AssistantMove;
  state: ConversationState;
  suggestedReplies: SuggestedReply[];
};

export type TemporaryConversationResponse = ConversationResponse & {
  expiresAt: string;
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

export type TemporaryConversation = {
  conversation: Conversation;
  expiresAt: string;
};
