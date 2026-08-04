import { describe, expect, it } from "vitest";
import { createDraftStore } from "packages/products/src/thoughtform/server/capabilities/drafting";
import { validateDraftChange } from "packages/products/src/thoughtform/server/delivery/http/draft-change-context";
import { TestDraftPersistence } from "packages/products/src/thoughtform/testing/fakes/test-draft-persistence";

describe("validateDraftChange", () => {
  it("accepts only the exact change ending at the current revision", async () => {
    const persistence = new TestDraftPersistence();
    persistence.registerWorkspace("conversation-1");
    const drafts = createDraftStore(persistence);
    await drafts.createDraft({
      conversationId: "conversation-1",
      draftId: "draft-1",
      operationId: "compose-1",
      body: "A careful claim.",
      createdAt: "2026-08-03T09:00:00.000Z",
    });
    await drafts.appendDraftRevision({
      conversationId: "conversation-1",
      operationId: "save-1",
      expectedRevision: 1,
      body: "A clearer claim.",
      source: "manual_edit",
      createdAt: "2026-08-03T09:01:00.000Z",
    });
    const change = {
      fromRevision: 1,
      toRevision: 2,
      scope: "passage" as const,
      start: 2,
      end: 9,
      removedText: "careful",
      addedText: "clearer",
    };

    expect(await validateDraftChange({ conversationId: "conversation-1", drafts, change })).toBe(true);
    expect(await validateDraftChange({
      conversationId: "conversation-1",
      drafts,
      change: { ...change, addedText: "forged" },
    })).toBe(false);
  });
});
