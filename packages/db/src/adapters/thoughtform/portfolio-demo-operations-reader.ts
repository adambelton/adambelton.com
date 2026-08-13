import type { DatabaseClient } from "packages/db/src/client/database-client";
import { Prisma } from "packages/db/src/generated/prisma/client";
import type {
  HostedAttemptAction,
  HostedAttemptBudgetPolicy,
} from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";

const PAGE_SIZE = 25;
const RETENTION_MS = 90 * 24 * 60 * 60 * 1_000;

interface AccountActivityRow {
  id: string;
  email: string;
  is_owner: boolean;
  latest_operation_at: Date | null;
}

interface OperationsCursor {
  latestOperationAt: string | null;
  userId: string;
}

interface AttemptRow {
  userId: string;
  action: string;
  outcome: string | null;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  admittedAt: Date;
  completedAt: Date | null;
}

interface OutcomeTotals {
  succeeded: number;
  providerFailed: number;
  persistenceFailed: number;
  interrupted: number;
  inProgress: number;
}

interface OperationWindow {
  operations: number;
  tokens: number;
  outcomes: OutcomeTotals;
}

interface ModelTotal {
  model: string | null;
  operations: number;
  tokens: number;
}

export class PrismaThoughtFormPortfolioDemoOperationsReader {
  constructor(
    private readonly database: DatabaseClient,
    private readonly policy: HostedAttemptBudgetPolicy,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async readPage(cursorValue?: string) {
    const generatedAt = this.now();
    const windowStart = utcDayStart(generatedAt);
    const resetsAt = new Date(windowStart.getTime() + 24 * 60 * 60 * 1_000);
    const retentionStart = new Date(generatedAt.getTime() - RETENTION_MS);
    const cursor = cursorValue ? decodeCursor(cursorValue) : null;
    if (cursorValue && !cursor) return { status: "invalid_cursor" as const };
    const cursorFilter = cursor
      ? cursor.latestOperationAt
        ? Prisma.sql`WHERE (
            latest_operation_at < ${new Date(cursor.latestOperationAt)} OR
            (latest_operation_at = ${new Date(cursor.latestOperationAt)} AND id > ${cursor.userId}) OR
            latest_operation_at IS NULL
          )`
        : Prisma.sql`WHERE latest_operation_at IS NULL AND id > ${cursor.userId}`
      : Prisma.empty;
    const accountRows = await this.database.$queryRaw<AccountActivityRow[]>(Prisma.sql`
      WITH account_activity AS (
        SELECT
          users.id,
          users.email,
          users.is_owner,
          MAX(attempts.admitted_at) AS latest_operation_at
        FROM users
        LEFT JOIN thoughtform_hosted_attempts attempts
          ON attempts.user_id = users.id
          AND attempts.admitted_at >= ${retentionStart}
        GROUP BY users.id, users.email, users.is_owner
      )
      SELECT id, email, is_owner, latest_operation_at
      FROM account_activity
      ${cursorFilter}
      ORDER BY latest_operation_at DESC NULLS LAST, id ASC
      LIMIT ${PAGE_SIZE + 1}
    `);
    const pageRows = accountRows.slice(0, PAGE_SIZE);
    const userIds = pageRows.map((row) => row.id);
    const [accountAttempts, globalAttempts] = await Promise.all([
      userIds.length === 0
        ? Promise.resolve([])
        : this.database.thoughtFormHostedAttempt.findMany({
            where: {
              userId: { in: userIds },
              admittedAt: { gte: retentionStart },
            },
            select: attemptSelection,
          }),
      this.database.thoughtFormHostedAttempt.findMany({
        where: { admittedAt: { gte: windowStart, lt: resetsAt } },
        select: attemptSelection,
      }),
    ]);
    const attempts = accountAttempts as AttemptRow[];
    return { status: "found" as const, overview: {
      generatedAt: generatedAt.toISOString(),
      currentGlobal: {
        ...summarize(globalAttempts as AttemptRow[], this.policy),
        resetsAt: resetsAt.toISOString(),
      },
      accounts: pageRows.map((row) => accountSummary(
        row,
        attempts.filter((attempt) => attempt.userId === row.id),
        windowStart,
        resetsAt,
        this.policy,
      )),
      nextCursor: accountRows.length > PAGE_SIZE
        ? encodeCursor(pageRows[pageRows.length - 1]!)
        : null,
    } };
  }
}

const attemptSelection = {
  userId: true,
  action: true,
  outcome: true,
  model: true,
  inputTokens: true,
  outputTokens: true,
  admittedAt: true,
  completedAt: true,
} as const;

function accountSummary(
  account: AccountActivityRow,
  attempts: AttemptRow[],
  windowStart: Date,
  resetsAt: Date,
  policy: HostedAttemptBudgetPolicy,
) {
  const current = attempts.filter((attempt) => attempt.admittedAt >= windowStart);
  const currentSummary = summarize(current, policy);
  return {
    email: account.email,
    latestOperationAt: account.latest_operation_at?.toISOString() ?? null,
    current: {
      ...currentSummary,
      operationLimit: policy.personalOperationLimit,
      operationsRemaining: account.is_owner
        ? null
        : Math.max(0, policy.personalOperationLimit - currentSummary.operations),
      tokenLimit: policy.personalTokenLimit,
      tokensRemaining: account.is_owner
        ? null
        : Math.max(0, policy.personalTokenLimit - currentSummary.tokens),
      resetsAt: resetsAt.toISOString(),
      isExempt: account.is_owner,
    },
    retained: summarize(attempts, policy),
    retainedModels: summarizeModels(attempts, policy),
  };
}

function summarize(
  attempts: AttemptRow[],
  policy: HostedAttemptBudgetPolicy,
): OperationWindow {
  return attempts.reduce<OperationWindow>((total, attempt) => ({
    operations: total.operations + 1,
    tokens: total.tokens + chargedTokens(attempt, policy),
    outcomes: incrementOutcome(total.outcomes, attempt.outcome),
  }), { operations: 0, tokens: 0, outcomes: emptyOutcomes() });
}

function summarizeModels(
  attempts: AttemptRow[],
  policy: HostedAttemptBudgetPolicy,
): ModelTotal[] {
  const models = new Map<string | null, ModelTotal>();
  for (const attempt of attempts) {
    const current = models.get(attempt.model) ?? {
      model: attempt.model,
      operations: 0,
      tokens: 0,
    };
    current.operations += 1;
    current.tokens += chargedTokens(attempt, policy);
    models.set(attempt.model, current);
  }
  return [...models.values()].sort((first, second) =>
    second.operations - first.operations || String(first.model).localeCompare(String(second.model))
  );
}

function chargedTokens(attempt: AttemptRow, policy: HostedAttemptBudgetPolicy) {
  if (
    attempt.completedAt &&
    attempt.inputTokens !== null &&
    attempt.outputTokens !== null
  ) {
    return attempt.inputTokens + attempt.outputTokens;
  }
  return policy.reservationTokens[attempt.action as HostedAttemptAction] ?? 0;
}

function emptyOutcomes(): OutcomeTotals {
  return {
    succeeded: 0,
    providerFailed: 0,
    persistenceFailed: 0,
    interrupted: 0,
    inProgress: 0,
  };
}

function incrementOutcome(
  outcomes: OutcomeTotals,
  outcome: string | null,
): OutcomeTotals {
  const next = { ...outcomes };
  if (outcome === "succeeded") next.succeeded += 1;
  else if (outcome === "provider_failed") next.providerFailed += 1;
  else if (outcome === "persistence_failed") next.persistenceFailed += 1;
  else if (outcome === "interrupted") next.interrupted += 1;
  else next.inProgress += 1;
  return next;
}

function utcDayStart(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function encodeCursor(account: AccountActivityRow) {
  return Buffer.from(JSON.stringify({
    latestOperationAt: account.latest_operation_at?.toISOString() ?? null,
    userId: account.id,
  } satisfies OperationsCursor)).toString("base64url");
}

function decodeCursor(value: string): OperationsCursor | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as unknown;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("userId" in parsed) ||
      typeof parsed.userId !== "string" ||
      !("latestOperationAt" in parsed) ||
      (parsed.latestOperationAt !== null &&
        (typeof parsed.latestOperationAt !== "string" ||
          Number.isNaN(new Date(parsed.latestOperationAt).getTime())))
    ) return null;
    return parsed as OperationsCursor;
  } catch {
    return null;
  }
}
