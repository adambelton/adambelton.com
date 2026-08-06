import { describe, expect, it } from "vitest";
import { createConversationStoreResolver } from "apps/api/src/products/thoughtform/adapters/persistence/conversation-store-resolver";

describe("ThoughtForm conversation store resolver", () => {
  it("does not provide a store without a signed-in user id", () => {
    const resolve = createConversationStoreResolver({ databaseUrl: undefined });
    expect(resolve({ isSignedIn: false, isOwner: false })).toBeNull();
    expect(resolve({ isSignedIn: true, isOwner: true })).toBeNull();
    expect(resolve({ isSignedIn: true, isOwner: false })).toBeNull();
  });

  it("isolates temporary stores by user", () => {
    const resolve = createConversationStoreResolver({ databaseUrl: undefined });
    const first = resolve({ isSignedIn: true, isOwner: false, userId: "visitor-1" });
    const same = resolve({ isSignedIn: true, isOwner: false, userId: "visitor-1" });
    const other = resolve({ isSignedIn: true, isOwner: false, userId: "visitor-2" });
    expect(first).toBe(same);
    expect(first).not.toBe(other);
  });

  it("keeps saved owner persistence separate from temporary workspace state", () => {
    const resolve = createConversationStoreResolver({ databaseUrl: undefined });
    const persistent = resolve({ isSignedIn: true, isOwner: true, userId: "owner-1" });
    const temporary = resolve({ isSignedIn: true, isOwner: false, userId: "owner-1" });
    expect(persistent).not.toBeNull();
    expect(temporary).not.toBeNull();
    expect(persistent).not.toBe(temporary);
  });

  it("creates a fresh temporary workspace identity after clearing", async () => {
    const resolve = createConversationStoreResolver({ databaseUrl: undefined });
    const store = resolve({
      isSignedIn: true,
      isOwner: false,
      userId: "owner-1",
    });
    expect(store).not.toBeNull();
    const firstId = store!.createConversationId();
    await store!.appendConversationTurn({
      conversationId: firstId,
      operationId: "first-turn",
      expectedMessageCount: 0,
      expectedIdeaMapRevision: 0,
      ideaMap: { revision: 0, ideas: [] },
      userMessage: { role: "user", content: "First workspace" },
      assistantMessage: { role: "assistant", content: "First response" },
    });

    await store!.clearCurrentConversation();
    const secondId = store!.createConversationId();

    expect(secondId).not.toBe(firstId);
    await expect(store!.getConversationWorkspace(firstId)).resolves.toBeNull();
  });
});
