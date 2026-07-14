import { createInMemoryEntryStore } from "apps/api/src/routes/socratic-draft/in-memory-entry-store";
import { createDatabaseClient, createPrismaEntryStore } from "packages/db/src";
import type { EntryStore } from "packages/products/src/socratic-draft/server/conversation";

export function createSocraticDraftEntryStore(): EntryStore {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return createInMemoryEntryStore();
  }

  return createPrismaEntryStore(createDatabaseClient(databaseUrl));
}
