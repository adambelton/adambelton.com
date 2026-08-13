import type {
  HostedAttemptAction,
  HostedAttemptOutcome,
} from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";

export const USAGE_MEASUREMENT_TOKEN_FIELDS = [
  "inputTokens",
  "outputTokens",
  "reasoningTokens",
  "cacheReadTokens",
  "cacheWriteTokens",
] as const;

export type UsageMeasurementTokenField = typeof USAGE_MEASUREMENT_TOKEN_FIELDS[number];

export interface UsageMeasurementAttempt {
  scenarioId: string;
  repetition: number;
  operationId: string;
  action: HostedAttemptAction;
  outcome: HostedAttemptOutcome | null;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  reasoningTokens: number | null;
  cacheReadTokens: number | null;
  cacheWriteTokens: number | null;
  admittedAt: string;
  completedAt: string | null;
}

export interface UsageMeasurementRange {
  minimum: number | null;
  maximum: number | null;
  sampleCount: number;
  missingCount: number;
}

export interface UsageMeasurementOperationSummary {
  action: HostedAttemptAction;
  attemptCount: number;
  outcomes: Record<string, number>;
  models: string[];
  tokens: Record<UsageMeasurementTokenField, UsageMeasurementRange>;
}

export interface UsageMeasurementScenarioSummary {
  scenarioId: string;
  repetitionCount: number;
  attemptCount: number;
  operations: UsageMeasurementOperationSummary[];
}

export interface UsageMeasurementSummary {
  scenarioCount: number;
  repetitionCount: number;
  attemptCount: number;
  operations: UsageMeasurementOperationSummary[];
  scenarios: UsageMeasurementScenarioSummary[];
}

export function summariseUsageMeasurement(
  attempts: readonly UsageMeasurementAttempt[],
): UsageMeasurementSummary {
  const scenarios = [...new Set(attempts.map((attempt) => attempt.scenarioId))]
    .sort()
    .map((scenarioId) => {
      const scenarioAttempts = attempts.filter((attempt) => attempt.scenarioId === scenarioId);
      return {
        scenarioId,
        repetitionCount: new Set(scenarioAttempts.map((attempt) => attempt.repetition)).size,
        attemptCount: scenarioAttempts.length,
        operations: summariseOperations(scenarioAttempts),
      };
    });
  return {
    scenarioCount: scenarios.length,
    repetitionCount: new Set(attempts.map((attempt) => attempt.repetition)).size,
    attemptCount: attempts.length,
    operations: summariseOperations(attempts),
    scenarios,
  };
}

function summariseOperations(attempts: readonly UsageMeasurementAttempt[]) {
  const groups = new Map<HostedAttemptAction, UsageMeasurementAttempt[]>();
  for (const attempt of attempts) {
    const records = groups.get(attempt.action) ?? [];
    records.push(attempt);
    groups.set(attempt.action, records);
  }
  const operations = [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([action, records]) => ({
      action,
      attemptCount: records.length,
      outcomes: countValues(records.map((record) => record.outcome ?? "admitted")),
      models: [...new Set(records.flatMap((record) => record.model ? [record.model] : []))].sort(),
      tokens: Object.fromEntries(USAGE_MEASUREMENT_TOKEN_FIELDS.map((field) => [
        field,
        range(records.map((record) => record[field])),
      ])) as Record<UsageMeasurementTokenField, UsageMeasurementRange>,
    }));
  return operations;
}

function range(values: Array<number | null>): UsageMeasurementRange {
  const supplied = values.filter((value): value is number => value !== null);
  return {
    minimum: supplied.length ? Math.min(...supplied) : null,
    maximum: supplied.length ? Math.max(...supplied) : null,
    sampleCount: supplied.length,
    missingCount: values.length - supplied.length,
  };
}

function countValues(values: string[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}
