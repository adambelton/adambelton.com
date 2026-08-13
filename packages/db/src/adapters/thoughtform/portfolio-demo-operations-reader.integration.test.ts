import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDatabaseClient, type DatabaseClient } from "packages/db/src/client/database-client";
import { PrismaThoughtFormPortfolioDemoOperationsReader } from "packages/db/src/adapters/thoughtform/portfolio-demo-operations-reader";
import type { HostedAttemptBudgetPolicy } from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";

const databaseUrl = process.env.DATABASE_URL;

describe.skipIf(!databaseUrl)("portfolio-demo operations reader integration", () => {
  let database: DatabaseClient;
  const userId = `operations-reader-${globalThis.crypto.randomUUID()}`;

  beforeAll(async () => {
    database = createDatabaseClient(databaseUrl!);
    await database.user.create({ data: { id: userId, name: "Operations reader", email: `${userId}@example.invalid` } });
    await database.thoughtFormHostedAttempt.create({ data: {
      id: globalThis.crypto.randomUUID(), userId, operationId: "operation-1",
      action: "conversation_response", outcome: "succeeded", model: "test-model",
      inputTokens: 100, outputTokens: 20,
      admittedAt: new Date("2038-08-13T12:00:00.000Z"),
      completedAt: new Date("2038-08-13T12:00:01.000Z"),
    } });
  });

  afterAll(async () => {
    await database.user.deleteMany({ where: { id: userId } });
    await database.$disconnect();
  });

  it("returns content-free current and retained account totals", async () => {
    const result = await new PrismaThoughtFormPortfolioDemoOperationsReader(
      database, testPolicy, () => new Date("2038-08-13T13:00:00.000Z"),
    ).readPage();
    expect(result.status).toBe("found");
    if (result.status !== "found") throw new Error("Expected overview.");
    const account = result.overview.accounts.find((candidate) => candidate.email.includes(userId));
    expect(account).toMatchObject({
      latestOperationAt: "2038-08-13T12:00:00.000Z",
      current: { operations: 1, tokens: 120 },
      retained: { operations: 1, tokens: 120 },
      retainedModels: [{ model: "test-model", operations: 1, tokens: 120 }],
    });
    expect(JSON.stringify(result)).not.toMatch(/message|draft|prompt|idea/i);
  });

  it("returns an invalid cursor outcome without querying private stores", async () => {
    await expect(new PrismaThoughtFormPortfolioDemoOperationsReader(
      database, testPolicy,
    ).readPage("not-a-cursor")).resolves.toEqual({ status: "invalid_cursor" });
  });
});

const testPolicy: HostedAttemptBudgetPolicy = {
  personalOperationLimit: 10,
  personalTokenLimit: 1_000,
  globalOperationLimit: 20,
  globalTokenLimit: 2_000,
  reservationTokens: {
    conversation_response: 10,
    idea_map_analysis: 10,
    draft_composition: 10,
    revision_proposal: 10,
    saved_change_interpretation: 10,
  },
};
