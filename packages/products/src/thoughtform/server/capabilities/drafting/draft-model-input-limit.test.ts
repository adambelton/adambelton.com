import { describe, expect, it } from "vitest";
import {
  DraftOperationInputTooLargeError,
  draftOperationInputBytes,
  MAX_DRAFT_OPERATION_INPUT_BYTES,
  requireDraftOperationInputWithinLimit,
} from "packages/products/src/thoughtform/server/capabilities/drafting/draft-model-input-limit";

describe("draft model input limit", () => {
  it("measures representative composition, revision, and saved-change inputs below 16 KiB", () => {
    const inputs = [
      {
        selectedIdeas: [{
          title: "Influence and freedom",
          synthesis: "I can state the opportunity, cost, and conditions without pretending certainty.",
          substance: "Influence could improve decisions; unstructured time is how I recover and think.",
          unresolvedQuestions: ["Which conditions make the trade worthwhile?"],
        }],
        relevantConversationLanguage: [
          "I am deciding whether to take a role that offers influence but less freedom.",
          "I do not want ambition to make that cost invisible.",
        ],
        instruction: "Compose the current understanding, preserving the unresolved decision.",
      },
      {
        draftBody: "A".repeat(4_000),
        scope: "whole_draft",
        originalContent: "A".repeat(4_000),
        userInstruction: "Clarify the distinction between assistance and authorship.",
      },
      {
        change: {
          fromRevision: 1,
          toRevision: 2,
          removedText: "I feel guilty.",
          addedText: "The guilt may be grief rather than evidence that leaving is wrong.",
        },
        currentIdeaMap: { revision: 1, ideas: [] },
        previousMessages: [
          { role: "user", content: "I want to leave, and I feel guilty about wanting it." },
          { role: "assistant", content: "What does the guilt seem to mean?" },
        ],
      },
    ];

    expect(inputs.map(draftOperationInputBytes)).toEqual([565, 8_138, 368]);
    for (const input of inputs) {
      expect(() => requireDraftOperationInputWithinLimit(input)).not.toThrow();
    }
  });

  it("rejects model input larger than 16 KiB", () => {
    expect(() => requireDraftOperationInputWithinLimit({
      draftBody: "x".repeat(MAX_DRAFT_OPERATION_INPUT_BYTES),
    })).toThrow(DraftOperationInputTooLargeError);
  });
});
