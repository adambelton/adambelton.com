import { createConversationLabel } from "packages/products/src/socratic-draft/server/capabilities/conversation/conversation-label";
import {
  CONVERSATION_COMMIT_STATUSES,
  type ConversationPersistence,
  type ConversationPersistenceSnapshot,
} from "packages/products/src/socratic-draft/server/capabilities/conversation/ports/conversation-persistence";
import {
  CONVERSATION_ERROR_CODES,
  EMPTY_IDEA_MAP,
  type Conversation,
  type ConversationMessage,
  type ConversationSummary,
  type IdeaMap,
  type TemporaryConversation,
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

export interface AppendAssistantMessageInput {
  conversationId: string;
  operationId: string;
  assistantMessage: ConversationMessage;
  expectedIdeaMapRevision: number;
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
  getConversationWorkspace(conversationId: string): Promise<{
    messages: ConversationMessage[];
    ideaMap: IdeaMap;
  } | null>;
  appendConversationTurn(input: AppendConversationTurnInput): Promise<AppendConversationTurnResult>;
  appendAssistantMessage(input: AppendAssistantMessageInput): Promise<AppendConversationTurnResult>;
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

export interface ConversationStoreOptions {
  createId?: () => string;
  initializeOnAppend?: boolean;
  now?: () => Date;
}

export function createConversationStore(
  persistence: ConversationPersistence,
  {
    createId = () => globalThis.crypto.randomUUID(),
    initializeOnAppend = false,
    now = () => new Date(),
  }: ConversationStoreOptions = {},
): PersistentConversationStore & TemporaryConversationStore {
  async function commitResult(
    result: Awaited<ReturnType<ConversationPersistence["commit"]>>,
  ): Promise<AppendConversationTurnResult> {
    if (result.status === CONVERSATION_COMMIT_STATUSES.conflict) {
      return { status: CONVERSATION_TURN_RETENTION_STATUSES.conflict };
    }
    if (result.status === CONVERSATION_COMMIT_STATUSES.unavailable) {
      return { status: CONVERSATION_TURN_RETENTION_STATUSES.unavailable };
    }
    return { status: CONVERSATION_TURN_RETENTION_STATUSES.retained };
  }

  return {
    createConversationId: createId,

    async getConversationWorkspace(conversationId) {
      const snapshot = await persistence.load(conversationId);
      return snapshot
        ? { messages: snapshot.messages, ideaMap: snapshot.ideaMap }
        : null;
    },

    async appendConversationTurn(input) {
      let current = await persistence.load(input.conversationId);
      if (
        !current &&
        initializeOnAppend &&
        input.expectedIdeaMapRevision === 0
      ) {
        current = await persistence.initialize({
          conversationId: input.conversationId,
          createdAt: now().toISOString(),
        });
      }
      if (!current) {
        return {
          status: initializeOnAppend
            ? CONVERSATION_TURN_RETENTION_STATUSES.unavailable
            : CONVERSATION_TURN_RETENTION_STATUSES.conflict,
        };
      }
      if (current.ideaMap.revision !== input.expectedIdeaMapRevision) {
        return { status: CONVERSATION_TURN_RETENTION_STATUSES.conflict };
      }
      return commitResult(await persistence.commit({
        conversationId: input.conversationId,
        operationId: input.operationId,
        operationKind: "conversation_turn",
        expectedIdeaMapRevision: input.expectedIdeaMapRevision,
        nextSnapshot: {
          ...current,
          messages: [
            ...current.messages,
            input.userMessage,
            input.assistantMessage,
          ],
          ideaMap: input.ideaMap,
          updatedAt: now().toISOString(),
        },
      }));
    },

    async appendAssistantMessage(input) {
      const current = await persistence.load(input.conversationId);
      if (!current) {
        return { status: CONVERSATION_TURN_RETENTION_STATUSES.unavailable };
      }
      if (current.ideaMap.revision !== input.expectedIdeaMapRevision) {
        return { status: CONVERSATION_TURN_RETENTION_STATUSES.conflict };
      }
      return commitResult(await persistence.commit({
        conversationId: input.conversationId,
        operationId: input.operationId,
        operationKind: "saved_edit_response",
        expectedIdeaMapRevision: input.expectedIdeaMapRevision,
        nextSnapshot: {
          ...current,
          messages: [...current.messages, input.assistantMessage],
          ideaMap: input.ideaMap,
          updatedAt: now().toISOString(),
        },
      }));
    },

    async replaceIdeaMap(input) {
      const current = await persistence.load(input.conversationId);
      if (!current) {
        return { status: CONVERSATION_TURN_RETENTION_STATUSES.unavailable };
      }
      if (current.ideaMap.revision !== input.expectedRevision) {
        return { status: CONVERSATION_TURN_RETENTION_STATUSES.conflict };
      }
      return commitResult(await persistence.commit({
        conversationId: input.conversationId,
        operationId: input.operationId,
        operationKind: "idea_action",
        expectedIdeaMapRevision: input.expectedRevision,
        nextSnapshot: {
          ...current,
          ideaMap: input.ideaMap,
          updatedAt: now().toISOString(),
        },
      }));
    },

    async createConversation() {
      const createdAt = now().toISOString();
      const snapshot = await persistence.initialize({
        conversationId: createId(),
        createdAt,
      });
      if (!snapshot) throw new Error("The conversation could not be created.");
      return toConversation(snapshot);
    },

    async listConversations() {
      return (await persistence.list())
        .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt))
        .map(toSummary);
    },

    async getConversation(conversationId) {
      const snapshot = await persistence.load(conversationId);
      return snapshot ? toConversation(snapshot) : null;
    },

    async getCurrentConversation() {
      const snapshot = await persistence.getCurrent();
      if (!snapshot?.expiresAt) return null;
      return {
        conversation: toConversation(snapshot),
        expiresAt: snapshot.expiresAt,
      };
    },

    clearCurrentConversation: () => persistence.clearCurrent(),
  };
}

function toConversation(snapshot: ConversationPersistenceSnapshot): Conversation {
  return {
    ...toSummary(snapshot),
    messages: structuredClone(snapshot.messages),
    ideaMap: structuredClone(snapshot.ideaMap),
  };
}

function toSummary(snapshot: ConversationPersistenceSnapshot) {
  return {
    id: snapshot.id,
    label: createConversationLabel(snapshot.messages),
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}

export function emptyConversationSnapshot(input: {
  id: string;
  createdAt: string;
  expiresAt?: string | null;
}): ConversationPersistenceSnapshot {
  return {
    id: input.id,
    messages: [],
    ideaMap: structuredClone(EMPTY_IDEA_MAP),
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    expiresAt: input.expiresAt ?? null,
  };
}
