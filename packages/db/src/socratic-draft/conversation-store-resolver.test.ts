import { describe, expect, it } from "vitest";
import { createSocraticDraftConversationStoreResolver } from "packages/db/src/socratic-draft/conversation-store-resolver";

describe("Socratic Draft conversation store resolver", () => {
  it("does not provide an conversation store for signed-out users", () => {
    const resolveConversationStore = createSocraticDraftConversationStoreResolver({
      databaseUrl: undefined,
    });

    expect(
      resolveConversationStore({ isSignedIn: false, isOwner: false }),
    ).toBeNull();
  });

  it("isolates ephemeral stores by signed-in user", () => {
    const resolveConversationStore = createSocraticDraftConversationStoreResolver({
      databaseUrl: undefined,
    });

    const firstStore = resolveConversationStore({
      isSignedIn: true,
      isOwner: false,
      userId: "visitor-1",
    });
    const sameUserStore = resolveConversationStore({
      isSignedIn: true,
      isOwner: false,
      userId: "visitor-1",
    });
    const otherUserStore = resolveConversationStore({
      isSignedIn: true,
      isOwner: false,
      userId: "visitor-2",
    });

    expect(firstStore).toBe(sameUserStore);
    expect(firstStore).not.toBe(otherUserStore);
  });

  it("does not let one ephemeral user read another user's conversation", async () => {
    const resolveConversationStore = createSocraticDraftConversationStoreResolver({
      databaseUrl: undefined,
    });
    const firstStore = resolveConversationStore({
      isSignedIn: true,
      isOwner: false,
      userId: "visitor-1",
    });
    const secondStore = resolveConversationStore({
      isSignedIn: true,
      isOwner: false,
      userId: "visitor-2",
    });
    const conversationId = firstStore?.createConversationId();

    expect(conversationId).toBeTruthy();
    await expect(
      secondStore?.getConversationMessages(conversationId ?? ""),
    ).resolves.toBeNull();
  });

  it("provides a separate owner store", () => {
    const resolveConversationStore = createSocraticDraftConversationStoreResolver({
      databaseUrl: undefined,
    });

    const ownerStore = resolveConversationStore({
      isSignedIn: true,
      isOwner: true,
      userId: "owner-1",
    });
    const ephemeralStore = resolveConversationStore({
      isSignedIn: true,
      isOwner: false,
      userId: "visitor-1",
    });

    expect(ownerStore).not.toBeNull();
    expect(ownerStore).not.toBe(ephemeralStore);
  });

  it("keeps an owner's temporary preview separate from their persistent store", () => {
    const resolveConversationStore = createSocraticDraftConversationStoreResolver({
      databaseUrl: undefined,
    });

    const persistentStore = resolveConversationStore({
      isSignedIn: true,
      isOwner: true,
      userId: "owner-1",
    });
    const temporaryStore = resolveConversationStore({
      isSignedIn: true,
      isOwner: false,
      userId: "owner-1",
    });

    expect(persistentStore).not.toBeNull();
    expect(temporaryStore).not.toBeNull();
    expect(persistentStore).not.toBe(temporaryStore);
  });

  it("requires an authenticated user id for an owner store", () => {
    const resolveConversationStore = createSocraticDraftConversationStoreResolver({
      databaseUrl: undefined,
    });

    expect(resolveConversationStore({ isSignedIn: true, isOwner: true })).toBeNull();
  });

  it("requires an authenticated user id for an ephemeral store", () => {
    const resolveConversationStore = createSocraticDraftConversationStoreResolver({
      databaseUrl: undefined,
    });

    expect(
      resolveConversationStore({ isSignedIn: true, isOwner: false }),
    ).toBeNull();
  });
});
