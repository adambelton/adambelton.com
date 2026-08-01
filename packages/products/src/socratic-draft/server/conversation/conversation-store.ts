import type { ConversationMessage } from "packages/products/src/socratic-draft/shared";
import type {
  Conversation,
  ConversationSummary,
  TemporaryConversation,
} from "packages/products/src/socratic-draft/shared";

export type AppendConversationTurnInput = {
  conversationId: string;
  userMessage: ConversationMessage;
  assistantMessage: ConversationMessage;
};

export type AppendConversationTurnResult =
  | { status: "retained" }
  | { status: "conversation_unavailable" };

export type ConversationStore = {
  createConversationId(): string;
  getConversationMessages(
    conversationId: string,
  ): Promise<ConversationMessage[] | null>;
  appendConversationTurn(
    input: AppendConversationTurnInput,
  ): Promise<AppendConversationTurnResult>;
};

export type PersistentConversationStore = ConversationStore & {
  createConversation(): Promise<Conversation>;
  listConversations(): Promise<ConversationSummary[]>;
  getConversation(conversationId: string): Promise<Conversation | null>;
};

export type TemporaryConversationStore = ConversationStore & {
  getCurrentConversation(): Promise<TemporaryConversation | null>;
  clearCurrentConversation(): Promise<void>;
};
