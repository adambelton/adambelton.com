import { describe, expect, it } from "vitest";

import { ConversationService } from "packages/products/src/socratic-draft/server/conversation/conversation-service";
import {
  createBoundedIdeaContext,
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
    expect(modelRequests[0]?.system).toContain(
      "Never put your own hypotheses",
    );
    expect(modelRequests[0]?.system).toContain(
      "every claim in it must be traceable to the conversation",
    );
    expect(modelRequests[0]?.system).toContain(
      "Return at most three unresolved questions",
    );
    expect(
      JSON.stringify(modelRequests[0]?.outputFormat.schema),
    ).not.toContain("interpretation");
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

  it("does not expose incomplete structured output as an assistant message", async () => {
    const service = new ConversationService({
      conversationModel: {
        async createResponse() {
          return { content: '{"response":"An unfinished response' };
        },
      },
    });

    const response = await service.respond({
      conversationId: "conversation-123",
      message: "This thought needs a reply.",
      previousMessages: [],
    });

    expect(response.message.content).toContain("Share the thought");
    expect(response.message.content).not.toContain('{"response"');
    expect(response.proposedIdeas).toBeNull();
  });

  it("returns a response and validated idea enrichment from one model result", async () => {
    const service = new ConversationService({
      conversationModel: {
        async createResponse() {
          return {
            content: JSON.stringify({
              response: "That distinction changes the centre of the idea.",
              ideaActions: [],
              proposedIdeas: [
                {
                  id: null,
                  title: "Freedom without blame",
                  synthesis: "The grief concerns lost agency rather than blame.",
                  substance: "The user distinguishes love for their wife from grief about conditional time and lost spontaneity.",
                  unresolvedQuestions: ["What form of agency is most missed?"],
                  disposition: "active",
                  assistantAssessment: {
                    exploration: "developing",
                    importance: "central",
                  },
                },
              ],
            }),
          };
        },
      },
    });

    const result = await service.respond({
      conversationId: "conversation-1",
      message: "I miss freedom; I do not blame her.",
      previousMessages: [],
      ideaMap: { revision: 0, ideas: [] },
    });

    expect(result.message.content).toContain("changes the centre");
    expect(result.proposedIdeas?.[0]).toMatchObject({
      title: "Freedom without blame",
      assistantAssessment: { exploration: "developing" },
    });
  });

  it("keeps a valid response but rejects an invalid idea assessment", async () => {
    const service = new ConversationService({
      conversationModel: {
        async createResponse() {
          return {
            content: JSON.stringify({
              response: "We can keep exploring that.",
              proposedIdeas: [{ title: "Missing required fields" }],
            }),
          };
        },
      },
    });
    const result = await service.respond({
      conversationId: "conversation-1",
      message: "Keep going.",
      previousMessages: [],
    });
    expect(result.message.content).toBe("We can keep exploring that.");
    expect(result.proposedIdeas).toBeNull();
  });

  it("includes substance only for the most relevant active ideas", () => {
    const context = createBoundedIdeaContext({
      revision: 4,
      ideas: [
        testIdea("focused", "focused"),
        testIdea("active", "active"),
        testIdea("other-active", "active"),
        testIdea("parked", "parked"),
      ],
    });
    expect(context.ideas.map((idea) => [idea.id, idea.substance])).toEqual([
      ["focused", "Substance for focused"],
      ["active", "Substance for active"],
      ["other-active", undefined],
      ["parked", undefined],
    ]);
  });
});

function testIdea(id: string, disposition: "focused" | "active" | "parked") {
  return {
    id,
    title: id,
    synthesis: `Synthesis for ${id}`,
    substance: `Substance for ${id}`,
    unresolvedQuestions: [],
    assistantAssessment: {
      exploration: "developing" as const,
      importance: "supporting" as const,
    },
    userInterpretation: null,
    disposition,
  };
}
