import { describe, expect, it } from "vitest";
import { createConversationStore } from "packages/products/src/thoughtform/server/capabilities/conversation";
import { CONVERSATION_MODEL_STREAM_EVENT_TYPES } from "packages/products/src/thoughtform/server/capabilities/conversation/ports/conversation-model";
import { streamResponseInWorkspace } from "packages/products/src/thoughtform/server/application/workspace/stream-response-in-workspace";
import { TestConversationPersistence } from "packages/products/src/thoughtform/testing/fakes/test-conversation-persistence";
import {
  ACTIVITIES,
  ASSISTANT_MOVES,
  CONVERSATION_ERROR_CODES,
  CONVERSATION_MESSAGE_ROLES,
  IDEA_MAP_ERROR_CODES,
  IDEA_DISPOSITIONS,
  IDEA_EXPLORATION_ASSESSMENTS,
  IDEA_IMPORTANCE_ASSESSMENTS,
} from "packages/products/src/thoughtform/shared";
import {
  HOSTED_ATTEMPT_ACTIONS,
  HOSTED_ATTEMPT_OUTCOMES,
  type HostedAttemptAction,
  type HostedAttemptLifecycle,
  type HostedAttemptOutcome,
} from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";

describe("streamResponseInWorkspace", () => {
  it("streams and retains the assistant before independently retaining the Idea Map", async () => {
    const attempts: Array<{ action: HostedAttemptAction; outcome?: HostedAttemptOutcome }> = [];
    const backingStore = createConversationStore(
      new TestConversationPersistence(),
      { shouldInitializeOnAppend: true, createId: () => "conversation-1" },
    );
    let appendCount = 0;
    const conversations = {
      ...backingStore,
      async appendConversationTurn(input: Parameters<typeof backingStore.appendConversationTurn>[0]) {
        appendCount += 1;
        return backingStore.appendConversationTurn(input);
      },
    };
    const events = [];
    for await (const event of streamResponseInWorkspace({
      conversationId: null,
      message: "Accountability is what matters.",
      conversations,
      conversation: {
        async *respondStream() {
          yield { type: CONVERSATION_MODEL_STREAM_EVENT_TYPES.textDelta, text: "That makes " } as const;
          yield { type: CONVERSATION_MODEL_STREAM_EVENT_TYPES.textDelta, text: "the centre clear." } as const;
          yield { type: CONVERSATION_MODEL_STREAM_EVENT_TYPES.completed, generation: generation() } as const;
        },
      },
      ideaMapAnalysis: {
        async analyse() {
          return {
            proposedIdeas: [{
              id: null,
              title: "Accountability gives legitimacy",
              synthesis: "I think legitimacy requires accountability.",
              substance: "Accountability is what matters.",
              unresolvedQuestions: [],
              disposition: IDEA_DISPOSITIONS.active,
              assistantAssessment: {
                exploration: IDEA_EXPLORATION_ASSESSMENTS.emerging,
                importance: IDEA_IMPORTANCE_ASSESSMENTS.central,
              },
            }],
            proposedIdeaActions: null,
            resolvedPotentialConflictIds: null,
          };
        },
      },
      hostedAttempts: recordingLifecycle(attempts),
      operationId: "turn-operation",
    })) events.push(event);

    expect(events.map((event) => event.type)).toEqual([
      "accepted",
      "assistant_delta",
      "assistant_delta",
      "assistant_completed",
      "idea_map_completed",
      "completed",
    ]);
    const workspace = await conversations.getConversationWorkspace("conversation-1");
    expect(workspace?.messages).toEqual([
      { role: "user", content: "Accountability is what matters." },
      { role: "assistant", content: "That makes the centre clear." },
    ]);
    expect(workspace?.ideaMap).toMatchObject({
      revision: 1,
      ideas: [{ title: "Accountability gives legitimacy" }],
    });
    expect(appendCount).toBe(1);
    expect(attempts).toEqual([
      {
        action: HOSTED_ATTEMPT_ACTIONS.conversationResponse,
        outcome: HOSTED_ATTEMPT_OUTCOMES.succeeded,
      },
      {
        action: HOSTED_ATTEMPT_ACTIONS.ideaMapAnalysis,
        outcome: HOSTED_ATTEMPT_OUTCOMES.succeeded,
      },
    ]);
  });

  it("keeps a retained assistant turn when Idea Map analysis fails", async () => {
    const conversations = createConversationStore(
      new TestConversationPersistence(),
      { shouldInitializeOnAppend: true, createId: () => "conversation-1" },
    );
    const events = [];
    for await (const event of streamResponseInWorkspace({
      conversationId: null,
      message: "Keep this response.",
      conversations,
      conversation: {
        async *respondStream() {
          yield { type: CONVERSATION_MODEL_STREAM_EVENT_TYPES.textDelta, text: "It is retained." } as const;
          yield { type: CONVERSATION_MODEL_STREAM_EVENT_TYPES.completed, generation: generation("It is retained.") } as const;
        },
      },
      ideaMapAnalysis: {
        async analyse(): Promise<never> {
          throw new Error("provider unavailable");
        },
      },
    })) events.push(event);

    expect(events.map((event) => event.type)).toEqual([
      "accepted",
      "assistant_delta",
      "assistant_completed",
      "idea_map_failed",
      "completed",
    ]);
    expect((await conversations.getConversationWorkspace("conversation-1"))?.messages)
      .toHaveLength(2);
  });

  it("rejects oversized input before admitting either hosted attempt", async () => {
    const attempts: Array<{ action: HostedAttemptAction; outcome?: HostedAttemptOutcome }> = [];
    const events = [];
    for await (const event of streamResponseInWorkspace({
      conversationId: null,
      message: "x".repeat(40_000),
      conversations: createConversationStore(
        new TestConversationPersistence(),
        { shouldInitializeOnAppend: true },
      ),
      conversation: {
        async *respondStream() {
          throw new Error("Model must not be called.");
        },
      },
      ideaMapAnalysis: {
        async analyse() {
          throw new Error("Model must not be called.");
        },
      },
      hostedAttempts: recordingLifecycle(attempts),
    })) events.push(event);

    expect(events).toEqual([expect.objectContaining({
      type: "failed",
      code: CONVERSATION_ERROR_CODES.inputTooLarge,
    })]);
    expect(attempts).toEqual([]);
  });

  it("reports a recoverable conflict instead of overwriting a newer Idea Map revision", async () => {
    const backingStore = createConversationStore(
      new TestConversationPersistence(),
      { shouldInitializeOnAppend: true, createId: () => "conversation-1" },
    );
    const events = [];
    for await (const event of streamResponseInWorkspace({
      conversationId: null,
      message: "Accountability is what matters.",
      conversations: {
        ...backingStore,
        async replaceIdeaMap() {
          return { status: "conflict" as const };
        },
      },
      conversation: {
        async *respondStream() {
          yield { type: CONVERSATION_MODEL_STREAM_EVENT_TYPES.textDelta, text: "That matters." } as const;
          yield { type: CONVERSATION_MODEL_STREAM_EVENT_TYPES.completed, generation: generation("That matters.") } as const;
        },
      },
      ideaMapAnalysis: {
        async analyse() {
          return {
            proposedIdeas: [{
              id: null,
              title: "Accountability gives legitimacy",
              synthesis: "I think legitimacy requires accountability.",
              substance: "Accountability is what matters.",
              unresolvedQuestions: [],
              disposition: IDEA_DISPOSITIONS.active,
              assistantAssessment: {
                exploration: IDEA_EXPLORATION_ASSESSMENTS.emerging,
                importance: IDEA_IMPORTANCE_ASSESSMENTS.central,
              },
            }],
            proposedIdeaActions: null,
            resolvedPotentialConflictIds: null,
          };
        },
      },
    })) events.push(event);

    expect(events.map((event) => event.type)).toEqual([
      "accepted",
      "assistant_delta",
      "assistant_completed",
      "idea_map_failed",
      "completed",
    ]);
    expect(events).toContainEqual(expect.objectContaining({ code: IDEA_MAP_ERROR_CODES.conflict }));
    expect((await backingStore.getConversationWorkspace("conversation-1"))?.ideaMap.revision)
      .toBe(0);
  });

  it("retains the generated turn when only the Idea Map advanced during generation", async () => {
    const backingStore = createConversationStore(
      new TestConversationPersistence(),
      { createId: () => "conversation-1" },
    );
    await backingStore.createConversation();
    let appendCount = 0;
    const conversations = {
      ...backingStore,
      async appendConversationTurn(input: Parameters<typeof backingStore.appendConversationTurn>[0]) {
        appendCount += 1;
        if (appendCount === 1) {
          await backingStore.replaceIdeaMap({
            conversationId: "conversation-1",
            operationId: "preceding-map",
            expectedRevision: 0,
            ideaMap: { revision: 1, ideas: [existingIdea()] },
          });
        }
        return backingStore.appendConversationTurn(input);
      },
    };

    const events = [];
    for await (const event of streamResponseInWorkspace({
      conversationId: "conversation-1",
      message: "A following thought.",
      conversations,
      conversation: {
        async *respondStream() {
          yield { type: CONVERSATION_MODEL_STREAM_EVENT_TYPES.completed, generation: generation("It follows safely.") } as const;
        },
      },
      ideaMapAnalysis: { async analyse() { return emptyAnalysis(); } },
    })) events.push(event);

    expect(events.map((event) => event.type)).toContain("assistant_completed");
    expect(appendCount).toBe(2);
    expect((await backingStore.getConversationWorkspace("conversation-1")))
      .toMatchObject({
        messages: [
          { role: "user", content: "A following thought." },
          { role: "assistant", content: "It follows safely." },
        ],
        ideaMap: { revision: 1, ideas: [{ id: "existing-idea" }] },
      });
  });

  it("does not retry over a genuine concurrent conversation change", async () => {
    const backingStore = createConversationStore(
      new TestConversationPersistence(),
      { createId: () => "conversation-1" },
    );
    await backingStore.createConversation();
    let appendCount = 0;
    const conversations = {
      ...backingStore,
      async appendConversationTurn(input: Parameters<typeof backingStore.appendConversationTurn>[0]) {
        appendCount += 1;
        if (appendCount === 1) {
          await backingStore.appendConversationTurn({
            ...input,
            operationId: "concurrent-turn",
            userMessage: { role: "user", content: "Another request." },
            assistantMessage: { role: "assistant", content: "Another response." },
          });
        }
        return backingStore.appendConversationTurn(input);
      },
    };

    const events = [];
    for await (const event of streamResponseInWorkspace({
      conversationId: "conversation-1",
      message: "Original request.",
      conversations,
      conversation: {
        async *respondStream() {
          yield { type: CONVERSATION_MODEL_STREAM_EVENT_TYPES.completed, generation: generation("Original response.") } as const;
        },
      },
      ideaMapAnalysis: { async analyse() { return emptyAnalysis(); } },
    })) events.push(event);

    expect(events).toContainEqual(expect.objectContaining({
      type: "failed",
      code: CONVERSATION_ERROR_CODES.conflict,
    }));
    expect(appendCount).toBe(1);
    expect((await backingStore.getConversationWorkspace("conversation-1"))?.messages)
      .toHaveLength(2);
  });

  it("rebases completed analysis onto a map that advances during retention", async () => {
    const backingStore = createConversationStore(
      new TestConversationPersistence(),
      { createId: () => "conversation-1" },
    );
    await backingStore.createConversation();
    let replaceCount = 0;
    const conversations = {
      ...backingStore,
      async replaceIdeaMap(input: Parameters<typeof backingStore.replaceIdeaMap>[0]) {
        replaceCount += 1;
        if (replaceCount === 1) {
          await backingStore.replaceIdeaMap({
            conversationId: "conversation-1",
            operationId: "preceding-analysis",
            expectedRevision: 0,
            ideaMap: { revision: 1, ideas: [existingIdea()] },
          });
          return { status: "conflict" as const };
        }
        return backingStore.replaceIdeaMap(input);
      },
    };

    const events = [];
    for await (const event of streamResponseInWorkspace({
      conversationId: "conversation-1",
      message: "A distinct new idea.",
      conversations,
      conversation: {
        async *respondStream() {
          yield { type: CONVERSATION_MODEL_STREAM_EVENT_TYPES.completed, generation: generation("Let us explore it.") } as const;
        },
      },
      ideaMapAnalysis: {
        async analyse() {
          return {
            ...emptyAnalysis(),
            proposedIdeas: [{
              ...existingIdea(),
              id: null,
              title: "New idea",
              substance: "A distinct new idea.",
            }],
          };
        },
      },
    })) events.push(event);

    expect(events.map((event) => event.type)).toContain("idea_map_completed");
    expect(replaceCount).toBe(2);
    expect((await backingStore.getConversationWorkspace("conversation-1"))?.ideaMap)
      .toMatchObject({
        revision: 2,
        ideas: [
          { id: "existing-idea", title: "Existing idea" },
          { title: "New idea" },
        ],
      });
  });

  it("does not let stale analysis overwrite an idea changed by a newer map", async () => {
    const backingStore = createConversationStore(
      new TestConversationPersistence(),
      { createId: () => "conversation-1" },
    );
    await backingStore.createConversation();
    await backingStore.replaceIdeaMap({
      conversationId: "conversation-1",
      operationId: "seed-map",
      expectedRevision: 0,
      ideaMap: { revision: 1, ideas: [existingIdea()] },
    });
    let replaceCount = 0;
    const conversations = {
      ...backingStore,
      async replaceIdeaMap(input: Parameters<typeof backingStore.replaceIdeaMap>[0]) {
        replaceCount += 1;
        if (replaceCount === 1) {
          await backingStore.replaceIdeaMap({
            conversationId: "conversation-1",
            operationId: "newer-map",
            expectedRevision: 1,
            ideaMap: {
              revision: 2,
              ideas: [{ ...existingIdea(), title: "Newer established wording" }],
            },
          });
          return { status: "conflict" as const };
        }
        return backingStore.replaceIdeaMap(input);
      },
    };

    const events = [];
    for await (const event of streamResponseInWorkspace({
      conversationId: "conversation-1",
      message: "Develop the existing idea.",
      conversations,
      conversation: {
        async *respondStream() {
          yield { type: CONVERSATION_MODEL_STREAM_EVENT_TYPES.completed, generation: generation("Let us sharpen it.") } as const;
        },
      },
      ideaMapAnalysis: {
        async analyse() {
          return {
            ...emptyAnalysis(),
            proposedIdeas: [{
              ...existingIdea(),
              title: "Stale proposed wording",
            }],
          };
        },
      },
    })) events.push(event);

    expect(events.map((event) => event.type)).toContain("idea_map_completed");
    expect((await backingStore.getConversationWorkspace("conversation-1"))?.ideaMap)
      .toMatchObject({
        revision: 2,
        ideas: [{ id: "existing-idea", title: "Newer established wording" }],
      });
  });
});

