import { describe, expect, it } from "vitest";
import { createConversationRoute } from "packages/products/src/socratic-draft/server/http";
import type {
  AppendConversationTurnInput,
  EntryStore,
} from "packages/products/src/socratic-draft/server/conversation";
import type {
  ConversationMessage,
  ConversationResponse,
} from "packages/products/src/socratic-draft/shared";
import type { ApiResponse } from "packages/shared/src";

describe("Socratic Draft conversation route", () => {
  it("returns an assistant response and persists the turn through the host store", async () => {
    const entryStore = createFakeEntryStore();
    const route = createConversationRoute({ entryStore });

    const response = await route.request("/respond", {
      method: "POST",
      body: JSON.stringify({
        entryId: null,
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
        entryId: "entry-1",
        message: {
          role: "assistant",
        },
        move: "probe",
      },
    });

    const responseData = body.ok ? body.data : null;
    const messages = await entryStore.getConversationMessages("entry-1");

    expect(messages).toEqual([
      {
        role: "user",
        content: "I can't tell whether this draft is honest.",
      },
      responseData?.message,
    ]);
  });

  it("rejects invalid requests", async () => {
    const route = createConversationRoute({
      entryStore: createFakeEntryStore(),
    });

    const response = await route.request("/respond", {
      method: "POST",
      body: JSON.stringify({
        entryId: null,
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
        message: "Conversation requests require a message and optional entryId.",
      },
    });
  });

  it("rejects requests without an available entry store", async () => {
    const route = createConversationRoute({
      getEntryStore: async () => null,
    });

    const response = await route.request("/respond", {
      method: "POST",
      body: JSON.stringify({
        entryId: null,
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

function createFakeEntryStore(): EntryStore {
  const conversations = new Map<string, ConversationMessage[]>();
  let nextEntryNumber = 1;

  return {
    createEntryId() {
      const entryId = `entry-${nextEntryNumber}`;
      nextEntryNumber += 1;
      conversations.set(entryId, []);
      return entryId;
    },

    async getConversationMessages(entryId: string) {
      return [...(conversations.get(entryId) ?? [])];
    },

    async appendConversationTurn(input: AppendConversationTurnInput) {
      const existingMessages = conversations.get(input.entryId) ?? [];
      conversations.set(input.entryId, [
        ...existingMessages,
        input.userMessage,
        input.assistantMessage,
      ]);
    },
  };
}
