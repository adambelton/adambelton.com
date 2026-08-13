import {
  HOSTED_ATTEMPT_ACTIONS,
  type HostedAttemptBudgetPolicy,
} from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";

const defaults: HostedAttemptBudgetPolicy = {
  personalOperationLimit: 120,
  personalTokenLimit: 600_000,
  globalOperationLimit: 600,
  globalTokenLimit: 3_000_000,
  reservationTokens: {
    [HOSTED_ATTEMPT_ACTIONS.conversationResponse]: 5_000,
    [HOSTED_ATTEMPT_ACTIONS.ideaMapAnalysis]: 7_000,
    [HOSTED_ATTEMPT_ACTIONS.draftComposition]: 2_500,
    [HOSTED_ATTEMPT_ACTIONS.revisionProposal]: 1_500,
    [HOSTED_ATTEMPT_ACTIONS.savedChangeInterpretation]: 2_500,
  },
};

const names = {
  personalOperationLimit: "THOUGHTFORM_PERSONAL_DAILY_OPERATION_LIMIT",
  personalTokenLimit: "THOUGHTFORM_PERSONAL_DAILY_TOKEN_LIMIT",
  globalOperationLimit: "THOUGHTFORM_GLOBAL_DAILY_OPERATION_LIMIT",
  globalTokenLimit: "THOUGHTFORM_GLOBAL_DAILY_TOKEN_LIMIT",
} as const;

interface HostedUsagePolicyConfiguration {
  environment: "development" | "production" | "test";
  values: Record<string, string | undefined>;
}

export function resolveHostedUsagePolicy(
  input: HostedUsagePolicyConfiguration,
): HostedAttemptBudgetPolicy {
  const resolve = (key: keyof typeof names) => {
    const raw = input.values[names[key]]?.trim();
    if (!raw) {
      if (input.environment === "production") {
        throw new Error(`${names[key]} is required in production.`);
      }
      return defaults[key];
    }
    const parsed = Number(raw);
    if (!Number.isSafeInteger(parsed) || parsed < 1) {
      throw new Error(`${names[key]} must be a positive integer.`);
    }
    return parsed;
  };
  return {
    personalOperationLimit: resolve("personalOperationLimit"),
    personalTokenLimit: resolve("personalTokenLimit"),
    globalOperationLimit: resolve("globalOperationLimit"),
    globalTokenLimit: resolve("globalTokenLimit"),
    reservationTokens: { ...defaults.reservationTokens },
  };
}
