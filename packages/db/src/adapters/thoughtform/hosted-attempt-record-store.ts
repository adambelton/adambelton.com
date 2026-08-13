import type { DatabaseClient } from "packages/db/src/client/database-client";
import type {
  HostedAttemptAdmission,
  HostedAttemptRecordStore,
} from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";
import {
  HOSTED_ATTEMPT_OUTCOMES,
  HostedUsageLimitedError,
  type HostedAttemptAction,
  type HostedAttemptBudgetPolicy,
} from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";
import { Prisma } from "packages/db/src/generated/prisma/client";

const MAX_SERIALIZATION_RETRIES = 3;
const UNLIMITED_POLICY: HostedAttemptBudgetPolicy = {
  personalOperationLimit: Number.MAX_SAFE_INTEGER,
  personalTokenLimit: Number.MAX_SAFE_INTEGER,
  globalOperationLimit: Number.MAX_SAFE_INTEGER,
  globalTokenLimit: Number.MAX_SAFE_INTEGER,
  reservationTokens: {
    conversation_response: 0, idea_map_analysis: 0, draft_composition: 0,
    revision_proposal: 0, saved_change_interpretation: 0,
  },
};

interface HostedAttemptUsageRow {
  action: string;
  completedAt: Date | null;
  inputTokens: number | null;
  outputTokens: number | null;
}

interface HostedAttemptUsageTotal {
  operations: number;
  tokens: number;
}

export class PrismaThoughtFormHostedAttemptRecordStore
  implements HostedAttemptRecordStore
{
  constructor(
    private readonly database: DatabaseClient,
    private readonly userId: string,
    private readonly createId: () => string = () => globalThis.crypto.randomUUID(),
    private readonly policy: HostedAttemptBudgetPolicy = UNLIMITED_POLICY,
    private readonly isOwner = false,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async admit(input: HostedAttemptAdmission) {
    for (let attempt = 1; attempt <= MAX_SERIALIZATION_RETRIES; attempt += 1) {
      try {
        return await this.admitAtomically(input);
      } catch (error) {
        if (!isSerializationConflict(error) || attempt === MAX_SERIALIZATION_RETRIES) throw error;
      }
    }
    throw new Error("Hosted attempt admission retry exhausted.");
  }

  private async admitAtomically(input: HostedAttemptAdmission) {
    return this.database.$transaction(async (transaction) => {
      const existing = await transaction.thoughtFormHostedAttempt.findUnique({
        where: {
          userId_action_operationId: {
            userId: this.userId,
            action: input.action,
            operationId: input.operationId,
          },
        },
        select: { id: true, admittedAt: true },
      });
      const admittedAt = this.now();
      const windowStart = utcDayStart(existing?.admittedAt ?? admittedAt);
      const resetsAt = new Date(windowStart.getTime() + 24 * 60 * 60 * 1_000);
      if (existing) {
        return {
          id: existing.id,
          isNew: false,
          allowance: await personalAllowance(transaction, this.userId, windowStart, resetsAt, this.policy),
        };
      }
      const rows = await transaction.thoughtFormHostedAttempt.findMany({
        where: { admittedAt: { gte: windowStart, lt: resetsAt } },
        select: { userId: true, action: true, completedAt: true, inputTokens: true, outputTokens: true },
      });
      const reservation = this.policy.reservationTokens[input.action];
      const global = usage(rows, this.policy.reservationTokens);
      const personal = usage(rows.filter((row) => row.userId === this.userId), this.policy.reservationTokens);
      const remainingOperations = Math.max(0, this.policy.personalOperationLimit - personal.operations);
      if (
        global.operations + 1 > this.policy.globalOperationLimit ||
        global.tokens + reservation > this.policy.globalTokenLimit ||
        (!this.isOwner && (
          personal.operations + 1 > this.policy.personalOperationLimit ||
          personal.tokens + reservation > this.policy.personalTokenLimit
        ))
      ) {
        throw new HostedUsageLimitedError({
          remainingOperations: this.isOwner ? this.policy.personalOperationLimit : remainingOperations,
          resetsAt: resetsAt.toISOString(),
        });
      }
      const record = await transaction.thoughtFormHostedAttempt.create({
        data: {
          id: this.createId(),
          userId: this.userId,
          action: input.action,
          operationId: input.operationId,
          admittedAt,
        },
        select: { id: true },
      });
      return {
        ...record,
        isNew: true,
        allowance: {
          remainingOperations: this.isOwner
            ? this.policy.personalOperationLimit
            : Math.max(0, remainingOperations - 1),
          resetsAt: resetsAt.toISOString(),
        },
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  async complete(input: Parameters<HostedAttemptRecordStore["complete"]>[0]) {
    await this.database.thoughtFormHostedAttempt.updateMany({
      where: { id: input.attemptId, userId: this.userId, completedAt: null },
      data: {
        outcome: input.outcome,
        model: input.usage.model,
        inputTokens: input.usage.inputTokens,
        outputTokens: input.usage.outputTokens,
        reasoningTokens: input.usage.reasoningTokens,
        cacheReadTokens: input.usage.cacheReadTokens,
        cacheWriteTokens: input.usage.cacheWriteTokens,
        completedAt: new Date(input.completedAt),
      },
    });
  }

  async interruptAdmittedBefore(cutoff: string, completedAt: string) {
    const result = await this.database.thoughtFormHostedAttempt.updateMany({
      where: {
        userId: this.userId,
        completedAt: null,
        admittedAt: { lt: new Date(cutoff) },
      },
      data: {
        outcome: HOSTED_ATTEMPT_OUTCOMES.interrupted,
        completedAt: new Date(completedAt),
      },
    });
    return result.count;
  }

  async deleteCompletedBefore(cutoff: string) {
    const result = await this.database.thoughtFormHostedAttempt.deleteMany({
      where: {
        userId: this.userId,
        completedAt: { lt: new Date(cutoff) },
      },
    });
    return result.count;
  }

  async discard(attemptId: string) {
    await this.database.thoughtFormHostedAttempt.deleteMany({
      where: { id: attemptId, userId: this.userId, completedAt: null },
    });
  }
}

function usage(
  rows: HostedAttemptUsageRow[],
  reservations: Record<HostedAttemptAction, number>,
): HostedAttemptUsageTotal {
  return rows.reduce((total, row) => {
    const reservation = reservations[row.action as HostedAttemptAction] ?? 0;
    const tokens = row.completedAt && row.inputTokens !== null && row.outputTokens !== null
      ? row.inputTokens + row.outputTokens
      : reservation;
    return { operations: total.operations + 1, tokens: total.tokens + tokens };
  }, { operations: 0, tokens: 0 });
}

async function personalAllowance(
  transaction: Prisma.TransactionClient,
  userId: string,
  windowStart: Date,
  resetsAt: Date,
  policy: HostedAttemptBudgetPolicy,
) {
  const rows = await transaction.thoughtFormHostedAttempt.findMany({
    where: { userId, admittedAt: { gte: windowStart, lt: resetsAt } },
    select: { action: true, completedAt: true, inputTokens: true, outputTokens: true },
  });
  const current = usage(rows, policy.reservationTokens);
  return {
    remainingOperations: Math.max(0, policy.personalOperationLimit - current.operations),
    resetsAt: resetsAt.toISOString(),
  };
}

function utcDayStart(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function isSerializationConflict(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
    return true;
  }
  if (!error || typeof error !== "object" || !("cause" in error)) return false;
  const cause = error.cause;
  return Boolean(
    cause &&
    typeof cause === "object" &&
    "kind" in cause &&
    cause.kind === "TransactionWriteConflict",
  );
}
