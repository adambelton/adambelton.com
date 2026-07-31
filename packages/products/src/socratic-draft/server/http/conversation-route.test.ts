import { describe, expect, it } from "vitest";
import { ConversationService } from "packages/products/src/socratic-draft/server/conversation";
import { createConversationRoute } from "packages/products/src/socratic-draft/server/http";
import type { ConversationResponder } from "packages/products/src/socratic-draft/server/http";
import type {
  AppendConversationTurnInput,
  ConversationStore,
} from "packages/products/src/socratic-draft/server/conversation";
import type {
  ConversationMessage,
  ConversationResponse,
} from "packages/products/src/socratic-draft/shared";
import type { ApiResponse } from "packages/shared/src";

describe("Socratic Draft conversation route", () => {
  it("returns an assistant response and persists the turn through the host store", async () => {
    const conversationStore = createFakeConversationStore();
    const route = createConversationRoute({ conversationStore });

    const response = await route.request("/respond", {
      method: "POST",
      body: JSON.stringify({
        conversationId: null,
        message: "I can't tell whether this draft is honest.",
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const body = (await response.json()) as ApiResponse<ConversationResponse>;

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      ok: true,
      data: {
        conversationId: "conversation-1",
        message: {
          role: "assistant",
        },
        move: "probe",
      },
    });

    const responseData = body.ok ? body.data : null;
    const messages = await conversationStore.getConversationMessages("conversation-1");

    expect(messages).toEqual([
      {
        role: "user",
        content: "I can't tell whether this draft is honest.",
      },
      responseData?.message,
    ]);
  });

  it("passes existing conversation history into the conversation service", async () => {
    const conversationStore = createFakeConversationStore();
    await conversationStore.appendConversationTurn({
      conversationId: "conversation-1",
      userMessage: {
        role: "user",
        content: "Earlier thought.",
      },
      assistantMessage: {
        role: "assistant",
        content: "Earlier response.",
      },
    });
    let previousMessages: ConversationMessage[] | null = null;
    const conversationService = {
      async respond(request) {
        previousMessages = request.previousMessages;
        return new ConversationService().respond(request);
      },
    } satisfies ConversationResponder;
    const route = createConversationRoute({ conversationService, conversationStore });

    await route.request("/respond", {
      method: "POST",
      body: JSON.stringify({
        conversationId: "conversation-1",
        message: "New thought.",
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    expect(previousMessages).toEqual([
      {
        role: "user",
        content: "Earlier thought.",
      },
      {
        role: "assistant",
        content: "Earlier response.",
      },
    ]);
  });

  it("rejects invalid requests", async () => {
    const route = createConversationRoute({
      conversationStore: createFakeConversationStore(),
    });

    const response = await route.request("/respond", {
      method: "POST",
      body: JSON.stringify({
        conversationId: null,
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const body = (await response.json()) as ApiResponse<ConversationResponse>;

    expect(response.status).toBe(400);
    expect(body).toEqual({
      ok: false,
      error: {
        code: "invalid_conversation_request",
        message: "Conversation requests require a message and optional conversationId.",
      },
    });
  });

  it("does not continue an unknown saved conversation", async () => {
    const route = createConversationRoute({
      conversationStore: createFakeConversationStore(),
    });

    const response = await route.request("/respond", {
      method: "POST",
      body: JSON.stringify({
        conversationId: "missing-conversation",
        message: "Continue this conversation.",
      }),
      headers: { "content-type": "application/json" },
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "conversation_not_found",
        message: "The requested conversation was not found.",
      },
    });
  });

  it("rejects requests without an available conversation store", async () => {
    const route = createConversationRoute({
      getConversationStore: async () => null,
    });

    const response = await route.request("/respond", {
      method: "POST",
      body: JSON.stringify({
        conversationId: null,
        message: "This should require a session.",
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const body = (await response.json()) as ApiResponse<ConversationResponse>;

    expect(response.status).toBe(401);
    expect(body).toEqual({
      ok: false,
      error: {
        code: "unauthorized",
        message: "Sign in to continue the conversation.",
      },
    });
  });
});

function createFakeConversationStore(): ConversationStore {
  const conversations = new Map<string, ConversationMessage[]>();
  let nextEntryNumber = 1;

  return {
    createConversationId() {
      const conversationId = `conversation-${nextEntryNumber}`;
      nextEntryNumber += 1;
      conversations.set(conversationId, []);
      return conversationId;
    },

    async getConversationMessages(conversationId: string) {
      const messages = conversations.get(conversationId);
      return messages ? [...messages] : null;
    },

    async appendConversationTurn(input: AppendConversationTurnInput) {
      const existingMessages = conversations.get(input.conversationId) ?? [];
      conversations.set(input.conversationId, [
        ...existingMessages,
        input.userMessage,
        input.assistantMessage,
      ]);
    },
  };
}
