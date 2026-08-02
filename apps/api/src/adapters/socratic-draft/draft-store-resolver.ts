import { createInMemoryDraftPersistence } from "apps/api/src/adapters/socratic-draft/in-memory-draft-persistence";
import { createDatabaseClient } from "packages/db/src/client";
import { createPrismaDraftPersistence } from "packages/db/src/socratic-draft/draft-persistence";
import {
  createDraftStore,
  type DraftStore,
} from "packages/products/src/socratic-draft/server/draft";

export type DraftStoreAccess = {
  isSignedIn: boolean;
  isOwner: boolean;
  userId?: string;
};

export type DraftStoreResolver = {
  (access: DraftStoreAccess): DraftStore | null;
  clearTemporary(userId: string, conversationId: string): Promise<void>;
};

export function createDraftStoreResolver(configuration: {
  databaseUrl: string | undefined;
}): DraftStoreResolver {
  const temporaryStores = new Map<string, DraftStore>();
  const ownerStores = new Map<string, DraftStore>();

  const resolve = (access: DraftStoreAccess): DraftStore | null => {
    if (!access.isSignedIn || !access.userId) return null;
    const stores = access.isOwner ? ownerStores : temporaryStores;
    const existing = stores.get(access.userId);
    if (existing) return existing;

    const persistence = access.isOwner && configuration.databaseUrl
      ? createPrismaDraftPersistence(
          createDatabaseClient(configuration.databaseUrl),
          access.userId,
        )
      : createInMemoryDraftPersistence();
    const store = createDraftStore(persistence);
    stores.set(access.userId, store);
    return store;
  };

  resolve.clearTemporary = async (userId: string, conversationId: string) => {
    const store = temporaryStores.get(userId);
    if (!store) return;
    await store.deleteDraftWorkspace(conversationId);
    temporaryStores.delete(userId);
  };

  return resolve;
}
