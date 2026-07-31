import { describe, expect, it } from "vitest";
import { sendConversationMessage } from "packages/products/src/socratic-draft/client/app/editor/send-conversation-message";

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
              move: "probe",
              state: {
                phase: "new_conversation",
                exploredEnough: false,
                nearReadyToReflect: false,
                readyToReflect: false,
                shouldOfferDraft: false,
                threads: [],
                claims: [],
              },
              suggestedReplies: [],
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
});
