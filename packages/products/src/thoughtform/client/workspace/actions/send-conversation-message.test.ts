import { describe, expect, it, vi } from "vitest";
import {
  ConversationRequestError,
  sendConversationMessage,
  sendPersistentConversationMessage,
} from "packages/products/src/thoughtform/client/workspace/actions/send-conversation-message";

describe("sendConversationMessage", () => {
  it("streams assistant deltas and returns independently completed state", async () => {
    const deltas: string[] = [];
    const ideaMaps: unknown[] = [];
    const response = await sendConversationMessage(
      { conversationId: null, message: "This idea feels half formed." },
      {
        onAssistantDelta: (delta) => deltas.push(delta),
        onIdeaMap: (ideaMap) => ideaMaps.push(ideaMap),
      },
      async () => streamResponse([
        { type: "accepted", conversationId: "conversation-1" },
        { type: "assistant_delta", delta: "Tell me " },
        { type: "assistant_delta", delta: "where it feels half formed." },
        {
          type: "assistant_completed",
          response: completion(),
          expiresAt: "2026-08-02T12:00:00.000Z",
        },
        { type: "idea_map_completed", ideaMap: { revision: 1, ideas: [] } },
        { type: "completed" },
      ]),
    );

    expect(deltas).toEqual(["Tell me ", "where it feels half formed."]);
    expect(ideaMaps).toEqual([{ revision: 1, ideas: [] }]);
    expect(response).toMatchObject({
      conversationId: "conversation-1",
      expiresAt: "2026-08-02T12:00:00.000Z",
    });
  });

  it("throws a pre-stream API failure with its structured code", async () => {
    const error = await sendConversationMessage(
      { conversationId: null, message: "" },
      {},
      async () => new Response(JSON.stringify({
        ok: false,
        error: {
          code: "invalid_conversation_request",
          message: "Conversation requests require a message.",
        },
      }), { status: 400 }),
    ).catch((requestError: unknown) => requestError);

    expect(error).toBeInstanceOf(ConversationRequestError);
    expect(error).toMatchObject({ code: "invalid_conversation_request" });
  });

  it("preserves a retained response when the Idea Map reports a recoverable failure", async () => {
    const failures: string[] = [];
    await expect(sendConversationMessage(
      { conversationId: null, message: "Continue" },
      { onIdeaMapFailed: (message) => failures.push(message) },
      async () => streamResponse([
        { type: "accepted", conversationId: "conversation-1" },
        { type: "assistant_delta", delta: "Keep going." },
        { type: "assistant_completed", response: completion() },
        {
          type: "idea_map_failed",
          code: "idea_map_unavailable",
          message: "The response was saved, but the Idea Map could not be updated.",
        },
        { type: "completed" },
      ]),
    )).resolves.toMatchObject({ conversationId: "conversation-1" });
    expect(failures).toEqual([
      "The response was saved, but the Idea Map could not be updated.",
    ]);
  });

  it("does not emit client observations for the temporary workspace", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successResponse());

    await sendConversationMessage(
      { conversationId: null, message: "A temporary thought" },
      {},
      fetcher,
    );

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("emits owner observations for first token and complete response", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(successResponse())
      .mockResolvedValue(new Response(null, { status: 204 }));

    await sendPersistentConversationMessage(
      { conversationId: "conversation-1", message: "An owner thought" },
      {},
      fetcher,
    );

    expect(fetcher).toHaveBeenCalledTimes(3);
    const observationBodies = fetcher.mock.calls.slice(1).map((call) =>
      JSON.parse(String(call[1]?.body)) as { operation: string },
    );
    expect(observationBodies.map((body) => body.operation)).toEqual([
      "conversation_first_token",
      "conversation_response",
    ]);
  });
});

function completion() {
  return {
    conversationId: "conversation-1",
    message: { role: "assistant" as const, content: "Tell me where it feels half formed." },
    activity: "discovery" as const,
    move: "probe" as const,
    assistantReadiness: [],
    userIntention: null,
  };
}

function successResponse() {
  return streamResponse([
    { type: "accepted", conversationId: "conversation-1" },
    { type: "assistant_delta", delta: "Keep going." },
    { type: "assistant_completed", response: completion() },
    { type: "idea_map_completed", ideaMap: { revision: 0, ideas: [] } },
    { type: "completed" },
  ]);
}

function streamResponse(events: unknown[]) {
  return new Response(events.map((event) =>
    `event: ${(event as { type: string }).type}\ndata: ${JSON.stringify(event)}\n\n`
  ).join(""), {
    status: 200,
    headers: { "content-type": "text/event-stream" },
  });
}
