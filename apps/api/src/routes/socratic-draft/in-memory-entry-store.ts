import type {
  AppendConversationTurnInput,
  EntryStore,
} from "packages/products/src/socratic-draft/server/conversation";
import type { ConversationMessage } from "packages/products/src/socratic-draft/shared";

export function createInMemoryEntryStore(): EntryStore {
  const conversations = new Map<string, ConversationMessage[]>();
  let nextEntryNumber = 1;

  return {
    createEntryId() {
      const entryId = `entry-${nextEntryNumber}`;
      nextEntryNumber += 1;
      conversations.set(entryId, []);
      return entryId;
    },

    async getConversationMessages(entryId: string) {
      return [...(conversations.get(entryId) ?? [])];
    },

    async appendConversationTurn(input: AppendConversationTurnInput) {
      const existingMessages = conversations.get(input.entryId) ?? [];
      conversations.set(input.entryId, [
        ...existingMessages,
        input.userMessage,
        input.assistantMessage,
      ]);
    },
  };
}
