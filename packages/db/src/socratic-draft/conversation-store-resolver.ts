import { createDatabaseClient } from "packages/db/src/client";
import { createInMemoryConversationStore } from "packages/db/src/socratic-draft/in-memory-conversation-store";
import { createPrismaConversationStore } from "packages/db/src/socratic-draft/conversation-store";
import type { PersistentConversationStore } from "packages/products/src/socratic-draft/server/conversation";

export type SocraticDraftConversationStoreAccess = {
  isSignedIn: boolean;
  isOwner: boolean;
  userId?: string;
};

export type CreateSocraticDraftConversationStoreResolverOptions = {
  databaseUrl: string | undefined;
};

export function createSocraticDraftConversationStoreResolver({
  databaseUrl,
}: CreateSocraticDraftConversationStoreResolverOptions) {
  const ephemeralConversationStores = new Map<
    string,
    PersistentConversationStore
  >();
  let ownerConversationStore: PersistentConversationStore | null = null;
  let ownerConversationStoreUserId: string | null = null;

  return function getSocraticDraftConversationStoreForAccess({
    isSignedIn,
    isOwner,
    userId,
  }: SocraticDraftConversationStoreAccess): PersistentConversationStore | null {
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

      const conversationStore = createInMemoryConversationStore();
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
}
