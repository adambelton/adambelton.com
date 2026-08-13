import type { DatabaseClient } from "packages/db/src/client/database-client";
import {
  HOSTED_ATTEMPT_ACTIONS,
  HOSTED_ATTEMPT_OUTCOMES,
  type HostedAttemptAction,
  type HostedAttemptOutcome,
} from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";

const actionValues = new Set<string>(Object.values(HOSTED_ATTEMPT_ACTIONS));
const outcomeValues = new Set<string>(Object.values(HOSTED_ATTEMPT_OUTCOMES));

export interface MeasurementOperationIdentity {
  runId: string;
  scenarioId: string;
  repetition: number;
  sequence: number;
}

export class PrismaThoughtFormUsageMeasurementReader {
  constructor(private readonly database: DatabaseClient, private readonly userId: string) {}

  async readRun(runId: string) {
    const rows = await this.database.thoughtFormHostedAttempt.findMany({
      where: { userId: this.userId, operationId: { startsWith: measurementOperationPrefix(runId) } },
      orderBy: [{ admittedAt: "asc" }, { action: "asc" }],
      select: {
        operationId: true, action: true, outcome: true, model: true,
        inputTokens: true, outputTokens: true, reasoningTokens: true,
        cacheReadTokens: true, cacheWriteTokens: true,
        admittedAt: true, completedAt: true,
      },
    });
    return rows.map((row) => {
      const identity = parseMeasurementOperationId(runId, row.operationId);
      if (!identity || !actionValues.has(row.action)) {
        throw new Error(`Invalid Task 039 ledger identity: ${row.operationId}`);
      }
      if (row.outcome !== null && !outcomeValues.has(row.outcome)) {
        throw new Error(`Invalid Task 039 ledger outcome: ${row.outcome}`);
      }
      return {
        ...identity,
        operationId: row.operationId,
        action: row.action as HostedAttemptAction,
        outcome: row.outcome as HostedAttemptOutcome | null,
        model: row.model,
        inputTokens: row.inputTokens,
        outputTokens: row.outputTokens,
        reasoningTokens: row.reasoningTokens,
        cacheReadTokens: row.cacheReadTokens,
        cacheWriteTokens: row.cacheWriteTokens,
        admittedAt: row.admittedAt.toISOString(),
        completedAt: row.completedAt?.toISOString() ?? null,
      };
    });
  }
}

export function measurementOperationPrefix(runId: string) {
  validateIdentityPart(runId, "run ID");
  return `usage-measurement/${runId}/`;
}

export function measurementOperationId(input: MeasurementOperationIdentity) {
  validateIdentityPart(input.runId, "run ID");
  validateIdentityPart(input.scenarioId, "scenario ID");
  if (!Number.isInteger(input.repetition) || input.repetition < 1) {
    throw new Error("Measurement repetition must be a positive integer.");
  }
  if (!Number.isInteger(input.sequence) || input.sequence < 1) {
    throw new Error("Measurement sequence must be a positive integer.");
  }
  return `${measurementOperationPrefix(input.runId)}${input.scenarioId}/${input.repetition}/${input.sequence}`;
}

export function parseMeasurementOperationId(runId: string, operationId: string) {
  const prefix = measurementOperationPrefix(runId);
  if (!operationId.startsWith(prefix)) return null;
  const remainder = operationId.slice(prefix.length);
  const [scenarioId, repetitionValue, sequenceWithAttempt, ...unexpected] = remainder.split("/");
  const [sequenceValue, attemptSuffix, ...unexpectedSuffixes] =
    (sequenceWithAttempt ?? "").split(":");
  const repetition = Number(repetitionValue);
  const sequence = Number(sequenceValue);
  if (
    !scenarioId || unexpected.length > 0 || unexpectedSuffixes.length > 0 ||
    (attemptSuffix !== undefined && attemptSuffix !== "idea-map") ||
    !Number.isInteger(repetition) || repetition < 1 ||
    !Number.isInteger(sequence) || sequence < 1
  ) {
    return null;
  }
  return { scenarioId, repetition };
}

function validateIdentityPart(value: string, label: string) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(value)) {
    throw new Error(`Measurement ${label} must contain lowercase letters, numbers, and hyphens only.`);
  }
}
