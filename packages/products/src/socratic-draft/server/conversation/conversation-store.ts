import type { ConversationMessage } from "packages/products/src/socratic-draft/shared";
import type {
  Conversation,
  ConversationSummary,
} from "packages/products/src/socratic-draft/shared";

export type AppendConversationTurnInput = {
  conversationId: string;
  userMessage: ConversationMessage;
  assistantMessage: ConversationMessage;
};

export type ConversationStore = {
  createConversationId(): string;
  getConversationMessages(
    conversationId: string,
  ): Promise<ConversationMessage[] | null>;
  appendConversationTurn(input: AppendConversationTurnInput): Promise<void>;
};

export type PersistentConversationStore = ConversationStore & {
  listConversations(): Promise<ConversationSummary[]>;
  getConversation(conversationId: string): Promise<Conversation | null>;
};

export type TemporaryConversationStore = ConversationStore & {
  getCurrentConversation(): Promise<Conversation | null>;
  clearCurrentConversation(): Promise<void>;
};
