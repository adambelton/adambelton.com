export const WORKSPACE_EVENT_TYPES = {
  conversationTurnRetained: "conversation_turn_retained",
  ideaMapChanged: "idea_map_changed",
} as const;

export type ConversationTurnRetainedEvent = {
  type: typeof WORKSPACE_EVENT_TYPES.conversationTurnRetained;
  conversationId: string;
};

export type IdeaMapChangedEvent = {
  type: typeof WORKSPACE_EVENT_TYPES.ideaMapChanged;
  conversationId: string;
  revision: number;
};

export type WorkspaceEvent = ConversationTurnRetainedEvent | IdeaMapChangedEvent;
