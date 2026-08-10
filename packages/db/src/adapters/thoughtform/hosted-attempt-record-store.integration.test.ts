import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDatabaseClient, type DatabaseClient } from "packages/db/src/client/database-client";
import { PrismaThoughtFormHostedAttemptRecordStore } from "packages/db/src/adapters/thoughtform/hosted-attempt-record-store";
import {
  HOSTED_ATTEMPT_ACTIONS,
  HOSTED_ATTEMPT_OUTCOMES,
} from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";

const databaseUrl = process.env.DATABASE_URL;

describe.skipIf(!databaseUrl)("Prisma hosted-attempt record store integration", () => {
  let database: DatabaseClient;
  const userId = `attempt-integration-${globalThis.crypto.randomUUID()}`;
  const otherUserId = `attempt-integration-${globalThis.crypto.randomUUID()}`;

  beforeAll(async () => {
    database = createDatabaseClient(databaseUrl!);
    await database.user.createMany({
      data: [userId, otherUserId].map((id) => ({
        id,
        name: "Hosted attempt integration test",
        email: `${id}@example.invalid`,
      })),
    });
  });

  afterAll(async () => {
    await database.user.deleteMany({ where: { id: { in: [userId, otherUserId] } } });
    await database.$disconnect();
  });

  it("admits concurrent idempotent reservations and completes exactly once", async () => {
    const store = new PrismaThoughtFormHostedAttemptRecordStore(database, userId);
    const admission = {
      action: HOSTED_ATTEMPT_ACTIONS.conversationResponse,
      operationId: "concurrent-operation",
    };
    const [first, second] = await Promise.all([
      store.admit(admission),
      store.admit(admission),
    ]);
    expect(first.id).toBe(second.id);

    await Promise.all([
      store.complete({
        attemptId: first.id,
        outcome: HOSTED_ATTEMPT_OUTCOMES.succeeded,
        usage: usage(12),
        completedAt: "2026-08-10T12:00:00.000Z",
      }),
      store.complete({
        attemptId: first.id,
        outcome: HOSTED_ATTEMPT_OUTCOMES.providerFailed,
        usage: usage(99),
        completedAt: "2026-08-10T12:01:00.000Z",
      }),
    ]);

    const rows = await database.thoughtFormHostedAttempt.findMany({
      where: { userId, operationId: admission.operationId },
    });
    expect(rows).toHaveLength(1);
    expect([12, 99]).toContain(rows[0]?.inputTokens);
    expect(rows[0]?.completedAt).not.toBeNull();
  });

  it("isolates users and cascades records when the auth user is deleted", async () => {
    const first = new PrismaThoughtFormHostedAttemptRecordStore(database, userId);
    const second = new PrismaThoughtFormHostedAttemptRecordStore(database, otherUserId);
    await first.admit({
      action: HOSTED_ATTEMPT_ACTIONS.draftComposition,
      operationId: "same-operation",
    });
    await second.admit({
      action: HOSTED_ATTEMPT_ACTIONS.draftComposition,
      operationId: "same-operation",
    });
    expect(await database.thoughtFormHostedAttempt.count({
      where: { operationId: "same-operation" },
    })).toBe(2);

    await database.user.delete({ where: { id: otherUserId } });
    expect(await database.thoughtFormHostedAttempt.count({
      where: { operationId: "same-operation" },
    })).toBe(1);
  });

  it("reconciles interrupted attempts, removes expired completions, and stores only the quantitative allowlist", async () => {
    const store = new PrismaThoughtFormHostedAttemptRecordStore(database, userId);
    const interrupted = await store.admit({
      action: HOSTED_ATTEMPT_ACTIONS.ideaMapAnalysis,
      operationId: "interrupted-operation",
    });
    const expired = await store.admit({
      action: HOSTED_ATTEMPT_ACTIONS.savedChangeInterpretation,
      operationId: "expired-operation",
    });
    await database.thoughtFormHostedAttempt.update({
      where: { id: interrupted.id },
      data: { admittedAt: new Date("2026-01-01T00:00:00.000Z") },
    });
    await store.complete({
      attemptId: expired.id,
      outcome: HOSTED_ATTEMPT_OUTCOMES.succeeded,
      usage: usage(7),
      completedAt: "2026-01-02T00:00:00.000Z",
    });

    await expect(store.interruptAdmittedBefore(
      "2026-02-01T00:00:00.000Z",
      "2026-02-01T00:00:00.000Z",
    )).resolves.toBeGreaterThanOrEqual(1);
    await expect(store.deleteCompletedBefore("2026-02-02T00:00:00.000Z"))
      .resolves.toBeGreaterThanOrEqual(2);

    const allowedKeys = [
      "action", "admittedAt", "cacheReadTokens", "cacheWriteTokens",
      "completedAt", "id", "inputTokens", "model", "operationId", "outcome",
      "outputTokens", "reasoningTokens", "userId",
    ];
    const current = await store.admit({
      action: HOSTED_ATTEMPT_ACTIONS.draftComposition,
      operationId: "privacy-shape-operation",
    });
    const row = await database.thoughtFormHostedAttempt.findUniqueOrThrow({
      where: { id: current.id },
    });
    expect(Object.keys(row).sort()).toEqual(allowedKeys.sort());
  });
});

function usage(inputTokens: number) {
  return {
    model: "test-model",
    inputTokens,
    outputTokens: 3,
    reasoningTokens: null,
    cacheReadTokens: null,
    cacheWriteTokens: null,
  };
}
