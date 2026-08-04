import { describe, expect, it } from "vitest";
import { deriveDraftChange } from "packages/products/src/socratic-draft/server/capabilities/drafting/draft-change";
import { DRAFT_CONTENT_FORMATS, DRAFT_REVISION_SOURCES, type DraftRevision } from "packages/products/src/socratic-draft/shared";

function revision(revisionNumber: number, body: string): DraftRevision {
  return {
    revision: revisionNumber,
    body,
    contentFormat: DRAFT_CONTENT_FORMATS.semanticMarkdown,
    schemaVersion: 1,
    source: revisionNumber === 1
      ? DRAFT_REVISION_SOURCES.initialComposition
      : DRAFT_REVISION_SOURCES.manualEdit,
    createdAt: "2026-08-03T09:00:00.000Z",
    proposalId: null,
    restoredFromRevision: null,
  };
}

describe("deriveDraftChange", () => {
  it("preserves the exact changed range between adjacent revisions", () => {
    expect(deriveDraftChange(
      revision(1, "Before careful words after."),
      revision(2, "Before clearer words after."),
    )).toEqual({
      fromRevision: 1,
      toRevision: 2,
      scope: "passage",
      start: 7,
      end: 14,
      removedText: "careful",
      addedText: "clearer",
      kinds: ["text"],
    });
  });

  it("does not expose a change for an unchanged or non-adjacent revision", () => {
    expect(deriveDraftChange(revision(1, "Same."), revision(2, "Same."))).toBeNull();
    expect(deriveDraftChange(revision(1, "Before."), revision(3, "After."))).toBeNull();
  });

  it("classifies semantic marks separately from prose", () => {
    expect(deriveDraftChange(
      revision(1, "Careful words."),
      revision(2, "**Careful** words."),
    )).toMatchObject({ kinds: ["mark"] });
  });

  it("falls back to a bounded whole-draft replacement for an oversized range", () => {
    const change = deriveDraftChange(
      revision(1, "a".repeat(4_500)),
      revision(2, "b".repeat(4_500)),
    );

    expect(change).toMatchObject({
      scope: "whole_draft",
      start: 0,
      end: 4_501,
    });
    expect(change?.removedText).toHaveLength(4_501);
    expect(change?.addedText).toHaveLength(4_501);
  });
});
