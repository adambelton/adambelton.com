export const WORKSPACE_EVENT_TYPES = {
  conversationTurnRetained: "conversation_turn_retained",
} as const;

export type ConversationTurnRetainedEvent = {
  type: typeof WORKSPACE_EVENT_TYPES.conversationTurnRetained;
  conversationId: string;
};

export type WorkspaceEvent = ConversationTurnRetainedEvent;
