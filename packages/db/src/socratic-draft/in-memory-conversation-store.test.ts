import { describe, expect, it } from "vitest";
import { createInMemoryConversationStore } from "packages/db/src/socratic-draft/in-memory-conversation-store";

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
