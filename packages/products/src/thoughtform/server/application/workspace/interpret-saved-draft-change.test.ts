import { describe, expect, it, vi } from "vitest";
import { interpretSavedDraftChange } from "packages/products/src/thoughtform/server/application/workspace/interpret-saved-draft-change";
import { createConversationStore } from "packages/products/src/thoughtform/server/capabilities/conversation";
import { TestConversationPersistence } from "packages/products/src/thoughtform/testing/fakes/test-conversation-persistence";
import {
  DRAFT_OPERATION_INTERPRETATION_FAILURE_STAGES,
  DRAFT_OPERATION_INTERPRETATION_STATUSES,
  POTENTIAL_CONFLICT_SCOPES,
  type DraftChange,
} from "packages/products/src/thoughtform/shared";

const change: DraftChange = {
  fromRevision: 1,
  toRevision: 2,
  scope: "passage",
  start: 0,
  end: 13,
  removedText: "Power matters",
  addedText: "Power must answer to people",
};

async function store() {
  const conversations = createConversationStore(new TestConversationPersistence(), {
    shouldInitializeOnAppend: true,
    createId: () => "conversation-1",
  });
  await conversations.appendConversationTurn({
    conversationId: "conversation-1",
    operationId: "turn-1",
    userMessage: { role: "user", content: "Power should answer to people." },
    assistantMessage: { role: "assistant", content: "What makes that important?" },
    expectedMessageCount: 0,
    expectedIdeaMapRevision: 0,
    ideaMap: {
      revision: 1,
      ideas: [{
        id: "idea-1",
        title: "Accountable power",
        synthesis: "Power should answer to people.",
        substance: "I distrust power that cannot be challenged.",
        unresolvedQuestions: [],
        assistantAssessment: { exploration: "developing", importance: "central" },
        userInterpretation: null,
        disposition: "active",
      }],
    },
  });
  return conversations;
}

describe("interpretSavedDraftChange", () => {
  it("retains a provisional assistant-only response and an inspectable saved-edit conflict", async () => {
    const conversations = await store();
    const result = await interpretSavedDraftChange({
      conversationId: "conversation-1",
      change,
      conversations,
      createId: () => "conflict-1",
      model: {
        interpret: async () => ({
          type: "conceptual_change",
          assistantMessage: "It sounds as though accountability, rather than power itself, is the concern. Is that right?",
          potentialConflicts: [{
            scope: POTENTIAL_CONFLICT_SCOPES.savedEdit,
            summary: "The emphasis may have shifted",
            explanation: "The saved wording narrows the earlier established claim.",
            ideaIds: ["idea-1"],
          }],
        }),
      },
    });
    expect(result.status).toBe(DRAFT_OPERATION_INTERPRETATION_STATUSES.responded);
    const retained = await conversations.getConversationWorkspace("conversation-1");
    expect(retained?.messages.map((message) => message.role)).toEqual(["user", "assistant", "assistant"]);
    expect(retained?.ideaMap.potentialConflicts?.[0]).toMatchObject({
      id: "conflict-1",
      draftChange: { fromRevision: 1, toRevision: 2 },
    });
  });

  it("does not call the model for obvious maintenance", async () => {
    const conversations = await store();
    const interpret = vi.fn();
    const result = await interpretSavedDraftChange({
      conversationId: "conversation-1",
      change: { ...change, removedText: "Power matters", addedText: "power matters." },
      conversations,
      model: { interpret },
    });
    expect(result).toEqual({
      status: DRAFT_OPERATION_INTERPRETATION_STATUSES.notNeeded,
    });
    expect(interpret).not.toHaveBeenCalled();
  });

  it("reports failure without removing or changing the saved draft change", async () => {
    const conversations = await store();
    const result = await interpretSavedDraftChange({
      conversationId: "conversation-1",
      change,
      conversations,
      model: { interpret: async () => { throw new Error("offline"); } },
    });
    expect(result).toEqual({
      status: DRAFT_OPERATION_INTERPRETATION_STATUSES.failed,
      failureStage: DRAFT_OPERATION_INTERPRETATION_FAILURE_STAGES.generation,
    });
    expect((await conversations.getConversationWorkspace("conversation-1"))?.messages).toHaveLength(2);
    expect(change.toRevision).toBe(2);
  });

  it("drops an invalid optional conflict without losing useful commentary", async () => {
    const conversations = await store();
    const result = await interpretSavedDraftChange({
      conversationId: "conversation-1",
      change,
      conversations,
      model: {
        interpret: async () => ({
          type: "conceptual_change",
          assistantMessage: "It sounds as though answerability is the sharper claim. Is that right?",
          potentialConflicts: [{
            scope: POTENTIAL_CONFLICT_SCOPES.betweenIdeas,
            summary: "Invalid model reference",
            explanation: "One referenced idea does not exist.",
            ideaIds: ["idea-1", "invented-idea"],
          }],
        }),
      },
    });
    expect(result.status).toBe(DRAFT_OPERATION_INTERPRETATION_STATUSES.responded);
    const retained = await conversations.getConversationWorkspace("conversation-1");
    expect(retained?.messages.at(-1)?.content).toContain("answerability");
    expect(retained?.ideaMap.potentialConflicts ?? []).toEqual([]);
  });
});
