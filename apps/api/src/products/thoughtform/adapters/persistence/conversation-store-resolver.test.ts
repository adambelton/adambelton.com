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

  it("keeps owner persistence separate from temporary preview state", () => {
    const resolve = createConversationStoreResolver({ databaseUrl: undefined });
    const persistent = resolve({ isSignedIn: true, isOwner: true, userId: "owner-1" });
    const temporary = resolve({ isSignedIn: true, isOwner: false, userId: "owner-1" });
    expect(persistent).not.toBeNull();
    expect(temporary).not.toBeNull();
    expect(persistent).not.toBe(temporary);
  });
});
