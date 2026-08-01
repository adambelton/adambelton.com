import { describe, expect, it } from "vitest";
import {
  summariseHostedConversationEvaluation,
  type HostedConversationTurnMetrics,
} from "packages/products/src/socratic-draft/server/evaluations/hosted-conversation-evaluation";

describe("hosted conversation evaluation reporting", () => {
  it("summarises latency, usage, and final idea-map state", () => {
    const turns: HostedConversationTurnMetrics[] = [
      createTurn({ turn: 1, totalLatencyMs: 1_000, inputTokens: 100 }),
      createTurn({
        turn: 2,
        totalLatencyMs: 3_000,
        inputTokens: 200,
        outputTokens: 80,
        reasoningTokens: 50,
        mapRevision: 2,
        ideaCount: 1,
        totalSubstanceCharacters: 900,
      }),
    ];

    expect(summariseHostedConversationEvaluation(turns)).toEqual({
      turns: 2,
      medianTotalLatencyMs: 2_000,
      maximumTotalLatencyMs: 3_000,
      totalInputTokens: 300,
      totalOutputTokens: 80,
      totalReasoningTokens: 50,
      finalMapRevision: 2,
      finalIdeaCount: 1,
      finalSubstanceCharacters: 900,
    });
  });
});

function createTurn(
  overrides: Partial<HostedConversationTurnMetrics>,
): HostedConversationTurnMetrics {
  return {
    turn: 1,
    totalLatencyMs: 0,
    providerLatencyMs: 0,
    inputTokens: null,
    outputTokens: null,
    reasoningTokens: null,
    outputCharacters: 0,
    model: "test-model",
    mapRevision: 0,
    ideaCount: 0,
    retainedIdeaCount: 0,
    totalSynthesisCharacters: 0,
    totalSubstanceCharacters: 0,
    ...overrides,
  };
}
