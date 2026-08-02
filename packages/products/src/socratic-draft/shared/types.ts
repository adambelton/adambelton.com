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
  composition: "composition",
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

export interface AssistantReadiness {
  action: ReadinessAction;
  assessment: ReadinessAssessment;
  explanation?: string;
}

export const USER_INTENTIONS = {
  compose: "compose",
  explore: "explore",
  reflect: "reflect",
} as const;

export type UserIntention =
  (typeof USER_INTENTIONS)[keyof typeof USER_INTENTIONS];

export const IDEA_EXPLORATION_ASSESSMENTS = {
  emerging: "emerging",
  developing: "developing",
  wellExplored: "well_explored",
} as const;

export type IdeaExplorationAssessment =
  (typeof IDEA_EXPLORATION_ASSESSMENTS)[keyof typeof IDEA_EXPLORATION_ASSESSMENTS];

export const IDEA_IMPORTANCE_ASSESSMENTS = {
  background: "background",
  supporting: "supporting",
  central: "central",
} as const;

export type IdeaImportanceAssessment =
  (typeof IDEA_IMPORTANCE_ASSESSMENTS)[keyof typeof IDEA_IMPORTANCE_ASSESSMENTS];

export const IDEA_DISPOSITIONS = {
  active: "active",
  focused: "focused",
  satisfied: "satisfied",
  parked: "parked",
  dismissed: "dismissed",
} as const;

export type IdeaDisposition =
  (typeof IDEA_DISPOSITIONS)[keyof typeof IDEA_DISPOSITIONS];

export interface AssistantIdeaAssessment {
  exploration: IdeaExplorationAssessment;
  importance: IdeaImportanceAssessment;
}

export interface Idea {
  id: string;
  title: string;
  synthesis: string;
  substance: string;
  unresolvedQuestions: string[];
  assistantAssessment: AssistantIdeaAssessment;
  userInterpretation: string | null;
  disposition: IdeaDisposition;
}

export interface IdeaMap {
  revision: number;
  ideas: Idea[];
}

export const EMPTY_IDEA_MAP: IdeaMap = {
  revision: 0,
  ideas: [],
};

export const IDEA_ACTION_TYPES = {
  correct: "correct",
  dismiss: "dismiss",
  focus: "focus",
  park: "park",
  reopen: "reopen",
  satisfy: "satisfy",
} as const;

export type IdeaActionType =
  (typeof IDEA_ACTION_TYPES)[keyof typeof IDEA_ACTION_TYPES];

export function isIdeaActionType(value: unknown): value is IdeaActionType {
  return (
    typeof value === "string" &&
    (Object.values(IDEA_ACTION_TYPES) as string[]).includes(value)
  );
}

export interface IdeaActionRequest {
  action: IdeaActionType;
  expectedRevision: number;
  userInterpretation?: string;
}

export const IDEA_ACTION_RESULT_STATUSES = {
  changed: "changed",
  conflict: "conflict",
} as const;

export interface IdeaActionChangedResult {
  status: typeof IDEA_ACTION_RESULT_STATUSES.changed;
  ideaMap: IdeaMap;
}

export interface IdeaActionConflictResult {
  status: typeof IDEA_ACTION_RESULT_STATUSES.conflict;
  ideaMap: IdeaMap;
}

export type IdeaActionResult =
  | IdeaActionChangedResult
  | IdeaActionConflictResult;

export const IDEA_MAP_REVISION_SOURCE_TYPES = {
  conversationTurn: "conversation_turn",
  ideaAction: "idea_action",
} as const;

export type IdeaMapRevisionSourceType =
  (typeof IDEA_MAP_REVISION_SOURCE_TYPES)[keyof typeof IDEA_MAP_REVISION_SOURCE_TYPES];

export const IDEA_MAP_ERROR_CODES = {
  conflict: "idea_map_conflict",
  invalidAction: "invalid_idea_action",
} as const;

export const CONVERSATION_MESSAGE_ROLES = {
  assistant: "assistant",
  user: "user",
} as const;

export type ConversationMessageRole =
  (typeof CONVERSATION_MESSAGE_ROLES)[keyof typeof CONVERSATION_MESSAGE_ROLES];

export interface ConversationMessage {
  role: ConversationMessageRole;
  content: string;
}

export const CONVERSATION_ERROR_CODES = {
  conflict: "conversation_conflict",
  inputTooLarge: "conversation_input_too_large",
  invalidRequest: "invalid_conversation_request",
  notFound: "conversation_not_found",
  unavailable: "conversation_unavailable",
  hostedAiDisabled: "hosted_ai_disabled",
  hostedAiUnavailable: "hosted_ai_unavailable",
} as const;

export type ConversationErrorCode =
  (typeof CONVERSATION_ERROR_CODES)[keyof typeof CONVERSATION_ERROR_CODES];

export interface ConversationRequest {
  conversationId: string | null;
  message: string;
}

export interface ConversationResponse {
  conversationId: string;
  message: {
    role: typeof CONVERSATION_MESSAGE_ROLES.assistant;
    content: string;
  };
  activity: Activity;
  move: AssistantMove;
  assistantReadiness: AssistantReadiness[];
  userIntention: UserIntention | null;
  ideaMap: IdeaMap;
}

export interface TemporaryConversationResponse extends ConversationResponse {
  expiresAt: string;
}

export interface ConversationSummary {
  id: string;
  label: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation extends ConversationSummary {
  messages: ConversationMessage[];
  ideaMap: IdeaMap;
}

export interface TemporaryConversation {
  conversation: Conversation;
  expiresAt: string;
}
