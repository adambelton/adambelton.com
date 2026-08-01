import { describe, expect, it } from "vitest";
import { createConversationsRoute } from "packages/products/src/socratic-draft/server/http/conversations-route";
import type { PersistentConversationStore } from "packages/products/src/socratic-draft/server/conversation";
import { ConversationService } from "packages/products/src/socratic-draft/server/conversation";

describe("Socratic Draft conversations route", () => {
  it("creates an empty persistent conversation before editing", async () => {
    const route = createConversationsRoute({
      getPersistentConversationStore: async () =>
        createPersistentConversationStore(),
    });

    const response = await route.request("/", { method: "POST" });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: { id: "conversation-2", messages: [] },
    });
  });

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

  it("continues an identified persistent conversation and retains the turn", async () => {
    const store = createPersistentConversationStore();
    const appendedTurns: unknown[] = [];
    const route = createConversationsRoute({
      getPersistentConversationStore: async () => ({
        ...store,
        appendConversationTurn: async (turn) => {
          appendedTurns.push(turn);
          return { status: "retained" };
        },
      }),
      conversationService: new ConversationService(),
    });

    const response = await route.request("/conversation-1/respond", {
      method: "POST",
      body: JSON.stringify({ message: "Continue this thought" }),
      headers: { "content-type": "application/json" },
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: { conversationId: "conversation-1", message: { role: "assistant" } },
    });
    expect(appendedTurns).toMatchObject([
      {
        conversationId: "conversation-1",
        userMessage: { content: "Continue this thought" },
      },
    ]);
  });

  it("rejects invalid persistent conversation requests", async () => {
    const route = createConversationsRoute({
      getPersistentConversationStore: async () =>
        createPersistentConversationStore(),
    });

    const response = await route.request("/conversation-1/respond", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: { code: "invalid_conversation_request" },
    });
  });

  it("does not invoke the model for an unknown persistent conversation", async () => {
    let modelWasCalled = false;
    const route = createConversationsRoute({
      getPersistentConversationStore: async () =>
        createPersistentConversationStore(),
      conversationService: {
        async respond(request) {
          modelWasCalled = true;
          return new ConversationService().respond(request);
        },
      },
    });

    const response = await route.request("/missing/respond", {
      method: "POST",
      body: JSON.stringify({ message: "Do not process this" }),
      headers: { "content-type": "application/json" },
    });

    expect(response.status).toBe(404);
    expect(modelWasCalled).toBe(false);
  });

  it("hides persistent response operations without an owner store", async () => {
    const route = createConversationsRoute({
      getPersistentConversationStore: async () => null,
    });

    const response = await route.request("/conversation-1/respond", {
      method: "POST",
      body: JSON.stringify({ message: "Not allowed" }),
      headers: { "content-type": "application/json" },
    });

    expect(response.status).toBe(404);
  });

  it("does not report success when a persistent turn becomes unavailable", async () => {
    const store = createPersistentConversationStore();
    const route = createConversationsRoute({
      getPersistentConversationStore: async () => ({
        ...store,
        appendConversationTurn: async () => ({
          status: "conversation_unavailable",
        }),
      }),
    });

    const response = await route.request("/conversation-1/respond", {
      method: "POST",
      body: JSON.stringify({ message: "Race the deletion" }),
      headers: { "content-type": "application/json" },
    });

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
    createConversation: async () => ({
      ...conversation,
      id: "conversation-2",
      messages: [],
    }),
    getConversationMessages: async (conversationId) =>
      conversationId === conversation.id ? conversation.messages : null,
    appendConversationTurn: async () => ({ status: "retained" }),
    listConversations: async () => [conversation],
    getConversation: async (conversationId) =>
      conversationId === conversation.id ? conversation : null,
  };
}
