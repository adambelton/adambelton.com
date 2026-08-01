import { describe, expect, it } from "vitest";
import {
  ConversationRequestError,
  sendConversationMessage,
} from "packages/products/src/socratic-draft/client/app/modules/editor/send-conversation-message";

describe("sendConversationMessage", () => {
  it("returns the conversation response from the API success body", async () => {
    const response = await sendConversationMessage(
      {
        conversationId: null,
        message: "This idea feels half formed.",
      },
      async () =>
        new Response(
          JSON.stringify({
            ok: true,
            data: {
              conversationId: "conversation-1",
              message: {
                role: "assistant",
                content: "Tell me where it feels half formed.",
              },
              activity: "discovery",
              move: "probe",
              assistantReadiness: [],
              userIntention: null,
              suggestedReplies: [],
              expiresAt: "2026-08-02T12:00:00.000Z",
            },
          }),
          {
            status: 201,
          },
        ),
    );

    expect(response).toMatchObject({
      conversationId: "conversation-1",
      message: {
        role: "assistant",
        content: "Tell me where it feels half formed.",
      },
    });
  });

  it("throws the API failure message", async () => {
    await expect(
      sendConversationMessage(
        {
          conversationId: null,
          message: "",
        },
        async () =>
          new Response(
            JSON.stringify({
              ok: false,
              error: {
                code: "invalid_conversation_request",
                message: "Conversation requests require a message.",
              },
            }),
            {
              status: 400,
            },
          ),
      ),
    ).rejects.toThrow("Conversation requests require a message.");
  });

  it("preserves the structured API failure code", async () => {
    const error = await sendConversationMessage(
      { conversationId: "conversation-1", message: "Continue" },
      async () =>
        new Response(
          JSON.stringify({
            ok: false,
            error: {
              code: "conversation_unavailable",
              message: "This temporary conversation is no longer available.",
            },
          }),
          { status: 409 },
        ),
    ).catch((requestError: unknown) => requestError);

    expect(error).toBeInstanceOf(ConversationRequestError);
    expect(error).toMatchObject({ code: "conversation_unavailable" });
  });
});
