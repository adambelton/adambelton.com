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

export const WORKSPACE_PERSISTENCE_TYPES = {
  persistent: "persistent",
  temporary: "temporary",
} as const;

export type WorkspacePersistenceType =
  (typeof WORKSPACE_PERSISTENCE_TYPES)[keyof typeof WORKSPACE_PERSISTENCE_TYPES];

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

export const POTENTIAL_CONFLICT_SCOPES = {
  withinIdea: "within_idea",
  betweenIdeas: "between_ideas",
  savedEdit: "saved_edit",
} as const;

export type PotentialConflictScope =
  (typeof POTENTIAL_CONFLICT_SCOPES)[keyof typeof POTENTIAL_CONFLICT_SCOPES];

export interface PotentialConflict {
  id: string;
  scope: PotentialConflictScope;
  summary: string;
  explanation: string;
  ideaIds: string[];
  draftChange: Pick<DraftChange, "fromRevision" | "toRevision"> | null;
}

export interface IdeaMap {
  revision: number;
  ideas: Idea[];
  potentialConflicts?: PotentialConflict[];
}

export const EMPTY_IDEA_MAP: IdeaMap = {
  revision: 0,
  ideas: [],
  potentialConflicts: [],
};

export const POTENTIAL_CONFLICT_RESOLUTION_TYPES = {
  refine: "refine",
  distinguishContexts: "distinguish_contexts",
  choosePosition: "choose_position",
  separateIdeas: "separate_ideas",
  integrateTension: "integrate_tension",
  dismiss: "dismiss",
} as const;

export type PotentialConflictResolutionType =
  (typeof POTENTIAL_CONFLICT_RESOLUTION_TYPES)[keyof typeof POTENTIAL_CONFLICT_RESOLUTION_TYPES];

export interface PotentialConflictResolutionRequest {
  expectedRevision: number;
  resolution: PotentialConflictResolutionType;
  userEstablishedMeaning?: string;
}

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
  draftChange?: DraftChange;
  draftSelection?: DraftSelection;
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

export type ConversationCompletion = Omit<ConversationResponse, "ideaMap">;

export const CONVERSATION_STREAM_EVENT_TYPES = {
  accepted: "accepted",
  assistantDelta: "assistant_delta",
  assistantCompleted: "assistant_completed",
  ideaMapCompleted: "idea_map_completed",
  ideaMapFailed: "idea_map_failed",
  failed: "failed",
  completed: "completed",
} as const;

export type ConversationStreamEvent =
  | {
      type: typeof CONVERSATION_STREAM_EVENT_TYPES.accepted;
      conversationId: string;
    }
  | {
      type: typeof CONVERSATION_STREAM_EVENT_TYPES.assistantDelta;
      delta: string;
    }
  | {
      type: typeof CONVERSATION_STREAM_EVENT_TYPES.assistantCompleted;
      response: ConversationCompletion;
      expiresAt?: string;
    }
  | {
      type: typeof CONVERSATION_STREAM_EVENT_TYPES.ideaMapCompleted;
      ideaMap: IdeaMap;
    }
  | {
      type: typeof CONVERSATION_STREAM_EVENT_TYPES.ideaMapFailed;
      code: "idea_map_unavailable" | "idea_map_conflict";
      message: string;
    }
  | {
      type: typeof CONVERSATION_STREAM_EVENT_TYPES.failed;
      code: ConversationErrorCode;
      message: string;
    }
  | { type: typeof CONVERSATION_STREAM_EVENT_TYPES.completed };

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

export const DRAFT_REVISION_SOURCES = {
  initialComposition: "initial_composition",
  manualEdit: "manual_edit",
  acceptedProposal: "accepted_proposal",
  restoration: "restoration",
} as const;

export type DraftRevisionSource =
  (typeof DRAFT_REVISION_SOURCES)[keyof typeof DRAFT_REVISION_SOURCES];

export interface DraftRevision {
  revision: number;
  body: string;
  source: DraftRevisionSource;
  createdAt: string;
  proposalId: string | null;
  restoredFromRevision: number | null;
}

export interface Draft {
  id: string;
  conversationId: string;
  body: string;
  currentRevision: number;
  createdAt: string;
  updatedAt: string;
}

export const REVISION_PROPOSAL_SCOPES = {
  passage: "passage",
  wholeDraft: "whole_draft",
} as const;

export type RevisionProposalScope =
  (typeof REVISION_PROPOSAL_SCOPES)[keyof typeof REVISION_PROPOSAL_SCOPES];

export const REVISION_PROPOSAL_STATES = {
  active: "active",
  accepted: "accepted",
  rejected: "rejected",
  stale: "stale",
} as const;

export type RevisionProposalState =
  (typeof REVISION_PROPOSAL_STATES)[keyof typeof REVISION_PROPOSAL_STATES];

export interface DraftSelection {
  baseDraftRevision: number;
  start: number;
  end: number;
  selectedText: string;
}

export const DRAFT_CHANGE_SCOPES = {
  passage: "passage",
  wholeDraft: "whole_draft",
} as const;

export type DraftChangeScope =
  (typeof DRAFT_CHANGE_SCOPES)[keyof typeof DRAFT_CHANGE_SCOPES];

export interface DraftChange {
  fromRevision: number;
  toRevision: number;
  scope: DraftChangeScope;
  start: number;
  end: number;
  removedText: string;
  addedText: string;
}

export const DRAFT_CHANGE_INTERPRETATION_TYPES = {
  textualMaintenance: "textual_maintenance",
  composition: "composition",
  conceptualChange: "conceptual_change",
  structuralChange: "structural_change",
} as const;

export type DraftChangeInterpretationType =
  (typeof DRAFT_CHANGE_INTERPRETATION_TYPES)[keyof typeof DRAFT_CHANGE_INTERPRETATION_TYPES];

export interface DraftChangeInterpretation {
  type: DraftChangeInterpretationType;
  assistantMessage: ConversationMessage | null;
  potentialConflicts: PotentialConflict[];
}

export interface DraftOperationInterpretation {
  status: "not_needed" | "responded" | "failed";
  response?: ConversationResponse;
  failureStage?: "workspace" | "generation" | "interpretation" | "retention";
}

export interface DraftOperationResponse {
  workspace: DraftingState;
  change: DraftChange | null;
  interpretation?: DraftOperationInterpretation;
}

export interface RevisionProposalVersion {
  revision: number;
  proposedContent: string;
  intendedEffect: string;
  createdAt: string;
}

export interface RevisionProposal {
  id: string;
  draftId: string;
  baseDraftRevision: number;
  scope: RevisionProposalScope;
  originalStart: number;
  originalEnd: number;
  originalContent: string;
  userInstruction: string;
  state: RevisionProposalState;
  currentProposalRevision: number;
  versions: RevisionProposalVersion[];
  createdAt: string;
  resolvedAt: string | null;
}

export interface DraftingState {
  draft: Draft | null;
  revisions: DraftRevision[];
  activeProposal: RevisionProposal | null;
}

export const EMPTY_DRAFTING_STATE: DraftingState = {
  draft: null,
  revisions: [],
  activeProposal: null,
};

export const DRAFT_ERROR_CODES = {
  conflict: "draft_conflict",
  draftAlreadyExists: "draft_already_exists",
  invalidRequest: "invalid_draft_request",
  notFound: "draft_not_found",
  proposalNotActive: "revision_proposal_not_active",
  unavailable: "draft_unavailable",
} as const;

export type DraftErrorCode =
  (typeof DRAFT_ERROR_CODES)[keyof typeof DRAFT_ERROR_CODES];
