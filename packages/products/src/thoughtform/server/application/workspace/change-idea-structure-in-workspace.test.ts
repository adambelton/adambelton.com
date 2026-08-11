import { describe, expect, it } from "vitest";
import { changeIdeaStructureInWorkspace } from "packages/products/src/thoughtform/server/application/workspace";
import type { ConversationStore } from "packages/products/src/thoughtform/server/capabilities/conversation";
import {
  IDEA_ACTION_RESULT_STATUSES,
  IDEA_DISPOSITIONS,
  IDEA_MAP_ERROR_CODES,
  IDEA_STRUCTURE_COMMAND_TYPES,
  IDEA_STRUCTURE_OPERATION_TYPES,
  type Idea,
  type IdeaMap,
} from "packages/products/src/thoughtform/shared";

describe("changeIdeaStructureInWorkspace", () => {
  it("atomically retains a user-directed merge and its bounded provenance", async () => {
    let current = map([idea("idea-1", "First meaning."), idea("idea-2", "Second meaning.")]);
    const result = await changeIdeaStructureInWorkspace({
      conversationId: "conversation-1",
      conversations: store(() => current, (next) => {
        current = next;
        return "retained";
      }),
      request: {
        type: IDEA_STRUCTURE_OPERATION_TYPES.merge,
        expectedRevision: 1,
        ideaIds: ["idea-1", "idea-2"],
        result: {
          title: "Together",
          synthesis: "One connected concern.",
          assistantAssessment: current.ideas[0]!.assistantAssessment,
        },
        explanation: "These meanings overlap.",
      },
    });
    expect(result).toMatchObject({
      status: IDEA_ACTION_RESULT_STATUSES.changed,
      ideaMap: {
        revision: 2,
        ideas: [{ id: "idea-1", substance: "First meaning.\n\nSecond meaning." }],
        structuralChange: { resultIdeaIds: ["idea-1"], previousIdeas: [{}, {}] },
      },
    });
  });

  it("undoes the latest structural interpretation through a new optimistic revision", async () => {
    let current = map([idea("idea-1", "First meaning."), idea("idea-2", "Second meaning.")]);
    const conversations = store(() => current, (next) => {
      current = next;
      return "retained";
    });
    await changeIdeaStructureInWorkspace({
      conversationId: "conversation-1",
      conversations,
      request: {
        type: IDEA_STRUCTURE_OPERATION_TYPES.merge,
        expectedRevision: 1,
        ideaIds: ["idea-1", "idea-2"],
        result: {
          title: "Together",
          synthesis: "Together.",
          assistantAssessment: current.ideas[0]!.assistantAssessment,
        },
        explanation: "They overlap.",
      },
    });
    const undone = await changeIdeaStructureInWorkspace({
      conversationId: "conversation-1",
      conversations,
      request: { type: IDEA_STRUCTURE_COMMAND_TYPES.undo, expectedRevision: 2 },
    });
    expect(undone).toMatchObject({
      status: IDEA_ACTION_RESULT_STATUSES.changed,
      ideaMap: { revision: 3, ideas: [{ id: "idea-1" }, { id: "idea-2" }] },
    });
  });

  it("returns the current map for a stale structural command", async () => {
    const current = map([idea("idea-1", "First."), idea("idea-2", "Second.")]);
    const result = await changeIdeaStructureInWorkspace({
      conversationId: "conversation-1",
      conversations: store(() => current, () => "retained"),
      request: { type: IDEA_STRUCTURE_COMMAND_TYPES.undo, expectedRevision: 0 },
    });
    expect(result).toEqual({ status: IDEA_MAP_ERROR_CODES.conflict, ideaMap: current });
  });
});

function store(
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

function map(ideas: Idea[]): IdeaMap {
  return { revision: 1, ideas, potentialConflicts: [] };
}

function idea(id: string, substance: string): Idea {
  return {
    id,
    title: id,
    synthesis: `${id} synthesis`,
    substance,
    unresolvedQuestions: [],
    assistantAssessment: { exploration: "developing", importance: "central" },
    userInterpretation: null,
    disposition: IDEA_DISPOSITIONS.active,
  };
}
