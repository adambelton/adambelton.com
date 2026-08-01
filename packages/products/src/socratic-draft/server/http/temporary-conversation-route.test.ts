import { describe, expect, it } from "vitest";
import type { TemporaryConversationStore } from "packages/products/src/socratic-draft/server/conversation";
import type { Conversation } from "packages/products/src/socratic-draft/shared";
import { createTemporaryConversationRoute } from "packages/products/src/socratic-draft/server/http/temporary-conversation-route";

describe("temporary Socratic Draft conversation route", () => {
  it("returns and clears only the authenticated user's current store", async () => {
    const firstUserStore = createFakeTemporaryConversationStore();
    const secondUserStore = createFakeTemporaryConversationStore();
    firstUserStore.createConversationId();
    secondUserStore.createConversationId();
    const route = createTemporaryConversationRoute({
      getTemporaryConversationStore: async (request) =>
        request.headers.get("x-test-user") === "first"
          ? firstUserStore
          : secondUserStore,
    });

    const clearResponse = await route.request("/current", {
      method: "DELETE",
      headers: { "x-test-user": "first" },
    });

    expect(clearResponse.status).toBe(200);
    await expect(firstUserStore.getCurrentConversation()).resolves.toBeNull();
    await expect(secondUserStore.getCurrentConversation()).resolves.not.toBeNull();
  });

  it("does not expose the temporary route without a non-owner store", async () => {
    const route = createTemporaryConversationRoute({
      getTemporaryConversationStore: async () => null,
    });

    expect((await route.request("/current")).status).toBe(404);
  });
});

function createFakeTemporaryConversationStore(): TemporaryConversationStore {
  let conversation: Conversation | null = null;

  return {
    createConversationId() {
      conversation = {
        id: globalThis.crypto.randomUUID(),
        label: "Temporary conversation",
        createdAt: "2026-08-01T12:00:00.000Z",
        updatedAt: "2026-08-01T12:00:00.000Z",
        messages: [],
      };
      return conversation.id;
    },
    async getConversationMessages(conversationId) {
      return conversation?.id === conversationId
        ? [...conversation.messages]
        : null;
    },
    async appendConversationTurn(input) {
      if (conversation?.id === input.conversationId) {
        conversation.messages.push(input.userMessage, input.assistantMessage);
        return { status: "retained" };
      }
      return { status: "conversation_unavailable" };
    },
    async getCurrentConversation() {
      return conversation
        ? {
            conversation,
            expiresAt: "2026-08-02T12:00:00.000Z",
          }
        : null;
    },
    async clearCurrentConversation() {
      conversation = null;
    },
  };
}
