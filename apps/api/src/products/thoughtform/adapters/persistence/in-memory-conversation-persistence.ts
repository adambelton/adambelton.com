import {
  CONVERSATION_COMMIT_STATUSES,
  emptyConversationSnapshot,
  type ConversationCommitInput,
  type ConversationPersistence,
  type ConversationPersistenceSnapshot,
} from "packages/products/src/thoughtform/server/capabilities/conversation";

export const TEMPORARY_CONVERSATION_LIFETIME_MS = 24 * 60 * 60 * 1_000;

export interface InMemoryConversationPersistenceOptions {
  isTemporary?: boolean;
  now?: () => number;
  scheduleExpiration?: (callback: () => void, delayMs: number) => unknown;
  cancelExpiration?: (handle: unknown) => void;
  onClear?: (conversationId: string) => void | Promise<void>;
}

export function createInMemoryConversationPersistence({
  isTemporary = false,
  now = Date.now,
  scheduleExpiration = (callback, delayMs) =>
    globalThis.setTimeout(callback, delayMs),
  cancelExpiration = (handle) =>
    globalThis.clearTimeout(handle as ReturnType<typeof globalThis.setTimeout>),
  onClear = () => undefined,
}: InMemoryConversationPersistenceOptions = {}): ConversationPersistence {
  const snapshots = new Map<string, ConversationPersistenceSnapshot>();
  const operations = new Map<string, Set<string>>();
  let currentId: string | null = null;
  let expirationHandle: unknown = null;

  async function clearExpired() {
    if (!currentId) return;
    const current = snapshots.get(currentId);
    if (current?.expiresAt && now() >= Date.parse(current.expiresAt)) {
      await clear();
    }
  }

  async function clear() {
    if (expirationHandle !== null) cancelExpiration(expirationHandle);
    if (currentId) {
      const clearedId = currentId;
      snapshots.delete(currentId);
      operations.delete(currentId);
      currentId = null;
      expirationHandle = null;
      await onClear(clearedId);
      return;
    }
    currentId = null;
    expirationHandle = null;
  }

  return {
    async initialize(input) {
      await clearExpired();
      if (isTemporary && currentId) {
        const current = snapshots.get(currentId);
        return current ? structuredClone(current) : null;
      }
      const expiresAt = isTemporary
        ? new Date(now() + TEMPORARY_CONVERSATION_LIFETIME_MS).toISOString()
        : null;
      const snapshot = emptyConversationSnapshot({
        id: input.conversationId,
        createdAt: input.createdAt,
        expiresAt,
      });
      snapshots.set(input.conversationId, snapshot);
      if (isTemporary) {
        currentId = input.conversationId;
        expirationHandle = scheduleExpiration(
          () => void clear(),
          TEMPORARY_CONVERSATION_LIFETIME_MS,
        );
      }
      return structuredClone(snapshot);
    },

    async load(conversationId) {
      await clearExpired();
      const snapshot = snapshots.get(conversationId);
      return snapshot ? structuredClone(snapshot) : null;
    },

    async list() {
      await clearExpired();
      return [...snapshots.values()].map((snapshot) => structuredClone(snapshot));
    },

    async getCurrent() {
      await clearExpired();
      const snapshot = currentId ? snapshots.get(currentId) : null;
      return snapshot ? structuredClone(snapshot) : null;
    },

    async commit(input: ConversationCommitInput) {
      await clearExpired();
      const current = snapshots.get(input.conversationId);
      if (!current) return { status: CONVERSATION_COMMIT_STATUSES.unavailable };
      const completed = operations.get(input.conversationId);
      if (completed?.has(input.operationId)) {
        return { status: CONVERSATION_COMMIT_STATUSES.duplicate, snapshot: structuredClone(current) };
      }
      if (current.ideaMap.revision !== input.expectedIdeaMapRevision) {
        return { status: CONVERSATION_COMMIT_STATUSES.conflict, snapshot: structuredClone(current) };
      }
      const next = structuredClone(input.nextSnapshot);
      snapshots.set(input.conversationId, next);
      const nextCompleted = completed ?? new Set<string>();
      nextCompleted.add(input.operationId);
      operations.set(input.conversationId, nextCompleted);
      return { status: CONVERSATION_COMMIT_STATUSES.committed, snapshot: structuredClone(next) };
    },

    async clearCurrent() {
      await clear();
    },
  };
}
