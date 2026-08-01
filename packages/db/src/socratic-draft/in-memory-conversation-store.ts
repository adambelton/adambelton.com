import type {
  AppendConversationTurnInput,
  PersistentConversationStore,
  TemporaryConversationStore,
} from "packages/products/src/socratic-draft/server/conversation";
import { createConversationLabel } from "packages/products/src/socratic-draft/server/conversation";
import type { ConversationMessage } from "packages/products/src/socratic-draft/shared";

type InMemoryConversation = {
  id: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
};

export const TEMPORARY_CONVERSATION_LIFETIME_MS = 24 * 60 * 60 * 1000;

export type TemporaryConversationStoreOptions = {
  now?: () => number;
  scheduleExpiration?: (callback: () => void, delayMs: number) => unknown;
  cancelExpiration?: (handle: unknown) => void;
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

export function createTemporaryInMemoryConversationStore({
  now = Date.now,
  scheduleExpiration = (callback, delayMs) =>
    globalThis.setTimeout(callback, delayMs),
  cancelExpiration = (handle) =>
    globalThis.clearTimeout(handle as ReturnType<typeof globalThis.setTimeout>),
}: TemporaryConversationStoreOptions = {}): TemporaryConversationStore {
  let conversation: InMemoryConversation | null = null;
  let expiresAt = 0;
  let expirationHandle: unknown = null;

  function clear() {
    if (expirationHandle !== null) {
      cancelExpiration(expirationHandle);
    }

    conversation = null;
    expiresAt = 0;
    expirationHandle = null;
  }

  function getUnexpiredConversation() {
    if (conversation && now() >= expiresAt) {
      clear();
    }

    return conversation;
  }

  return {
    createConversationId() {
      const existingConversation = getUnexpiredConversation();

      if (existingConversation) {
        return existingConversation.id;
      }

      const conversationId = globalThis.crypto.randomUUID();
      const createdAt = new Date(now()).toISOString();
      conversation = {
        id: conversationId,
        messages: [],
        createdAt,
        updatedAt: createdAt,
      };
      expiresAt = now() + TEMPORARY_CONVERSATION_LIFETIME_MS;
      expirationHandle = scheduleExpiration(() => {
        if (conversation?.id === conversationId) {
          clear();
        }
      }, TEMPORARY_CONVERSATION_LIFETIME_MS);
      return conversationId;
    },

    async getConversationMessages(conversationId: string) {
      const currentConversation = getUnexpiredConversation();

      return currentConversation?.id === conversationId
        ? [...currentConversation.messages]
        : null;
    },

    async appendConversationTurn(input: AppendConversationTurnInput) {
      const currentConversation = getUnexpiredConversation();

      if (!currentConversation || currentConversation.id !== input.conversationId) {
        return;
      }

      conversation = {
        ...currentConversation,
        messages: [
          ...currentConversation.messages,
          input.userMessage,
          input.assistantMessage,
        ],
        updatedAt: new Date(now()).toISOString(),
      };
    },

    async getCurrentConversation() {
      const currentConversation = getUnexpiredConversation();

      return currentConversation
        ? {
            ...toConversationSummary(currentConversation),
            messages: [...currentConversation.messages],
          }
        : null;
    },

    async clearCurrentConversation() {
      clear();
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
