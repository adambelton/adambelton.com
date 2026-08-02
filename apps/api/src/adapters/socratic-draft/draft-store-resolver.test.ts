import { describe, expect, it } from "vitest";
import { createDraftStoreResolver } from "apps/api/src/adapters/socratic-draft/draft-store-resolver";

describe("Socratic Draft draft store resolver", () => {
  it("does not provide a store without a signed-in user id", () => {
    const resolve = createDraftStoreResolver({ databaseUrl: undefined });
    expect(resolve({ isSignedIn: false, isOwner: false })).toBeNull();
    expect(resolve({ isSignedIn: true, isOwner: true })).toBeNull();
    expect(resolve({ isSignedIn: true, isOwner: false })).toBeNull();
  });

  it("isolates temporary stores by user", () => {
    const resolve = createDraftStoreResolver({ databaseUrl: undefined });
    const first = resolve({ isSignedIn: true, isOwner: false, userId: "visitor-1" });
    const same = resolve({ isSignedIn: true, isOwner: false, userId: "visitor-1" });
    const other = resolve({ isSignedIn: true, isOwner: false, userId: "visitor-2" });
    expect(first).toBe(same);
    expect(first).not.toBe(other);
  });

  it("keeps owner persistence separate from temporary preview state", () => {
    const resolve = createDraftStoreResolver({ databaseUrl: undefined });
    const persistent = resolve({ isSignedIn: true, isOwner: true, userId: "owner-1" });
    const temporary = resolve({ isSignedIn: true, isOwner: false, userId: "owner-1" });
    expect(persistent).not.toBeNull();
    expect(temporary).not.toBeNull();
    expect(persistent).not.toBe(temporary);
  });

  it("removes a temporary draft when its conversation lifecycle ends", async () => {
    const resolve = createDraftStoreResolver({ databaseUrl: undefined });
    const store = resolve({
      isSignedIn: true,
      isOwner: false,
      userId: "visitor-1",
    });
    expect(store).not.toBeNull();
    await store!.createDraft({
      conversationId: "conversation-1",
      draftId: "draft-1",
      operationId: "compose-1",
      body: "Temporary writing.",
      createdAt: "2026-08-02T12:00:00.000Z",
    });

    await resolve.clearTemporary("visitor-1", "conversation-1");

    await expect(store!.getDraftWorkspace("conversation-1")).resolves.toBeNull();
    expect(resolve({
      isSignedIn: true,
      isOwner: false,
      userId: "visitor-1",
    })).not.toBe(store);
  });
});
