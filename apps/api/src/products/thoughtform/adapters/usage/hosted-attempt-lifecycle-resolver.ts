import { createDatabaseClient } from "packages/db/src/client/database-client";
import { PrismaThoughtFormHostedAttemptRecordStore } from "packages/db/src/adapters/thoughtform/hosted-attempt-record-store";
import type { HostedAttemptLifecycle } from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";
import { HostedAttemptLifecycleAdapter } from "apps/api/src/products/thoughtform/adapters/usage/hosted-attempt-lifecycle-adapter";

export function createHostedAttemptLifecycleResolver(configuration: {
  databaseUrl?: string;
  isHostedAiEnabled: boolean;
}) {
  if (!configuration.databaseUrl || !configuration.isHostedAiEnabled) {
    return (_userId: string): HostedAttemptLifecycle | null => null;
  }
  const database = createDatabaseClient(configuration.databaseUrl);
  const lifecycles = new Map<string, HostedAttemptLifecycle>();
  return (userId: string) => {
    const existing = lifecycles.get(userId);
    if (existing) return existing;
    const lifecycle = new HostedAttemptLifecycleAdapter(
      new PrismaThoughtFormHostedAttemptRecordStore(database, userId),
    );
    lifecycles.set(userId, lifecycle);
    return lifecycle;
  };
}
