import { describe, expect, it } from "vitest";
import { performHostedAttempt } from "packages/products/src/thoughtform/server/application/hosted-attempt/perform-hosted-attempt";
import {
  HOSTED_ATTEMPT_ACTIONS,
  HOSTED_ATTEMPT_OUTCOMES,
  type HostedAttemptOutcome,
} from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";
import { HostedAiUnavailableError } from "packages/products/src/thoughtform/server/capabilities/conversation";

describe("performHostedAttempt", () => {
  it.each([
    {
      name: "success",
      operation: async () => "retained",
      outcome: () => HOSTED_ATTEMPT_OUTCOMES.succeeded,
      expected: HOSTED_ATTEMPT_OUTCOMES.succeeded,
    },
    {
      name: "persistence failure",
      operation: async () => "conflict",
      outcome: () => HOSTED_ATTEMPT_OUTCOMES.persistenceFailed,
      expected: HOSTED_ATTEMPT_OUTCOMES.persistenceFailed,
    },
  ])("completes exactly once after $name", async ({ operation, outcome, expected }) => {
    const completed: HostedAttemptOutcome[] = [];
    await performHostedAttempt({
      action: HOSTED_ATTEMPT_ACTIONS.draftComposition,
      operationId: "operation",
      lifecycle: lifecycle(completed),
      operation,
      outcome,
    });
    expect(completed).toEqual([expected]);
  });

  it("completes a provider failure exactly once before rethrowing", async () => {
    const completed: HostedAttemptOutcome[] = [];
    await expect(performHostedAttempt({
      action: HOSTED_ATTEMPT_ACTIONS.revisionProposal,
      operationId: "operation",
      lifecycle: lifecycle(completed),
      operation: async () => { throw new HostedAiUnavailableError(); },
    })).rejects.toBeInstanceOf(HostedAiUnavailableError);
    expect(completed).toEqual([HOSTED_ATTEMPT_OUTCOMES.providerFailed]);
  });
});

function lifecycle(completed: HostedAttemptOutcome[]) {
  return {
    async admit() {
      return {
        id: "attempt",
        run: <T>(operation: () => Promise<T>) => operation(),
        runStream: <T>(operation: () => AsyncIterable<T>) => operation(),
        async complete(outcome: HostedAttemptOutcome) { completed.push(outcome); },
        async discard() {},
      };
    },
  };
}
