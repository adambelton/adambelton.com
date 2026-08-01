import { describe, expect, it } from "vitest";

import { ConversationService } from "packages/products/src/socratic-draft/server/conversation/conversation-service";
import {
  ConversationInputTooLargeError,
  MAX_CONVERSATION_INPUT_BYTES,
  MAX_CONVERSATION_OUTPUT_TOKENS,
  measureConversationRequestInputBytes,
} from "packages/products/src/socratic-draft/server/conversation/conversation-service";
import type {
  ConversationModel,
  ConversationModelRequest,
} from "packages/products/src/socratic-draft/server/conversation";

describe("ConversationService", () => {
  it("returns a minimal assistant response for a new conversation", async () => {
    const service = new ConversationService();

    const response = await service.respond({
      conversationId: null,
      message: "I keep changing my mind about what this essay is really about.",
      previousMessages: [],
    });

    expect(response).toMatchObject({
      conversationId: "draft-conversation",
      message: {
        role: "assistant",
      },
      activity: "discovery",
      move: "probe",
      assistantReadiness: [],
      userIntention: null,
    });
    expect(response.message.content).toContain("Share the thought");
    expect(response.suggestedReplies).toEqual([
      {
        label: "Start with a thought",
        message: "I keep changing my mind about what this essay is really about.",
      },
    ]);
  });

  it("preserves an existing conversation id", async () => {
    const service = new ConversationService();

    const response = await service.respond({
      conversationId: "conversation-123",
      message: "This section feels dishonest.",
      previousMessages: [],
    });

    expect(response.conversationId).toBe("conversation-123");
  });

  it("passes current and previous messages to the injected conversation model", async () => {
    const modelRequests: ConversationModelRequest[] = [];
    const conversationModel = {
      async createResponse(request) {
        modelRequests.push(request);
        return {
          content: "What feels most unresolved in that thought?",
        };
      },
    } satisfies ConversationModel;
    const service = new ConversationService({ conversationModel });

    const response = await service.respond({
      conversationId: "conversation-123",
      message: "The ending feels too neat.",
      previousMessages: [
        {
          role: "user",
          content: "Earlier thought.",
        },
        {
          role: "assistant",
          content: "Earlier response.",
        },
      ],
    });

    expect(response.message).toEqual({
      role: "assistant",
      content: "What feels most unresolved in that thought?",
    });
    expect(modelRequests[0]).toMatchObject({
      messages: [
        {
          role: "user",
          content: "Earlier thought.",
        },
        {
          role: "assistant",
          content: "Earlier response.",
        },
        {
          role: "user",
          content: "The ending feels too neat.",
        },
      ],
    });
    expect(modelRequests[0]?.system).toContain("The Socratic Draft");
    expect(modelRequests[0]?.maxOutputTokens).toBe(
      MAX_CONVERSATION_OUTPUT_TOKENS,
    );
  });

  it("accepts complete input at the byte boundary and rejects one byte over", async () => {
    const modelRequests: ConversationModelRequest[] = [];
    const service = new ConversationService({
      conversationModel: {
        async createResponse(request) {
          modelRequests.push(request);
          return { content: "A bounded response" };
        },
      },
    });
    const emptyRequest = {
      conversationId: "conversation-123",
      message: "",
      previousMessages: [],
    };
    const availableMessageBytes =
      MAX_CONVERSATION_INPUT_BYTES -
      measureConversationRequestInputBytes(emptyRequest);

    await service.respond({
      ...emptyRequest,
      message: "a".repeat(availableMessageBytes),
    });

    await expect(
      service.respond({
        ...emptyRequest,
        message: "a".repeat(availableMessageBytes + 1),
      }),
    ).rejects.toBeInstanceOf(ConversationInputTooLargeError);
    expect(modelRequests).toHaveLength(1);
  });

  it("measures complete input as UTF-8 bytes", () => {
    const asciiBytes = measureConversationRequestInputBytes({
      conversationId: null,
      message: "a",
      previousMessages: [],
    });
    const emojiBytes = measureConversationRequestInputBytes({
      conversationId: null,
      message: "😀",
      previousMessages: [],
    });

    expect(emojiBytes - asciiBytes).toBe(3);
  });

  it("uses the static response if the model returns blank content", async () => {
    const service = new ConversationService({
      conversationModel: {
        async createResponse() {
          return {
            content: "   ",
          };
        },
      },
    });

    const response = await service.respond({
      conversationId: "conversation-123",
      message: "This thought needs a reply.",
      previousMessages: [],
    });

    expect(response.message.content).toContain("Share the thought");
  });
});
