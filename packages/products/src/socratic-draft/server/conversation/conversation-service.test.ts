import { describe, expect, it } from "vitest";

import { ConversationService } from "packages/products/src/socratic-draft/server/conversation/conversation-service";
import {
  createBoundedIdeaContext,
  CONVERSATION_MODEL_OUTPUT_FORMAT,
  ConversationInputTooLargeError,
  DISCOVERY_ASSISTANT_MOVES,
  MAX_CONVERSATION_INPUT_BYTES,
  MAX_CONVERSATION_OUTPUT_TOKENS,
  measureConversationRequestInputBytes,
} from "packages/products/src/socratic-draft/server/conversation/conversation-service";
import {
  IDEA_ACTION_TYPES,
  IDEA_EXPLORATION_ASSESSMENTS,
  IDEA_IMPORTANCE_ASSESSMENTS,
  READINESS_ACTIONS,
  READINESS_ASSESSMENTS,
  USER_INTENTIONS,
} from "packages/products/src/socratic-draft/shared";
import type {
  ConversationModel,
  ConversationModelRequest,
} from "packages/products/src/socratic-draft/server/conversation";

describe("ConversationService", () => {
  it("derives structured-output enum values from product-owned constants", () => {
    const properties = CONVERSATION_MODEL_OUTPUT_FORMAT.schema.properties;
    const proposedIdea = properties.proposedIdeas.anyOf[0].items.properties;
    const ideaAction = properties.ideaActions.anyOf[0].items.properties;

    expect(properties.move.enum).toBe(DISCOVERY_ASSISTANT_MOVES);
    expect(properties.assistantReadiness.items.properties.action.enum).toEqual(
      Object.values(READINESS_ACTIONS),
    );
    expect(
      properties.assistantReadiness.items.properties.assessment.enum,
    ).toEqual(Object.values(READINESS_ASSESSMENTS));
    expect(properties.userIntention.enum).toEqual([
      ...Object.values(USER_INTENTIONS),
      null,
    ]);
    expect(proposedIdea.assistantAssessment.properties.exploration.enum).toEqual(
      Object.values(IDEA_EXPLORATION_ASSESSMENTS),
    );
    expect(proposedIdea.assistantAssessment.properties.importance.enum).toEqual(
      Object.values(IDEA_IMPORTANCE_ASSESSMENTS),
    );
    expect(ideaAction.action.enum).toEqual(Object.values(IDEA_ACTION_TYPES));
  });

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
                  title: "Leadership without accountability",
                  synthesis: "Infantino's FIFA uses football's authority while resisting scrutiny.",
                  substance: "The user distinguishes condemnation of FIFA's leadership from commitment to football itself.",
                  unresolvedQuestions: ["How can football withdraw unearned legitimacy?"],
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
      message: "I condemn Infantino's leadership, not football itself.",
      previousMessages: [],
      ideaMap: { revision: 0, ideas: [] },
    });

    expect(result.message.content).toContain("changes the centre");
    expect(result.proposedIdeas?.[0]).toMatchObject({
      title: "Leadership without accountability",
      assistantAssessment: { exploration: "developing" },
    });
  });

  it("returns a grounded move, action-specific readiness, and explicit direction", async () => {
    const service = new ConversationService({
      conversationModel: {
        async createResponse() {
          return {
            content: JSON.stringify({
              response: "I can reflect the shape now, while keeping the unresolved tension visible.",
              move: "full_reflection",
              assistantReadiness: [
                { action: "reflect", assessment: "ready", explanation: null },
                {
                  action: "compose",
                  assessment: "ready_with_uncertainty",
                  explanation: "The relationship between supporter pressure and institutional reform is still unresolved.",
                },
              ],
              userIntention: "reflect",
              proposedIdeas: null,
              ideaActions: null,
            }),
          };
        },
      },
    });

    const result = await service.respond({
      conversationId: "conversation-1",
      message: "Reflect back what you think I mean, but keep the tension in it.",
      previousMessages: [],
    });

    expect(result).toMatchObject({
      activity: "discovery",
      move: "full_reflection",
      userIntention: "reflect",
      assistantReadiness: [
        { action: "reflect", assessment: "ready" },
        {
          action: "compose",
          assessment: "ready_with_uncertainty",
          explanation: expect.stringContaining(
            "supporter pressure and institutional reform",
          ),
        },
      ],
    });
  });

  it("preserves an early composition request without claiming composition activity", async () => {
    const service = new ConversationService({
      conversationModel: {
        async createResponse() {
          return {
            content: JSON.stringify({
              response: "You want to compose early, while the central uncertainty is still visible.",
              move: "partial_reflection",
              assistantReadiness: [
                { action: "reflect", assessment: "ready", explanation: null },
                {
                  action: "compose",
                  assessment: "not_ready",
                  explanation: "The central distinction is still unclear.",
                },
              ],
              userIntention: "compose",
              proposedIdeas: null,
              ideaActions: null,
            }),
          };
        },
      },
    });

    const result = await service.respond({
      conversationId: "conversation-1",
      message: "Draft it now, even if it is rough.",
      previousMessages: [],
    });

    expect(result.activity).toBe("discovery");
    expect(result.userIntention).toBe("compose");
    expect(result.assistantReadiness).toContainEqual({
      action: "compose",
      assessment: "not_ready",
      explanation: "The central distinction is still unclear.",
    });
  });

  it("can offer a draft while preserving unresolved composition uncertainty", async () => {
    const service = new ConversationService({
      conversationModel: {
        async createResponse() {
          return {
            content: JSON.stringify({
              response: "There is enough of your language to try a draft, although the ending remains unresolved. Would you like to create one?",
              move: "offer_draft",
              assistantReadiness: [
                { action: "reflect", assessment: "ready", explanation: null },
                {
                  action: "compose",
                  assessment: "ready_with_uncertainty",
                  explanation: "The ending remains deliberately unresolved.",
                },
              ],
              userIntention: null,
              proposedIdeas: null,
              ideaActions: null,
            }),
          };
        },
      },
    });

    const result = await service.respond({
      conversationId: "conversation-1",
      message: "That reflection is right, including the uncertainty.",
      previousMessages: [],
    });

    expect(result).toMatchObject({
      activity: "discovery",
      move: "offer_draft",
      userIntention: null,
      assistantReadiness: [
        { action: "reflect", assessment: "ready" },
        {
          action: "compose",
          assessment: "ready_with_uncertainty",
          explanation: "The ending remains deliberately unresolved.",
        },
      ],
    });
  });

  it("degrades invalid classifications independently without losing a safe response", async () => {
    const service = new ConversationService({
      conversationModel: {
        async createResponse() {
          return {
            content: JSON.stringify({
              response: "What makes that distinction important to you?",
              move: "create_draft",
              assistantReadiness: [
                {
                  action: "compose",
                  assessment: "ready_with_uncertainty",
                  explanation: null,
                },
                { action: "publish", assessment: "ready", explanation: null },
              ],
              userIntention: "publish",
              proposedIdeas: null,
              ideaActions: null,
            }),
          };
        },
      },
    });

    const result = await service.respond({
      conversationId: "conversation-1",
      message: "Keep exploring.",
      previousMessages: [],
    });

    expect(result.message.content).toBe("What makes that distinction important to you?");
    expect(result.move).toBe("probe");
    expect(result.assistantReadiness).toEqual([]);
    expect(result.userIntention).toBeNull();
    expect(result.proposedIdeas).toBeNull();
  });

  it("uses the newest retained turns when complete history exceeds the input boundary", async () => {
    const modelRequests: ConversationModelRequest[] = [];
    const service = new ConversationService({
      conversationModel: {
        async createResponse(request) {
          modelRequests.push(request);
          return { content: "A bounded response" };
        },
      },
    });

    await service.respond({
      conversationId: "conversation-1",
      message: "Current direction",
      previousMessages: [
        { role: "user", content: `old-${"x".repeat(20_000)}` },
        { role: "assistant", content: `middle-${"y".repeat(20_000)}` },
        { role: "user", content: "Newest retained thought" },
        { role: "assistant", content: "Newest retained response" },
      ],
    });

    expect(modelRequests[0]?.messages).toEqual([
      { role: "user", content: "Newest retained thought" },
      { role: "assistant", content: "Newest retained response" },
      { role: "user", content: "Current direction" },
    ]);
    expect(measureConversationRequestInputBytes({
      conversationId: "conversation-1",
      message: "Current direction",
      previousMessages: modelRequests[0]?.messages.slice(0, -1) ?? [],
    })).toBeLessThanOrEqual(MAX_CONVERSATION_INPUT_BYTES);
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
