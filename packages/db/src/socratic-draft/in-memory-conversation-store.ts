import type {
  AppendConversationTurnInput,
  PersistentConversationStore,
} from "packages/products/src/socratic-draft/server/conversation";
import { createConversationLabel } from "packages/products/src/socratic-draft/server/conversation";
import type { ConversationMessage } from "packages/products/src/socratic-draft/shared";

type InMemoryConversation = {
  id: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
};

export function createInMemoryConversationStore(): PersistentConversationStore {
  const conversations = new Map<string, InMemoryConversation>();

  return {
    createConversationId() {
      const conversationId = globalThis.crypto.randomUUID();
      const now = new Date().toISOString();
      conversations.set(conversationId, {
        id: conversationId,
        messages: [],
        createdAt: now,
        updatedAt: now,
      });
      return conversationId;
    },

    async getConversationMessages(conversationId: string) {
      const conversation = conversations.get(conversationId);

      return conversation ? [...conversation.messages] : null;
    },

    async appendConversationTurn(input: AppendConversationTurnInput) {
      const existingConversation = conversations.get(input.conversationId);
      const now = new Date().toISOString();
      conversations.set(input.conversationId, {
        id: input.conversationId,
        messages: [
          ...(existingConversation?.messages ?? []),
          input.userMessage,
          input.assistantMessage,
        ],
        createdAt: existingConversation?.createdAt ?? now,
        updatedAt: now,
      });
    },

    async listConversations() {
      return [...conversations.values()]
        .sort((first, second) =>
          second.updatedAt.localeCompare(first.updatedAt),
        )
        .map(toConversationSummary);
    },

    async getConversation(conversationId: string) {
      const conversation = conversations.get(conversationId);

      return conversation
        ? {
            ...toConversationSummary(conversation),
            messages: [...conversation.messages],
          }
        : null;
    },
  };
}

function toConversationSummary(conversation: InMemoryConversation) {
  return {
    id: conversation.id,
    label: createConversationLabel(conversation.messages),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}