function recordingLifecycle(
  attempts: Array<{ action: HostedAttemptAction; outcome?: HostedAttemptOutcome }>,
): HostedAttemptLifecycle {
  return {
    async admit(input) {
      const record: { action: HostedAttemptAction; outcome?: HostedAttemptOutcome } = {
        action: input.action,
      };
      attempts.push(record);
      return {
        id: input.operationId,
        run: (operation) => operation(),
        runStream: (operation) => operation(),
        async complete(outcome) { record.outcome = outcome; },
        async discard() {},
      };
    },
  };
}

function emptyAnalysis() {
  return {
    proposedIdeas: null,
    proposedIdeaActions: null,
    resolvedPotentialConflictIds: null,
  };
}

function existingIdea() {
  return {
    id: "existing-idea",
    title: "Existing idea",
    synthesis: "An Idea Map update already settled.",
    substance: "The earlier turn produced this idea.",
    unresolvedQuestions: [],
    disposition: IDEA_DISPOSITIONS.active,
    assistantAssessment: {
      exploration: IDEA_EXPLORATION_ASSESSMENTS.emerging,
      importance: IDEA_IMPORTANCE_ASSESSMENTS.supporting,
    },
    userInterpretation: null,
  };
}

function generation(content = "That makes the centre clear.") {
  return {
    conversationId: "conversation-1",
    message: {
      role: CONVERSATION_MESSAGE_ROLES.assistant,
      content,
    },
    activity: ACTIVITIES.discovery,
    move: ASSISTANT_MOVES.partialReflection,
    assistantReadiness: [],
    userIntention: null,
  };
}
