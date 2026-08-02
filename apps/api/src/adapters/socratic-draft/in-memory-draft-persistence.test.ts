import { describe, expect, it } from "vitest";
import { createInMemoryDraftPersistence } from "apps/api/src/adapters/socratic-draft/in-memory-draft-persistence";
import {
  DRAFT_WRITE_STATUSES,
  createDraftStore,
} from "packages/products/src/socratic-draft/server/draft";

describe("in-memory draft persistence", () => {
  it("supports product-owned draft behavior without defining it in the host", async () => {
    const persistence = createInMemoryDraftPersistence();
    persistence.registerWorkspace("conversation-1");
    const store = createDraftStore(persistence);

    const created = await store.createDraft({
      conversationId: "conversation-1",
      draftId: "draft-1",
      operationId: "compose-1",
      body: "An early draft.",
      createdAt: "2026-08-02T12:00:00.000Z",
    });
    const retried = await store.createDraft({
      conversationId: "conversation-1",
      draftId: "draft-1",
      operationId: "compose-1",
      body: "An early draft.",
      createdAt: "2026-08-02T12:00:00.000Z",
    });

    expect(created.status).toBe(DRAFT_WRITE_STATUSES.changed);
    expect(retried.status).toBe(DRAFT_WRITE_STATUSES.duplicate);
    expect(await store.getDraftWorkspace("conversation-1")).toMatchObject({
      draft: { body: "An early draft.", currentRevision: 1 },
    });
  });

  it("deletes both workspace state and its operation ledger", async () => {
    const persistence = createInMemoryDraftPersistence();
    persistence.registerWorkspace("conversation-1");
    const store = createDraftStore(persistence);
    await store.createDraft({
      conversationId: "conversation-1",
      draftId: "draft-1",
      operationId: "compose-1",
      body: "Temporary text.",
      createdAt: "2026-08-02T12:00:00.000Z",
    });

    await persistence.delete("conversation-1");

    expect(await persistence.load("conversation-1")).toBeNull();
    expect(await persistence.loadCompletedOperation("conversation-1", "compose-1")).toBeNull();
  });
});
