export const HOSTED_ATTEMPT_ACTIONS = {
  conversationResponse: "conversation_response",
  ideaMapAnalysis: "idea_map_analysis",
  draftComposition: "draft_composition",
  revisionProposal: "revision_proposal",
  savedChangeInterpretation: "saved_change_interpretation",
} as const;

export type HostedAttemptAction =
  typeof HOSTED_ATTEMPT_ACTIONS[keyof typeof HOSTED_ATTEMPT_ACTIONS];

export const HOSTED_ATTEMPT_OUTCOMES = {
  succeeded: "succeeded",
  providerFailed: "provider_failed",
  persistenceFailed: "persistence_failed",
  interrupted: "interrupted",
} as const;

export type HostedAttemptOutcome =
  typeof HOSTED_ATTEMPT_OUTCOMES[keyof typeof HOSTED_ATTEMPT_OUTCOMES];

export interface HostedAttemptUsage {
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  reasoningTokens: number | null;
  cacheReadTokens: number | null;
  cacheWriteTokens: number | null;
}

export interface HostedAttemptAdmission {
  action: HostedAttemptAction;
  operationId: string;
}

export class HostedUsageLimitedError extends Error {
  constructor(readonly allowance: HostedUsageAllowance) {
    super("The hosted usage allowance has been reached.");
    this.name = "HostedUsageLimitedError";
  }
}

export interface HostedAttemptBudgetPolicy {
  personalOperationLimit: number;
  personalTokenLimit: number;
  globalOperationLimit: number;
  globalTokenLimit: number;
  reservationTokens: Record<HostedAttemptAction, number>;
}

export interface HostedAttempt {
  readonly id: string;
  run<T>(operation: () => Promise<T>): Promise<T>;
  runStream<T>(operation: () => AsyncIterable<T>): AsyncIterable<T>;
  complete(outcome: HostedAttemptOutcome): Promise<void>;
  discard(): Promise<void>;
}

export interface HostedAttemptLifecycle {
  admit(input: HostedAttemptAdmission): Promise<HostedAttempt>;
}

export interface HostedAttemptRecordStore {
  admit(input: HostedAttemptAdmission): Promise<{
    id: string;
    isNew?: boolean;
    allowance?: HostedUsageAllowance;
  }>;
  complete(input: {
    attemptId: string;
    outcome: HostedAttemptOutcome;
    usage: HostedAttemptUsage;
    completedAt: string;
  }): Promise<void>;
  interruptAdmittedBefore(cutoff: string, completedAt: string): Promise<number>;
  deleteCompletedBefore(cutoff: string): Promise<number>;
  discard(attemptId: string): Promise<void>;
}

export const noOpHostedAttemptLifecycle: HostedAttemptLifecycle = {
  async admit() {
    return {
      id: globalThis.crypto.randomUUID(),
      run: (operation) => operation(),
      runStream: (operation) => operation(),
      async complete() {},
      async discard() {},
    };
  },
};
import type { HostedUsageAllowance } from "packages/products/src/thoughtform/shared";
export type { HostedUsageAllowance } from "packages/products/src/thoughtform/shared";
