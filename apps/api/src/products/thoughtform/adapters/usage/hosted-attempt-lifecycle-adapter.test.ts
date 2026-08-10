import { describe, expect, it } from "vitest";
import type { HostedAttemptRecordStore } from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";
import {
  HOSTED_ATTEMPT_ACTIONS,
  HOSTED_ATTEMPT_OUTCOMES,
} from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";
import { HostedAttemptLifecycleAdapter } from "apps/api/src/products/thoughtform/adapters/usage/hosted-attempt-lifecycle-adapter";
import { HostedAttemptUsageLlmClient } from "apps/api/src/products/thoughtform/adapters/usage/hosted-attempt-usage-llm-client";

describe("HostedAttemptLifecycleAdapter", () => {
  it("aggregates provider-neutral usage and completes an attempt once", async () => {
    const completed: Array<Parameters<HostedAttemptRecordStore["complete"]>[0]> = [];
    const records = fakeRecords(completed);
    const lifecycle = new HostedAttemptLifecycleAdapter(records, () => new Date("2026-08-10T12:00:00.000Z"));
    const attempt = await lifecycle.admit({
      action: HOSTED_ATTEMPT_ACTIONS.ideaMapAnalysis,
      operationId: "map-operation",
    });
    const client = new HostedAttemptUsageLlmClient({
      async createMessage() {
        return {
          content: "{}",
          model: "test-model",
          inputTokens: 10,
          outputTokens: 4,
          cacheReadTokens: 3,
        };
      },
    });

    await attempt.run(async () => {
      await client.createMessage({ system: "one", messages: [], maxTokens: 10 });
      await client.createMessage({ system: "repair", messages: [], maxTokens: 10 });
    });
    await Promise.all([
      attempt.complete(HOSTED_ATTEMPT_OUTCOMES.succeeded),
      attempt.complete(HOSTED_ATTEMPT_OUTCOMES.providerFailed),
    ]);

    expect(completed).toEqual([{
      attemptId: "attempt-id",
      outcome: HOSTED_ATTEMPT_OUTCOMES.succeeded,
      usage: {
        model: "test-model",
        inputTokens: 20,
        outputTokens: 8,
        reasoningTokens: null,
        cacheReadTokens: 6,
        cacheWriteTokens: null,
      },
      completedAt: "2026-08-10T12:00:00.000Z",
    }]);
  });

  it("retains partial usage as unknown instead of undercounting it", async () => {
    const completed: Array<Parameters<HostedAttemptRecordStore["complete"]>[0]> = [];
    const lifecycle = new HostedAttemptLifecycleAdapter(fakeRecords(completed));
    const attempt = await lifecycle.admit({
      action: HOSTED_ATTEMPT_ACTIONS.conversationResponse,
      operationId: "conversation-operation",
    });
    let call = 0;
    const client = new HostedAttemptUsageLlmClient({
      async createMessage() {
        call += 1;
        return {
          content: "response",
          model: "test-model",
          inputTokens: call === 1 ? 8 : undefined,
          outputTokens: 2,
        };
      },
    });

    await attempt.run(async () => {
      await client.createMessage({ system: "one", messages: [], maxTokens: 10 });
      await client.createMessage({ system: "two", messages: [], maxTokens: 10 });
    });
    await attempt.complete(HOSTED_ATTEMPT_OUTCOMES.providerFailed);

    expect(completed[0]?.usage.inputTokens).toBeNull();
    expect(completed[0]?.usage.outputTokens).toBe(4);
  });
});

function fakeRecords(
  completed: Array<Parameters<HostedAttemptRecordStore["complete"]>[0]>,
): HostedAttemptRecordStore {
  return {
    async admit() { return { id: "attempt-id" }; },
    async complete(input) { completed.push(input); },
    async interruptAdmittedBefore() { return 0; },
    async deleteCompletedBefore() { return 0; },
    async discard() {},
  };
}
