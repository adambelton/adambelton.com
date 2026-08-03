import { createDatabaseClient } from "packages/db/src/client/database-client";
import { createPrismaConversationPersistence } from "packages/db/src/adapters/socratic-draft/conversation-persistence";
import {
  createConversationStore,
  type PersistentConversationStore,
  type TemporaryConversationStore,
} from "packages/products/src/socratic-draft/server/capabilities/conversation";
import { createInMemoryConversationPersistence } from "apps/api/src/products/socratic-draft/adapters/persistence/in-memory-conversation-persistence";

export type ConversationStoreAccess = {
  isSignedIn: boolean;
  isOwner: boolean;
  userId?: string;
};

export type ConversationStoreResolver = {
  (access: ConversationStoreAccess & { isOwner: true }): PersistentConversationStore | null;
  (access: ConversationStoreAccess & { isOwner: false }): TemporaryConversationStore | null;
  (access: ConversationStoreAccess): PersistentConversationStore | TemporaryConversationStore | null;
};

export function createConversationStoreResolver(configuration: {
  databaseUrl: string | undefined;
  onTemporaryClear?: (userId: string, conversationId: string) => void | Promise<void>;
}): ConversationStoreResolver {
  const temporaryStores = new Map<string, TemporaryConversationStore>();
  const ownerStores = new Map<string, PersistentConversationStore>();

  const resolve = (access: ConversationStoreAccess) => {
    if (!access.isSignedIn || !access.userId) return null;
    if (access.isOwner) {
      const existing = ownerStores.get(access.userId);
      if (existing) return existing;
      const persistence = configuration.databaseUrl
        ? createPrismaConversationPersistence(
            createDatabaseClient(configuration.databaseUrl),
            access.userId,
          )
        : createInMemoryConversationPersistence();
      const store = createConversationStore(persistence);
      ownerStores.set(access.userId, store);
      return store;
    }

    const existing = temporaryStores.get(access.userId);
    if (existing) return existing;
    let currentConversationId: string | null = null;
    const store = createConversationStore(
      createInMemoryConversationPersistence({
        temporary: true,
        onClear: (conversationId) =>
          configuration.onTemporaryClear?.(access.userId!, conversationId),
      }),
      {
        initializeOnAppend: true,
        createId: () => {
          currentConversationId ??= globalThis.crypto.randomUUID();
          return currentConversationId;
        },
      },
    );
    temporaryStores.set(access.userId, store);
    return store;
  };

  return resolve as ConversationStoreResolver;
}
