import { describe, expect, it } from "vitest";
import { ConversationService } from "packages/products/src/socratic-draft/server/conversation/conversation-service";
import { respondToConversation } from "packages/products/src/socratic-draft/server/conversation/respond-to-conversation";
import type { ConversationStore } from "packages/products/src/socratic-draft/server/conversation/conversation-store";

describe("respondToConversation", () => {
  it("loads history and retains the complete generated turn", async () => {
    const appendedTurns: unknown[] = [];
    const store = createStore({
      appendConversationTurn: async (turn) => {
        appendedTurns.push(turn);
        return { status: "retained" };
      },
    });

    const result = await respondToConversation({
      conversationId: "conversation-1",
      message: "A new thought",
      conversationService: new ConversationService(),
      conversationStore: store,
    });

    expect(result.status).toBe("responded");
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
    const result = await respondToConversation({
      conversationId: "missing",
      message: "Do not process this",
      conversationService: {
        async respond() {
          modelWasCalled = true;
          return new ConversationService().respond({
            conversationId: "missing",
            message: "Do not process this",
            previousMessages: [],
          });
        },
      },
      conversationStore: createStore({
        getConversationMessages: async () => null,
      }),
    });

    expect(result).toEqual({ status: "conversation_not_found" });
    expect(modelWasCalled).toBe(false);
  });

  it("reports when the complete turn cannot be retained", async () => {
    const result = await respondToConversation({
      conversationId: "conversation-1",
      message: "A racing thought",
      conversationService: new ConversationService(),
      conversationStore: createStore({
        appendConversationTurn: async () => ({
          status: "conversation_unavailable",
        }),
      }),
    });

    expect(result).toEqual({ status: "conversation_unavailable" });
  });
});

function createStore(
  overrides: Partial<ConversationStore> = {},
): ConversationStore {
  return {
    createConversationId: () => "conversation-1",
    getConversationMessages: async () => [],
    appendConversationTurn: async () => ({ status: "retained" }),
    ...overrides,
  };
}
