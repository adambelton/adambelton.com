import { describe, expect, it } from "vitest";
import { createConversationRoute } from "apps/api/src/routes/socratic-draft/conversation";
import { createInMemoryEntryStore } from "apps/api/src/routes/socratic-draft/in-memory-entry-store";
import type { ConversationResponse } from "packages/products/src/socratic-draft/shared";
import type { ApiResponse } from "packages/shared/src";

describe("Socratic Draft conversation route", () => {
  it("returns an assistant response and persists the turn through the host store", async () => {
    const entryStore = createInMemoryEntryStore();
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
      entryStore: createInMemoryEntryStore(),
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
});
