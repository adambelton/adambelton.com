import {
  CONVERSATION_COMMIT_STATUSES,
  createConversationStore,
  emptyConversationSnapshot,
  type ConversationCommitInput,
  type ConversationPersistence,
} from "packages/products/src/socratic-draft/server/capabilities/conversation";

export class TestConversationPersistence implements ConversationPersistence {
  private snapshot: Awaited<ReturnType<ConversationPersistence["load"]>> = null;
  private readonly operations = new Set<string>();

  async initialize(input: { conversationId: string; createdAt: string }) {
    this.snapshot ??= emptyConversationSnapshot({
      id: input.conversationId,
      createdAt: input.createdAt,
      expiresAt: new Date(Date.now() + 60 * 60 * 1_000).toISOString(),
    });
    return structuredClone(this.snapshot);
  }

  async load(conversationId: string) {
    return this.snapshot?.id === conversationId
      ? structuredClone(this.snapshot)
      : null;
  }

  async list() {
    return this.snapshot ? [structuredClone(this.snapshot)] : [];
  }

  async getCurrent() {
    return this.snapshot ? structuredClone(this.snapshot) : null;
  }

  async commit(input: ConversationCommitInput) {
    if (!this.snapshot || this.snapshot.id !== input.conversationId) {
      return { status: CONVERSATION_COMMIT_STATUSES.unavailable } as const;
    }
    if (this.operations.has(input.operationId)) {
      return {
        status: CONVERSATION_COMMIT_STATUSES.duplicate,
        snapshot: structuredClone(this.snapshot),
      } as const;
    }
    if (this.snapshot.ideaMap.revision !== input.expectedIdeaMapRevision) {
      return {
        status: CONVERSATION_COMMIT_STATUSES.conflict,
        snapshot: structuredClone(this.snapshot),
      } as const;
    }
    this.snapshot = structuredClone(input.nextSnapshot);
    this.operations.add(input.operationId);
    return {
      status: CONVERSATION_COMMIT_STATUSES.committed,
      snapshot: structuredClone(this.snapshot),
    } as const;
  }

  async clearCurrent() {
    this.snapshot = null;
    this.operations.clear();
  }
}

export function createTestConversationStore() {
  let conversationId: string | null = null;
  return createConversationStore(new TestConversationPersistence(), {
    initializeOnAppend: true,
    createId: () => {
      conversationId ??= globalThis.crypto.randomUUID();
      return conversationId;
    },
  });
}
