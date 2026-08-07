import { describe, expect, it } from "vitest";
import {
  TEMPORARY_CONVERSATION_LIFETIME_MS,
  createInMemoryConversationPersistence,
} from "apps/api/src/products/thoughtform/adapters/persistence/in-memory-conversation-persistence";
import {
  createConversationStore,
  type AppendConversationTurnInput,
} from "packages/products/src/thoughtform/server/capabilities/conversation";

describe("host in-memory conversation persistence", () => {
  it("supports persistent conversation behavior through the product store", async () => {
    const store = createConversationStore(createInMemoryConversationPersistence());
    const conversation = await store.createConversation();
    expect(conversation.messages).toEqual([]);
    await expect(store.getConversation(conversation.id)).resolves.toEqual(conversation);
  });

  it("expires temporary state without extending its lifetime", async () => {
    let currentTime = Date.parse("2026-08-01T12:00:00.000Z");
    const cleared: string[] = [];
    const persistence = createInMemoryConversationPersistence({
      isTemporary: true,
      now: () => currentTime,
      scheduleExpiration: () => null,
      cancelExpiration: () => undefined,
      onClear: (conversationId) => {
        cleared.push(conversationId);
      },
    });
    const store = createConversationStore(persistence, {
      shouldInitializeOnAppend: true,
      now: () => new Date(currentTime),
    });
    const conversationId = store.createConversationId();
    await store.appendConversationTurn(createTurn(conversationId));
    await expect(store.getCurrentConversation()).resolves.toMatchObject({
      expiresAt: "2026-08-02T12:00:00.000Z",
    });
    currentTime += TEMPORARY_CONVERSATION_LIFETIME_MS;
    await expect(store.getCurrentConversation()).resolves.toBeNull();
    expect(cleared).toEqual([conversationId]);
  });

  it("clears temporary content immediately", async () => {
    const cleared: string[] = [];
    const store = createConversationStore(
      createInMemoryConversationPersistence({
        isTemporary: true,
        onClear: (conversationId) => {
          cleared.push(conversationId);
        },
      }),
      { shouldInitializeOnAppend: true },
    );
    const conversationId = store.createConversationId();
    await store.appendConversationTurn(createTurn(conversationId));
    await store.clearCurrentConversation();
    await expect(store.getCurrentConversation()).resolves.toBeNull();
    expect(cleared).toEqual([conversationId]);
  });

  it("waits for complete workspace cleanup before clearing returns", async () => {
    let isCleanupCompleted = false;
    const store = createConversationStore(
      createInMemoryConversationPersistence({
        isTemporary: true,
        onClear: async () => {
          await Promise.resolve();
          isCleanupCompleted = true;
        },
      }),
      { shouldInitializeOnAppend: true },
    );
    const conversationId = store.createConversationId();
    await store.appendConversationTurn(createTurn(conversationId));

    await store.clearCurrentConversation();

    expect(isCleanupCompleted).toBe(true);
  });
});

function createTurn(conversationId: string): AppendConversationTurnInput {
  return {
    conversationId,
    operationId: globalThis.crypto.randomUUID(),
    expectedMessageCount: 0,
    expectedIdeaMapRevision: 0,
    ideaMap: { revision: 0, ideas: [] },
    userMessage: { role: "user", content: "A thought" },
    assistantMessage: { role: "assistant", content: "A response" },
  };
}
