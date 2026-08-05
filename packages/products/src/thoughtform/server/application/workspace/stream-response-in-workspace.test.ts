import { describe, expect, it } from "vitest";
import { createConversationStore } from "packages/products/src/thoughtform/server/capabilities/conversation";
import { streamResponseInWorkspace } from "packages/products/src/thoughtform/server/application/workspace/stream-response-in-workspace";
import { TestConversationPersistence } from "packages/products/src/thoughtform/testing/fakes/test-conversation-persistence";
import {
  ACTIVITIES,
  ASSISTANT_MOVES,
  CONVERSATION_MESSAGE_ROLES,
  IDEA_DISPOSITIONS,
  IDEA_EXPLORATION_ASSESSMENTS,
  IDEA_IMPORTANCE_ASSESSMENTS,
} from "packages/products/src/thoughtform/shared";

describe("streamResponseInWorkspace", () => {
  it("streams and retains the assistant before independently retaining the Idea Map", async () => {
    const backingStore = createConversationStore(
      new TestConversationPersistence(),
      { initializeOnAppend: true, createId: () => "conversation-1" },
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
          yield { type: "text_delta", text: "That makes " } as const;
          yield { type: "text_delta", text: "the centre clear." } as const;
          yield { type: "completed", generation: generation() } as const;
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
  });

  it("keeps a retained assistant turn when Idea Map analysis fails", async () => {
    const conversations = createConversationStore(
      new TestConversationPersistence(),
      { initializeOnAppend: true, createId: () => "conversation-1" },
    );
    const events = [];
    for await (const event of streamResponseInWorkspace({
      conversationId: null,
      message: "Keep this response.",
      conversations,
      conversation: {
        async *respondStream() {
          yield { type: "text_delta", text: "It is retained." } as const;
          yield { type: "completed", generation: generation("It is retained.") } as const;
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

  it("reports a recoverable conflict instead of overwriting a newer Idea Map revision", async () => {
    const backingStore = createConversationStore(
      new TestConversationPersistence(),
      { initializeOnAppend: true, createId: () => "conversation-1" },
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
          yield { type: "text_delta", text: "That matters." } as const;
          yield { type: "completed", generation: generation("That matters.") } as const;
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
    expect(events).toContainEqual(expect.objectContaining({ code: "idea_map_conflict" }));
    expect((await backingStore.getConversationWorkspace("conversation-1"))?.ideaMap.revision)
      .toBe(0);
  });
});

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
