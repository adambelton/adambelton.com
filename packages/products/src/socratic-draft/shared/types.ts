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

export const ACTIVITIES = {
  articulation: "articulation",
  discovery: "discovery",
} as const;

export type Activity = (typeof ACTIVITIES)[keyof typeof ACTIVITIES];

export const READINESS_ACTIONS = {
  compose: "compose",
  reflect: "reflect",
} as const;

export type ReadinessAction =
  (typeof READINESS_ACTIONS)[keyof typeof READINESS_ACTIONS];

export const READINESS_ASSESSMENTS = {
  notReady: "not_ready",
  ready: "ready",
  readyWithUncertainty: "ready_with_uncertainty",
} as const;

export type ReadinessAssessment =
  (typeof READINESS_ASSESSMENTS)[keyof typeof READINESS_ASSESSMENTS];

export type AssistantReadiness = {
  action: ReadinessAction;
  assessment: ReadinessAssessment;
  explanation?: string;
};

export const USER_INTENTIONS = {
  articulate: "articulate",
  compose: "compose",
  explore: "explore",
  reflect: "reflect",
} as const;

export type UserIntention =
  (typeof USER_INTENTIONS)[keyof typeof USER_INTENTIONS];

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
  activity: Activity;
  move: AssistantMove;
  assistantReadiness: AssistantReadiness[];
  userIntention: UserIntention | null;
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
