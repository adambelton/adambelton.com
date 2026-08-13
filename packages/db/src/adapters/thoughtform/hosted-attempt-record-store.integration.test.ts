import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDatabaseClient, type DatabaseClient } from "packages/db/src/client/database-client";
import { PrismaThoughtFormHostedAttemptRecordStore } from "packages/db/src/adapters/thoughtform/hosted-attempt-record-store";
import {
  measurementOperationId,
  PrismaThoughtFormUsageMeasurementReader,
} from "packages/db/src/adapters/thoughtform/usage-measurement-reader";
import {
  HOSTED_ATTEMPT_ACTIONS,
  HOSTED_ATTEMPT_OUTCOMES,
  HostedUsageLimitedError,
  type HostedAttemptBudgetPolicy,
} from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";

const databaseUrl = process.env.DATABASE_URL;

describe.skipIf(!databaseUrl)("Prisma hosted-attempt record store integration", () => {
  let database: DatabaseClient;
  const userId = `attempt-integration-${globalThis.crypto.randomUUID()}`;
  const otherUserId = `attempt-integration-${globalThis.crypto.randomUUID()}`;
  const limitedUserId = `attempt-integration-${globalThis.crypto.randomUUID()}`;
  const tokenUserId = `attempt-integration-${globalThis.crypto.randomUUID()}`;
  const ownerUserId = `attempt-integration-${globalThis.crypto.randomUUID()}`;

  beforeAll(async () => {
    database = createDatabaseClient(databaseUrl!);
    await database.user.createMany({
      data: [userId, otherUserId, limitedUserId, tokenUserId, ownerUserId].map((id) => ({
        id,
        name: "Hosted attempt integration test",
        email: `${id}@example.invalid`,
      })),
    });
  });

  afterAll(async () => {
    await database.user.deleteMany({ where: { id: { in: [userId, otherUserId, limitedUserId, tokenUserId, ownerUserId] } } });
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

  it("reads one measurement run without content or unrelated attempts", async () => {
    const store = new PrismaThoughtFormHostedAttemptRecordStore(database, userId);
    const operationId = measurementOperationId({
      runId: "integration-run",
      scenarioId: "guided-vague-discovery",
      repetition: 1,
      sequence: 1,
    });
    const measured = await store.admit({
      action: HOSTED_ATTEMPT_ACTIONS.conversationResponse,
      operationId,
    });
    await store.complete({
      attemptId: measured.id,
      outcome: HOSTED_ATTEMPT_OUTCOMES.succeeded,
      usage: usage(17),
      completedAt: "2026-08-13T12:00:01.000Z",
    });
    await store.admit({
      action: HOSTED_ATTEMPT_ACTIONS.conversationResponse,
      operationId: "unrelated-operation",
    });

    const attempts = await new PrismaThoughtFormUsageMeasurementReader(
      database,
      userId,
    ).readRun("integration-run");

    expect(attempts).toEqual([expect.objectContaining({
      scenarioId: "guided-vague-discovery",
      repetition: 1,
      operationId,
      action: HOSTED_ATTEMPT_ACTIONS.conversationResponse,
      outcome: HOSTED_ATTEMPT_OUTCOMES.succeeded,
      inputTokens: 17,
    })]);
    expect(JSON.stringify(attempts)).not.toContain("Hosted attempt integration test");
  });

  it("atomically admits only one of two concurrent operations at the limit", async () => {
    const policy = limitedPolicy({ personalOperationLimit: 1 });
    const now = () => new Date("2026-08-13T12:00:00.000Z");
    const first = new PrismaThoughtFormHostedAttemptRecordStore(
      database, limitedUserId, () => globalThis.crypto.randomUUID(), policy, false, now,
    );
    const second = new PrismaThoughtFormHostedAttemptRecordStore(
      database, limitedUserId, () => globalThis.crypto.randomUUID(), policy, false, now,
    );
    const results = await Promise.allSettled([
      first.admit({ action: HOSTED_ATTEMPT_ACTIONS.conversationResponse, operationId: "limited-one" }),
      second.admit({ action: HOSTED_ATTEMPT_ACTIONS.conversationResponse, operationId: "limited-two" }),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejection = results.find((result) => result.status === "rejected");
    expect(rejection).toMatchObject({ reason: expect.any(HostedUsageLimitedError) });
    expect(await database.thoughtFormHostedAttempt.count({ where: { userId: limitedUserId } })).toBe(1);
  });

  it("replaces a reservation with completed input and output tokens", async () => {
    const policy = limitedPolicy({ personalTokenLimit: 10 });
    const now = () => new Date("2026-08-13T12:00:00.000Z");
    const store = new PrismaThoughtFormHostedAttemptRecordStore(
      database, tokenUserId, () => globalThis.crypto.randomUUID(), policy, false, now,
    );
    const admitted = await store.admit({
      action: HOSTED_ATTEMPT_ACTIONS.conversationResponse,
      operationId: "token-one",
    });
    await store.complete({
      attemptId: admitted.id,
      outcome: HOSTED_ATTEMPT_OUTCOMES.succeeded,
      usage: usage(8),
      completedAt: "2026-08-13T12:00:01.000Z",
    });

    await expect(store.admit({
      action: HOSTED_ATTEMPT_ACTIONS.conversationResponse,
      operationId: "token-two",
    })).rejects.toBeInstanceOf(HostedUsageLimitedError);
  });

  it("exempts the owner from the personal window while retaining global accounting", async () => {
    const policy = limitedPolicy({ personalOperationLimit: 1 });
    const store = new PrismaThoughtFormHostedAttemptRecordStore(
      database,
      ownerUserId,
      () => globalThis.crypto.randomUUID(),
      policy,
      true,
      () => new Date("2035-08-13T12:00:00.000Z"),
    );

    await expect(store.admit({
      action: HOSTED_ATTEMPT_ACTIONS.conversationResponse,
      operationId: "owner-one",
    })).resolves.toBeDefined();
    await expect(store.admit({
      action: HOSTED_ATTEMPT_ACTIONS.conversationResponse,
      operationId: "owner-two",
    })).resolves.toBeDefined();

    const globallyLimited = new PrismaThoughtFormHostedAttemptRecordStore(
      database,
      ownerUserId,
      () => globalThis.crypto.randomUUID(),
      limitedPolicy({ personalOperationLimit: 1, globalOperationLimit: 1 }),
      true,
      () => new Date("2036-08-13T12:00:00.000Z"),
    );
    await globallyLimited.admit({
      action: HOSTED_ATTEMPT_ACTIONS.conversationResponse,
      operationId: "global-one",
    });
    await expect(globallyLimited.admit({
      action: HOSTED_ATTEMPT_ACTIONS.conversationResponse,
      operationId: "global-two",
    })).rejects.toBeInstanceOf(HostedUsageLimitedError);
  });

  it("retains the full reservation when completed usage is missing", async () => {
    const store = new PrismaThoughtFormHostedAttemptRecordStore(
      database,
      tokenUserId,
      () => globalThis.crypto.randomUUID(),
      limitedPolicy({ personalTokenLimit: 9 }),
      false,
      () => new Date("2037-08-13T12:00:00.000Z"),
    );
    const first = await store.admit({
      action: HOSTED_ATTEMPT_ACTIONS.conversationResponse,
      operationId: "missing-usage-one",
    });
    await store.complete({
      attemptId: first.id,
      outcome: HOSTED_ATTEMPT_OUTCOMES.providerFailed,
      usage: { ...usage(1), outputTokens: null },
      completedAt: "2037-08-13T12:00:01.000Z",
    });

    await expect(store.admit({
      action: HOSTED_ATTEMPT_ACTIONS.conversationResponse,
      operationId: "missing-usage-two",
    })).rejects.toBeInstanceOf(HostedUsageLimitedError);
  });
});

function limitedPolicy(overrides: Partial<HostedAttemptBudgetPolicy>): HostedAttemptBudgetPolicy {
  return {
    personalOperationLimit: Number.MAX_SAFE_INTEGER,
    personalTokenLimit: Number.MAX_SAFE_INTEGER,
    globalOperationLimit: Number.MAX_SAFE_INTEGER,
    globalTokenLimit: Number.MAX_SAFE_INTEGER,
    reservationTokens: {
      conversation_response: 5,
      idea_map_analysis: 7,
      draft_composition: 3,
      revision_proposal: 2,
      saved_change_interpretation: 3,
    },
    ...overrides,
  };
}

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
