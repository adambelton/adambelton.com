import type {
  AppendConversationTurnInput,
  PersistentConversationStore,
  TemporaryConversationStore,
} from "packages/products/src/socratic-draft/server/conversation";
import { createConversationLabel } from "packages/products/src/socratic-draft/server/conversation";
import type { ConversationMessage } from "packages/products/src/socratic-draft/shared";
import {
  EMPTY_IDEA_MAP,
  IDEA_MAP_REVISION_SOURCE_TYPES,
  type IdeaMap,
  type IdeaMapRevisionSourceType,
} from "packages/products/src/socratic-draft/shared";

interface InMemoryIdeaMapRevision {
  ideaMap: IdeaMap;
  sourceType: IdeaMapRevisionSourceType;
  sourceId: string;
}

interface InMemoryConversation {
  id: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
  ideaMapRevisions: InMemoryIdeaMapRevision[];
}

export const TEMPORARY_CONVERSATION_LIFETIME_MS = 24 * 60 * 60 * 1000;

export interface TemporaryConversationStoreOptions {
  now?: () => number;
  scheduleExpiration?: (callback: () => void, delayMs: number) => unknown;
  cancelExpiration?: (handle: unknown) => void;
}

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
        ideaMapRevisions: [],
      });
      return conversationId;
    },

    async getConversationWorkspace(conversationId: string) {
      const conversation = conversations.get(conversationId);

      return conversation
        ? {
            messages: [...conversation.messages],
            ideaMap: currentIdeaMap(conversation),
          }
        : null;
    },

    async appendConversationTurn(input: AppendConversationTurnInput) {
      const existingConversation = conversations.get(input.conversationId);
      const existingIdeaMap = existingConversation
        ? currentIdeaMap(existingConversation)
        : EMPTY_IDEA_MAP;
      const expectedRevision = input.expectedIdeaMapRevision;
      const nextIdeaMap = input.ideaMap;
      if (existingIdeaMap.revision !== expectedRevision) {
        return { status: "conflict" };
      }
      const now = new Date().toISOString();
      const revisions = existingConversation?.ideaMapRevisions ?? [];
      conversations.set(input.conversationId, {
        id: input.conversationId,
        messages: [
          ...(existingConversation?.messages ?? []),
          input.userMessage,
          input.assistantMessage,
        ],
        createdAt: existingConversation?.createdAt ?? now,
        updatedAt: now,
        ideaMapRevisions:
          nextIdeaMap.revision === existingIdeaMap.revision
            ? revisions
            : [
                ...revisions,
                createIdeaMapRevision(
                  nextIdeaMap,
                  IDEA_MAP_REVISION_SOURCE_TYPES.conversationTurn,
                  input.operationId,
                ),
              ],
      });
      return { status: "retained" };
    },

    async replaceIdeaMap(input) {
      const conversation = conversations.get(input.conversationId);
      if (!conversation) {
        return { status: "conversation_unavailable" };
      }
      if (currentIdeaMap(conversation).revision !== input.expectedRevision) {
        return { status: "conflict" };
      }
      conversation.ideaMapRevisions.push(
        createIdeaMapRevision(
          input.ideaMap,
          IDEA_MAP_REVISION_SOURCE_TYPES.ideaAction,
          input.operationId,
        ),
      );
      conversation.updatedAt = new Date().toISOString();
      return { status: "retained" };
    },

    async createConversation() {
      const conversationId = this.createConversationId();
      const conversation = conversations.get(conversationId);

      if (!conversation) {
        throw new Error("The persistent conversation could not be created.");
      }

      return {
        ...toConversationSummary(conversation),
        messages: [],
        ideaMap: currentIdeaMap(conversation),
      };
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
            ideaMap: currentIdeaMap(conversation),
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
      ideaMapRevisions: [],
      };
      expiresAt = now() + TEMPORARY_CONVERSATION_LIFETIME_MS;
      expirationHandle = scheduleExpiration(() => {
        if (conversation?.id === conversationId) {
          clear();
        }
      }, TEMPORARY_CONVERSATION_LIFETIME_MS);
      return conversationId;
    },

    async getConversationWorkspace(conversationId: string) {
      const currentConversation = getUnexpiredConversation();

      return currentConversation?.id === conversationId
        ? {
            messages: [...currentConversation.messages],
            ideaMap: currentIdeaMap(currentConversation),
          }
        : null;
    },

    async appendConversationTurn(input: AppendConversationTurnInput) {
      const currentConversation = getUnexpiredConversation();

      if (!currentConversation || currentConversation.id !== input.conversationId) {
        return { status: "conversation_unavailable" };
      }
      const existingIdeaMap = currentIdeaMap(currentConversation);
      const expectedRevision = input.expectedIdeaMapRevision;
      const nextIdeaMap = input.ideaMap;
      if (existingIdeaMap.revision !== expectedRevision) {
        return { status: "conflict" };
      }

      conversation = {
        ...currentConversation,
        messages: [
          ...currentConversation.messages,
          input.userMessage,
          input.assistantMessage,
        ],
        updatedAt: new Date(now()).toISOString(),
        ideaMapRevisions:
          nextIdeaMap.revision === existingIdeaMap.revision
            ? currentConversation.ideaMapRevisions
            : [
                ...currentConversation.ideaMapRevisions,
                createIdeaMapRevision(
                  nextIdeaMap,
                  IDEA_MAP_REVISION_SOURCE_TYPES.conversationTurn,
                  input.operationId,
                ),
              ],
      };
      return { status: "retained" };
    },

    async replaceIdeaMap(input) {
      const currentConversation = getUnexpiredConversation();
      if (!currentConversation || currentConversation.id !== input.conversationId) {
        return { status: "conversation_unavailable" };
      }
      if (currentIdeaMap(currentConversation).revision !== input.expectedRevision) {
        return { status: "conflict" };
      }
      conversation = {
        ...currentConversation,
        ideaMapRevisions: [
          ...currentConversation.ideaMapRevisions,
          createIdeaMapRevision(
            input.ideaMap,
            IDEA_MAP_REVISION_SOURCE_TYPES.ideaAction,
            input.operationId,
          ),
        ],
        updatedAt: new Date(now()).toISOString(),
      };
      return { status: "retained" };
    },

    async getCurrentConversation() {
      const currentConversation = getUnexpiredConversation();

      return currentConversation
        ? {
            conversation: {
              ...toConversationSummary(currentConversation),
              messages: [...currentConversation.messages],
              ideaMap: currentIdeaMap(currentConversation),
            },
            expiresAt: new Date(expiresAt).toISOString(),
          }
        : null;
    },

    async clearCurrentConversation() {
      clear();
    },
  };
}

function currentIdeaMap(conversation: InMemoryConversation): IdeaMap {
  return cloneIdeaMap(
    conversation.ideaMapRevisions.at(-1)?.ideaMap ?? EMPTY_IDEA_MAP,
  );
}

function createIdeaMapRevision(
  ideaMap: IdeaMap,
  sourceType: IdeaMapRevisionSourceType,
  sourceId: string,
): InMemoryIdeaMapRevision {
  return { ideaMap: cloneIdeaMap(ideaMap), sourceType, sourceId };
}

function cloneIdeaMap(ideaMap: IdeaMap): IdeaMap {
  return JSON.parse(JSON.stringify(ideaMap)) as IdeaMap;
}

function toConversationSummary(conversation: InMemoryConversation) {
  return {
    id: conversation.id,
    label: createConversationLabel(conversation.messages),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}
