import type { ConversationMessage } from "packages/products/src/socratic-draft/shared";

export type AppendConversationTurnInput = {
  entryId: string;
  userMessage: ConversationMessage;
  assistantMessage: ConversationMessage;
};

export type EntryStore = {
  createEntryId(): string;
  getConversationMessages(entryId: string): Promise<ConversationMessage[]>;
  appendConversationTurn(input: AppendConversationTurnInput): Promise<void>;
};
