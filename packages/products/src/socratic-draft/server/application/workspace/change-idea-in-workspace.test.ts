import { describe, expect, it } from "vitest";
import { changeIdeaInWorkspace } from "packages/products/src/socratic-draft/server/application/workspace";
import type { ConversationStore } from "packages/products/src/socratic-draft/server/capabilities/conversation";
import { IDEA_ACTION_TYPES, type IdeaMap } from "packages/products/src/socratic-draft/shared";

describe("changeIdeaInWorkspace", () => {
  it("applies a UI action through the same product operation and retains a new revision", async () => {
    let ideaMap = createMap();
    const result = await changeIdeaInWorkspace({
      conversationId: "conversation-1",
      ideaId: "idea-1",
      request: {
        action: IDEA_ACTION_TYPES.dismiss,
        expectedRevision: 1,
      },
      conversations: createStore(() => ideaMap, (next) => {
        ideaMap = next;
        return "retained";
      }),
    });
    expect(result).toMatchObject({
      status: "changed",
      ideaMap: { revision: 2, ideas: [{ disposition: "dismissed" }] },
    });
  });

  it("returns current state rather than overwriting after a stale action", async () => {
    const ideaMap = createMap();
    const result = await changeIdeaInWorkspace({
      conversationId: "conversation-1",
      ideaId: "idea-1",
      request: {
        action: IDEA_ACTION_TYPES.park,
        expectedRevision: 0,
      },
      conversations: createStore(() => ideaMap, () => "retained"),
    });
    expect(result).toEqual({ status: "idea_map_conflict", ideaMap });
  });
});

function createStore(
  current: () => IdeaMap,
  replace: (ideaMap: IdeaMap) => "retained" | "conflict",
): ConversationStore {
  return {
    createConversationId: () => "conversation-1",
    getConversationWorkspace: async () => ({ messages: [], ideaMap: current() }),
    appendConversationTurn: async () => ({ status: "retained" }),
    appendAssistantMessage: async () => ({ status: "retained" }),
    replaceIdeaMap: async (input) => ({ status: replace(input.ideaMap) }),
  };
}

function createMap(): IdeaMap {
  return {
    revision: 1,
    ideas: [
      {
        id: "idea-1",
        title: "An idea",
        synthesis: "A synthesis",
        substance: "Substance",
        unresolvedQuestions: [],
        assistantAssessment: {
          exploration: "developing",
          importance: "central",
        },
        userInterpretation: null,
        disposition: "active",
      },
    ],
  };
}
