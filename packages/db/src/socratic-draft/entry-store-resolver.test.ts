import { describe, expect, it } from "vitest";
import { createSocraticDraftEntryStoreResolver } from "packages/db/src/socratic-draft/entry-store-resolver";

describe("Socratic Draft entry store resolver", () => {
  it("does not provide an entry store for signed-out users", () => {
    const resolveEntryStore = createSocraticDraftEntryStoreResolver({
      databaseUrl: undefined,
    });

    expect(resolveEntryStore({ isSignedIn: false, isOwner: false })).toBeNull();
  });

  it("provides a shared ephemeral store for signed-in non-owner users", () => {
    const resolveEntryStore = createSocraticDraftEntryStoreResolver({
      databaseUrl: undefined,
    });

    const firstStore = resolveEntryStore({ isSignedIn: true, isOwner: false });
    const secondStore = resolveEntryStore({ isSignedIn: true, isOwner: false });

    expect(firstStore).toBe(secondStore);
  });

  it("provides a separate owner store", () => {
    const resolveEntryStore = createSocraticDraftEntryStoreResolver({
      databaseUrl: undefined,
    });

    const ownerStore = resolveEntryStore({ isSignedIn: true, isOwner: true });
    const ephemeralStore = resolveEntryStore({
      isSignedIn: true,
      isOwner: false,
    });

    expect(ownerStore).not.toBeNull();
    expect(ownerStore).not.toBe(ephemeralStore);
  });
});
