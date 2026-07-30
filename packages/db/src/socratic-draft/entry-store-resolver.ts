import { createDatabaseClient } from "packages/db/src/client";
import { createInMemoryEntryStore } from "packages/db/src/socratic-draft/in-memory-entry-store";
import { createPrismaEntryStore } from "packages/db/src/socratic-draft/entry-store";
import type { EntryStore } from "packages/products/src/socratic-draft/server/conversation";

export type SocraticDraftEntryStoreAccess = {
  isSignedIn: boolean;
  isOwner: boolean;
};

export type CreateSocraticDraftEntryStoreResolverOptions = {
  databaseUrl: string | undefined;
};

export function createSocraticDraftEntryStoreResolver({
  databaseUrl,
}: CreateSocraticDraftEntryStoreResolverOptions) {
  const ephemeralEntryStore = createInMemoryEntryStore();
  let ownerEntryStore: EntryStore | null = null;

  return function getSocraticDraftEntryStoreForAccess({
    isSignedIn,
    isOwner,
  }: SocraticDraftEntryStoreAccess): EntryStore | null {
    if (!isSignedIn) {
      return null;
    }

    if (!isOwner) {
      return ephemeralEntryStore;
    }

    if (ownerEntryStore) {
      return ownerEntryStore;
    }

    ownerEntryStore = databaseUrl
      ? createPrismaEntryStore(createDatabaseClient(databaseUrl))
      : createInMemoryEntryStore();

    return ownerEntryStore;
  };
}
