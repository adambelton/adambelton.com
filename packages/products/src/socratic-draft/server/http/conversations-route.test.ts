import { describe, expect, it } from "vitest";
import { createConversationsRoute } from "packages/products/src/socratic-draft/server/http/conversations-route";
import type { PersistentConversationStore } from "packages/products/src/socratic-draft/server/conversation";

describe("Socratic Draft conversations route", () => {
  it("lists and loads conversations from the owner-scoped store", async () => {
    const conversationStore = createPersistentConversationStore();
    const route = createConversationsRoute({
      getPersistentConversationStore: async () => conversationStore,
    });

    const listResponse = await route.request("/");
    expect(listResponse.status).toBe(200);
    await expect(listResponse.json()).resolves.toMatchObject({
      ok: true,
      data: [{ id: "conversation-1", label: "A saved thought" }],
    });

    const detailResponse = await route.request("/conversation-1");
    expect(detailResponse.status).toBe(200);
    await expect(detailResponse.json()).resolves.toMatchObject({
      ok: true,
      data: {
        id: "conversation-1",
        messages: [{ role: "user", content: "A saved thought" }],
      },
    });
  });

  it("hides the route without an owner-scoped store", async () => {
    const route = createConversationsRoute({
      getPersistentConversationStore: async () => null,
    });

    const response = await route.request("/");

    expect(response.status).toBe(404);
  });

  it("returns not found for an inaccessible conversation", async () => {
    const route = createConversationsRoute({
      getPersistentConversationStore: async () =>
        createPersistentConversationStore(),
    });

    const response = await route.request("/another-user-conversation");

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: { code: "conversation_not_found" },
    });
  });
});

function createPersistentConversationStore(): PersistentConversationStore {
  const conversation = {
    id: "conversation-1",
    label: "A saved thought",
    createdAt: "2026-07-31T10:00:00.000Z",
    updatedAt: "2026-07-31T10:05:00.000Z",
    messages: [{ role: "user" as const, content: "A saved thought" }],
  };

  return {
    createConversationId: () => "conversation-2",
    getConversationMessages: async (conversationId) =>
      conversationId === conversation.id ? conversation.messages : null,
    appendConversationTurn: async () => undefined,
    listConversations: async () => [conversation],
    getConversation: async (conversationId) =>
      conversationId === conversation.id ? conversation : null,
  };
}
