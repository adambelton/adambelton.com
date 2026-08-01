import { describe, expect, it } from "vitest";
import {
  createInMemoryConversationStore,
  createTemporaryInMemoryConversationStore,
  TEMPORARY_CONVERSATION_LIFETIME_MS,
} from "packages/db/src/socratic-draft/in-memory-conversation-store";

describe("in-memory Socratic Draft conversation store", () => {
  it("uses the product conversation-label policy", async () => {
    const store = createInMemoryConversationStore();
    const conversationId = store.createConversationId();

    await store.appendConversationTurn({
      conversationId,
      userMessage: { role: "user", content: `  ${"a".repeat(100)}  ` },
      assistantMessage: { role: "assistant", content: "A response" },
    });

    await expect(store.listConversations()).resolves.toMatchObject([
      { label: `${"a".repeat(79)}…` },
    ]);
  });
});

describe("temporary in-memory Socratic Draft conversation store", () => {
  it("holds at most one current conversation", () => {
    const store = createTemporaryInMemoryConversationStore();

    expect(store.createConversationId()).toBe(store.createConversationId());
  });

  it("expires a conversation 24 hours after creation without extending it", async () => {
    let currentTime = Date.parse("2026-08-01T12:00:00.000Z");
    const store = createTemporaryInMemoryConversationStore({
      now: () => currentTime,
      scheduleExpiration: () => null,
      cancelExpiration: () => undefined,
    });
    const conversationId = store.createConversationId();

    currentTime += TEMPORARY_CONVERSATION_LIFETIME_MS - 1;
    await store.appendConversationTurn({
      conversationId,
      userMessage: { role: "user", content: "Still here" },
      assistantMessage: { role: "assistant", content: "For one more millisecond" },
    });
    await expect(store.getCurrentConversation()).resolves.not.toBeNull();

    currentTime += 1;
    await expect(store.getCurrentConversation()).resolves.toBeNull();
  });

  it("releases content when its scheduled expiry runs", async () => {
    let expire: (() => void) | null = null;
    const store = createTemporaryInMemoryConversationStore({
      scheduleExpiration: (callback) => {
        expire = callback;
        return "expiry";
      },
      cancelExpiration: () => undefined,
    });
    store.createConversationId();

    expect(expire).not.toBeNull();
    (expire as unknown as () => void)();

    await expect(store.getCurrentConversation()).resolves.toBeNull();
  });

  it("clears the current conversation immediately", async () => {
    const store = createTemporaryInMemoryConversationStore();
    store.createConversationId();

    await store.clearCurrentConversation();

    await expect(store.getCurrentConversation()).resolves.toBeNull();
  });
});
