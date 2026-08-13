import { describe, expect, it } from "vitest";
import type { DatabaseClient } from "packages/db/src/client/database-client";
import { PrismaThoughtFormPortfolioDemoOperationsReader } from "packages/db/src/adapters/thoughtform/portfolio-demo-operations-reader";
import type { HostedAttemptBudgetPolicy } from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";

describe("portfolio-demo operations reader", () => {
  it("returns 25 accounts with an opaque next cursor", async () => {
    const database = {
      $queryRaw: async () => Array.from({ length: 26 }, (_, index) => ({
        id: `user-${String(index).padStart(2, "0")}`,
        email: `user-${index}@example.invalid`,
        is_owner: false,
        latest_operation_at: new Date(`2038-08-13T${String(23 - Math.min(index, 23)).padStart(2, "0")}:00:00.000Z`),
      })),
      thoughtFormHostedAttempt: { findMany: async () => [] },
    } as unknown as DatabaseClient;

    const result = await new PrismaThoughtFormPortfolioDemoOperationsReader(
      database, policy, () => new Date("2038-08-13T23:30:00.000Z"),
    ).readPage();

    expect(result.status).toBe("found");
    if (result.status !== "found") throw new Error("Expected a page.");
    expect(result.overview.accounts).toHaveLength(25);
    expect(result.overview.nextCursor).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

const policy: HostedAttemptBudgetPolicy = {
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
