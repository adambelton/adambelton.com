import { describe, expect, it } from "vitest";
import { classifyObviousDraftMaintenance } from "packages/products/src/socratic-draft/server/capabilities/drafting/draft-change-classification";
import { DRAFT_CHANGE_INTERPRETATION_TYPES, type DraftChange } from "packages/products/src/socratic-draft/shared";

function change(removedText: string, addedText: string): DraftChange {
  return {
    fromRevision: 1,
    toRevision: 2,
    scope: "passage",
    start: 0,
    end: removedText.length,
    removedText,
    addedText,
  };
}

describe("classifyObviousDraftMaintenance", () => {
  it("suppresses whitespace, punctuation, and casing-only maintenance", () => {
    expect(classifyObviousDraftMaintenance(change("This  matters", "This matters"))).toBe(
      DRAFT_CHANGE_INTERPRETATION_TYPES.textualMaintenance,
    );
    expect(classifyObviousDraftMaintenance(change("This matters", "this matters."))).toBe(
      DRAFT_CHANGE_INTERPRETATION_TYPES.textualMaintenance,
    );
  });

  it("does not guess when wording changes", () => {
    expect(classifyObviousDraftMaintenance(change("This matters", "This no longer matters"))).toBeNull();
    expect(classifyObviousDraftMaintenance(change("The US matters", "The us matters"))).toBeNull();
  });
});
