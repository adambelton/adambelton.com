import {
  CONVERSATION_ERROR_CODES,
  type ConversationMessage,
} from "packages/products/src/socratic-draft/shared";
import type {
  Conversation,
  IdeaMap,
  ConversationSummary,
  TemporaryConversation,
} from "packages/products/src/socratic-draft/shared";

export interface AppendConversationTurnInput {
  conversationId: string;
  operationId: string;
  userMessage: ConversationMessage;
  assistantMessage: ConversationMessage;
  expectedIdeaMapRevision: number;
  ideaMap: IdeaMap;
}

export interface ReplaceIdeaMapInput {
  conversationId: string;
  operationId: string;
  expectedRevision: number;
  ideaMap: IdeaMap;
}

export const CONVERSATION_TURN_RETENTION_STATUSES = {
  conflict: "conflict",
  retained: "retained",
  unavailable: CONVERSATION_ERROR_CODES.unavailable,
} as const;

export type AppendConversationTurnResult =
  | { status: typeof CONVERSATION_TURN_RETENTION_STATUSES.retained }
  | { status: typeof CONVERSATION_TURN_RETENTION_STATUSES.conflict }
  | { status: typeof CONVERSATION_TURN_RETENTION_STATUSES.unavailable };

export interface ConversationStore {
  createConversationId(): string;
  getConversationWorkspace(
    conversationId: string,
  ): Promise<{ messages: ConversationMessage[]; ideaMap: IdeaMap } | null>;
  appendConversationTurn(
    input: AppendConversationTurnInput,
  ): Promise<AppendConversationTurnResult>;
  replaceIdeaMap(input: ReplaceIdeaMapInput): Promise<AppendConversationTurnResult>;
}

export interface PersistentConversationStore extends ConversationStore {
  createConversation(): Promise<Conversation>;
  listConversations(): Promise<ConversationSummary[]>;
  getConversation(conversationId: string): Promise<Conversation | null>;
}

export interface TemporaryConversationStore extends ConversationStore {
  getCurrentConversation(): Promise<TemporaryConversation | null>;
  clearCurrentConversation(): Promise<void>;
}
