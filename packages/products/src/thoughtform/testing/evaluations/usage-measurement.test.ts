import { describe, expect, it } from "vitest";
import { HOSTED_ATTEMPT_ACTIONS, HOSTED_ATTEMPT_OUTCOMES } from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";
import {
  countExpectedHostedOperations,
  DEFAULT_USAGE_MEASUREMENT_REPETITIONS,
  expectedHostedActionsForScenario,
  USAGE_MEASUREMENT_SCENARIOS,
} from "packages/products/src/thoughtform/testing/evaluations/usage-measurement-scenarios";
import {
  summariseUsageMeasurement,
  type UsageMeasurementAttempt,
} from "packages/products/src/thoughtform/testing/evaluations/usage-measurement-report";

describe("usage measurement plan", () => {
  it("covers every approved journey and distinguishes concurrent turn attempts", () => {
    expect(USAGE_MEASUREMENT_SCENARIOS.map((scenario) => scenario.id)).toEqual([
      "guided-vague-discovery",
      "strong-view-early-draft",
      "long-discovery-later-draft",
      "revision-proposal-acceptance",
      "meaningful-saved-change",
      "idea-structure-correction",
    ]);
    for (const scenario of USAGE_MEASUREMENT_SCENARIOS) {
      const turnCount = scenario.actions.filter((action) => action.type === "conversation_turn").length;
      const expectedHostedActions = expectedHostedActionsForScenario(scenario);
      expect(expectedHostedActions.filter(
        (action) => action === HOSTED_ATTEMPT_ACTIONS.conversationResponse,
      )).toHaveLength(turnCount);
      expect(expectedHostedActions.filter(
        (action) => action === HOSTED_ATTEMPT_ACTIONS.ideaMapAnalysis,
      )).toHaveLength(turnCount);
    }
    expect(countExpectedHostedOperations()).toBe(108);
    expect(DEFAULT_USAGE_MEASUREMENT_REPETITIONS).toBe(3);
    expect(expectedHostedActionsForScenario(USAGE_MEASUREMENT_SCENARIOS[3])).toEqual([
      HOSTED_ATTEMPT_ACTIONS.conversationResponse,
      HOSTED_ATTEMPT_ACTIONS.ideaMapAnalysis,
      HOSTED_ATTEMPT_ACTIONS.draftComposition,
      HOSTED_ATTEMPT_ACTIONS.revisionProposal,
    ]);
  });

  it("reports provider-neutral ranges and missing metadata without content", () => {
    const attempts: UsageMeasurementAttempt[] = [
      attempt({ inputTokens: 10, outputTokens: 4, cacheReadTokens: 3 }),
      attempt({ operationId: "operation-2", inputTokens: null, outputTokens: 8 }),
    ];
    expect(summariseUsageMeasurement(attempts)).toEqual({
      scenarioCount: 1,
      repetitionCount: 1,
      attemptCount: 2,
      operations: [{
        action: HOSTED_ATTEMPT_ACTIONS.conversationResponse,
        attemptCount: 2,
        outcomes: { succeeded: 2 },
        models: ["test-model"],
        tokens: {
          inputTokens: { minimum: 10, maximum: 10, sampleCount: 1, missingCount: 1 },
          outputTokens: { minimum: 4, maximum: 8, sampleCount: 2, missingCount: 0 },
          reasoningTokens: { minimum: null, maximum: null, sampleCount: 0, missingCount: 2 },
          cacheReadTokens: { minimum: 3, maximum: 3, sampleCount: 1, missingCount: 1 },
          cacheWriteTokens: { minimum: null, maximum: null, sampleCount: 0, missingCount: 2 },
        },
      }],
      scenarios: [{
        scenarioId: "scenario-1",
        repetitionCount: 1,
        attemptCount: 2,
        operations: [expect.objectContaining({
          action: HOSTED_ATTEMPT_ACTIONS.conversationResponse,
          attemptCount: 2,
        })],
      }],
    });
    expect(JSON.stringify(summariseUsageMeasurement(attempts))).not.toContain("private fixture");
  });
});

function attempt(overrides: Partial<UsageMeasurementAttempt>): UsageMeasurementAttempt {
  return {
    scenarioId: "scenario-1",
    repetition: 1,
    operationId: "operation-1",
    action: HOSTED_ATTEMPT_ACTIONS.conversationResponse,
    outcome: HOSTED_ATTEMPT_OUTCOMES.succeeded,
    model: "test-model",
    inputTokens: 1,
    outputTokens: 1,
    reasoningTokens: null,
    cacheReadTokens: null,
    cacheWriteTokens: null,
    admittedAt: "2026-08-13T12:00:00.000Z",
    completedAt: "2026-08-13T12:00:01.000Z",
    ...overrides,
  };
}
