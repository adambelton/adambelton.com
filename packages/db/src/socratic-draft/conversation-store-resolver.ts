import { createDatabaseClient } from "packages/db/src/client";
import {
  createInMemoryConversationStore,
  createTemporaryInMemoryConversationStore,
} from "packages/db/src/socratic-draft/in-memory-conversation-store";
import { createPrismaConversationStore } from "packages/db/src/socratic-draft/conversation-store";
import type {
  PersistentConversationStore,
  TemporaryConversationStore,
} from "packages/products/src/socratic-draft/server/conversation";

export type SocraticDraftConversationStoreAccess = {
  isSignedIn: boolean;
  isOwner: boolean;
  userId?: string;
};

export type CreateSocraticDraftConversationStoreResolverOptions = {
  databaseUrl: string | undefined;
};

export type SocraticDraftConversationStoreResolver = {
  (
    access: SocraticDraftConversationStoreAccess & { isOwner: true },
  ): PersistentConversationStore | null;
  (
    access: SocraticDraftConversationStoreAccess & { isOwner: false },
  ): TemporaryConversationStore | null;
  (
    access: SocraticDraftConversationStoreAccess,
  ): PersistentConversationStore | TemporaryConversationStore | null;
};

export function createSocraticDraftConversationStoreResolver({
  databaseUrl,
}: CreateSocraticDraftConversationStoreResolverOptions) {
  const ephemeralConversationStores = new Map<
    string,
    TemporaryConversationStore
  >();
  let ownerConversationStore: PersistentConversationStore | null = null;
  let ownerConversationStoreUserId: string | null = null;

  const resolveConversationStore = function ({
    isSignedIn,
    isOwner,
    userId,
  }: SocraticDraftConversationStoreAccess):
    | PersistentConversationStore
    | TemporaryConversationStore
    | null {
    if (!isSignedIn) {
      return null;
    }

    if (!userId) {
      return null;
    }

    if (!isOwner) {
      const existingStore = ephemeralConversationStores.get(userId);

      if (existingStore) {
        return existingStore;
      }

      const conversationStore = createTemporaryInMemoryConversationStore();
      ephemeralConversationStores.set(userId, conversationStore);
      return conversationStore;
    }

    if (ownerConversationStore && ownerConversationStoreUserId === userId) {
      return ownerConversationStore;
    }

    ownerConversationStore = databaseUrl
      ? createPrismaConversationStore(createDatabaseClient(databaseUrl), userId)
      : createInMemoryConversationStore();
    ownerConversationStoreUserId = userId;

    return ownerConversationStore;
  };

  return resolveConversationStore as SocraticDraftConversationStoreResolver;
}
