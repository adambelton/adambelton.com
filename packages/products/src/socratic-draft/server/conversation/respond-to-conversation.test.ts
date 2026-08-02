import { describe, expect, it } from "vitest";
import { ConversationService } from "packages/products/src/socratic-draft/server/conversation/conversation-service";
import { respondInWorkspace } from "packages/products/src/socratic-draft/server/workspace/respond-in-workspace";
import type { ConversationStore } from "packages/products/src/socratic-draft/server/conversation/conversation-store";

describe("respondInWorkspace", () => {
  it("loads history and retains the complete generated turn", async () => {
    const appendedTurns: unknown[] = [];
    const store = createStore({
      appendConversationTurn: async (turn) => {
        appendedTurns.push(turn);
        return { status: "retained" };
      },
    });

    const result = await respondInWorkspace({
      conversationId: "conversation-1",
      message: "A new thought",
      conversation: new ConversationService(),
      conversations: store,
    });

    expect(result.status).toBe("responded");
    expect(result).toMatchObject({
      events: [
        { type: "conversation_turn_retained", conversationId: "conversation-1" },
      ],
    });
    expect(appendedTurns).toMatchObject([
      {
        conversationId: "conversation-1",
        userMessage: { role: "user", content: "A new thought" },
        assistantMessage: { role: "assistant" },
      },
    ]);
  });

  it("does not invoke the model for a missing conversation", async () => {
    let modelWasCalled = false;
    const result = await respondInWorkspace({
      conversationId: "missing",
      message: "Do not process this",
      conversation: {
        async respond() {
          modelWasCalled = true;
          return new ConversationService().respond({
            conversationId: "missing",
            message: "Do not process this",
            previousMessages: [],
          });
        },
      },
      conversations: createStore({
        getConversationWorkspace: async () => null,
      }),
    });

    expect(result).toEqual({ status: "conversation_not_found" });
    expect(modelWasCalled).toBe(false);
  });

  it("reports when the complete turn cannot be retained", async () => {
    const result = await respondInWorkspace({
      conversationId: "conversation-1",
      message: "A racing thought",
      conversation: new ConversationService(),
      conversations: createStore({
        appendConversationTurn: async () => ({
          status: "conversation_unavailable",
        }),
      }),
    });

    expect(result).toEqual({ status: "conversation_unavailable" });
  });

  it("does not report a retained-turn event when retention fails", async () => {
    const result = await respondInWorkspace({
      conversationId: "conversation-1",
      message: "Do not call this retained",
      conversation: new ConversationService(),
      conversations: createStore({
        appendConversationTurn: async () => ({
          status: "conversation_unavailable",
        }),
      }),
    });

    expect("events" in result).toBe(false);
  });

  it("applies a conversational dismissal through the idea-map operation", async () => {
    let retainedTurn: Parameters<ConversationStore["appendConversationTurn"]>[0] | null = null;
    const store: ConversationStore = {
      createConversationId: () => "conversation-1",
      getConversationWorkspace: async () => ({
        messages: [],
        ideaMap: {
          revision: 1,
          ideas: [
            {
              id: "idea-1",
              title: "A tangent",
              synthesis: "A possible tangent.",
              substance: "This may not belong in the work.",
              unresolvedQuestions: [],
              assistantAssessment: {
                exploration: "emerging",
                importance: "background",
              },
              userInterpretation: null,
              disposition: "active",
            },
          ],
        },
      }),
      appendConversationTurn: async (turn) => {
        retainedTurn = turn;
        return { status: "retained" };
      },
      replaceIdeaMap: async () => ({ status: "retained" }),
    };
    const result = await respondInWorkspace({
      conversationId: "conversation-1",
      message: "Dismiss that tangent.",
      conversations: store,
      conversation: {
        async respond() {
          return {
            conversationId: "conversation-1",
            message: { role: "assistant", content: "We can leave that aside." },
            activity: "discovery",
            move: "clarify",
            assistantReadiness: [],
            userIntention: null,
            proposedIdeas: null,
            proposedIdeaActions: [{ ideaId: "idea-1", action: "dismiss" }],
          };
        },
      },
    });

    expect(result).toMatchObject({
      status: "responded",
      response: { ideaMap: { revision: 2, ideas: [{ disposition: "dismissed" }] } },
    });
    expect(retainedTurn).toMatchObject({ ideaMap: { revision: 2 } });
  });
});

function createStore(
  overrides: Partial<ConversationStore> = {},
): ConversationStore {
  return {
    createConversationId: () => "conversation-1",
    getConversationWorkspace: async () => ({
      messages: [],
      ideaMap: { revision: 0, ideas: [] },
    }),
    appendConversationTurn: async () => ({ status: "retained" }),
    replaceIdeaMap: async () => ({ status: "retained" }),
    ...overrides,
  };
}
