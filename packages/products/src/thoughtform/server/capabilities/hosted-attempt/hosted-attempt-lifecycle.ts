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

export type HostedAttemptUsage = {
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  reasoningTokens: number | null;
  cacheReadTokens: number | null;
  cacheWriteTokens: number | null;
};

export type HostedAttemptAdmission = {
  action: HostedAttemptAction;
  operationId: string;
};

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
  admit(input: HostedAttemptAdmission): Promise<{ id: string }>;
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
