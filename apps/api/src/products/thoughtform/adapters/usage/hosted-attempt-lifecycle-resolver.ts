import { createDatabaseClient } from "packages/db/src/client/database-client";
import { PrismaThoughtFormHostedAttemptRecordStore } from "packages/db/src/adapters/thoughtform/hosted-attempt-record-store";
import type { HostedAttemptLifecycle } from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";
import { HostedAttemptLifecycleAdapter } from "apps/api/src/products/thoughtform/adapters/usage/hosted-attempt-lifecycle-adapter";
import type { HostedAttemptBudgetPolicy } from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";

interface HostedAttemptLifecycleResolverConfiguration {
  databaseUrl?: string;
  isHostedAiEnabled: boolean;
  policy: HostedAttemptBudgetPolicy;
}

export function createHostedAttemptLifecycleResolver(
  configuration: HostedAttemptLifecycleResolverConfiguration,
) {
  if (!configuration.databaseUrl || !configuration.isHostedAiEnabled) {
    return (_userId: string): HostedAttemptLifecycle | null => null;
  }
  const database = createDatabaseClient(configuration.databaseUrl);
  const lifecycles = new Map<string, HostedAttemptLifecycle>();
  return (userId: string, isOwner: boolean) => {
    const key = `${userId}:${isOwner}`;
    const existing = lifecycles.get(key);
    if (existing) return existing;
    const lifecycle = new HostedAttemptLifecycleAdapter(
      new PrismaThoughtFormHostedAttemptRecordStore(
        database,
        userId,
        undefined,
        configuration.policy,
        isOwner,
      ),
    );
    lifecycles.set(key, lifecycle);
    return lifecycle;
  };
}
