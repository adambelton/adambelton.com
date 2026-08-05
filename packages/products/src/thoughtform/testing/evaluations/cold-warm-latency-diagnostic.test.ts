import { describe, expect, it } from "vitest";
import {
  classifyDiagnosticCacheState,
  findColdWarmProtocolIssues,
  summariseColdWarmLatencyDiagnostic,
  type DiagnosticOperationMeasurement,
  type DiagnosticTurnMeasurement,
} from "packages/products/src/thoughtform/testing/evaluations/cold-warm-latency-diagnostic";

describe("cold/warm latency diagnostic reporting", () => {
  it("classifies provider cache counters without inferring from turn order", () => {
    expect(classifyDiagnosticCacheState({ cacheWriteTokens: 2_000 }))
      .toBe("write");
    expect(classifyDiagnosticCacheState({ cacheReadTokens: 2_000 }))
      .toBe("read");
    expect(classifyDiagnosticCacheState({})).toBe("neither");
  });

  it("summarises exact latency ranges, medians, and usage", () => {
    const turns: DiagnosticTurnMeasurement[] = [
      turn(1, operation("conversation", 30_000, 35_000), operation("idea_map", 5_000, 8_000)),
      turn(2, operation("conversation", 4_000, 7_000), operation("idea_map", 6_000, 9_000)),
      turn(3, operation("conversation", 5_000, 8_000), operation("idea_map", 7_000, 10_000)),
    ];

    expect(summariseColdWarmLatencyDiagnostic(turns)).toEqual({
      turns: 3,
      providerCalls: 6,
      conversationFirstTokenRangeMs: { minimum: 4_000, maximum: 30_000 },
      medianConversationFirstTokenMs: 5_000,
      medianConversationCompleteMs: 8_000,
      medianIdeaMapFirstTokenMs: 6_000,
      medianIdeaMapCompleteMs: 9_000,
      totalInputTokens: 600,
      totalOutputTokens: 120,
      totalReasoningTokens: 30,
      totalCacheReadTokens: 240,
      totalCacheWriteTokens: 60,
    });
  });

  it("rejects nominal cold and warm labels that provider counters do not confirm", () => {
    const cold = turn(
      1,
      operation("conversation", 5_000, 8_000, "write"),
      operation("idea_map", 4_000, 7_000, "write"),
    );
    const warm = turn(
      2,
      operation("conversation", 3_000, 7_000, "read"),
      operation("idea_map", 2_000, 6_000, "neither"),
    );

    expect(findColdWarmProtocolIssues([cold, warm])).toEqual([{
      sequence: 1,
      turn: 2,
      operation: "idea_map",
      expectedCacheState: "read",
      observedCacheState: "neither",
    }]);
  });
});

function operation(
  operationName: DiagnosticOperationMeasurement["operation"],
  firstTokenMs: number,
  completeMs: number,
  cacheState: DiagnosticOperationMeasurement["cacheState"] = "read",
): DiagnosticOperationMeasurement {
  return {
    operation: operationName,
    clientState: "reused",
    cacheState,
    firstTokenMs,
    completeMs,
    inputTokens: 100,
    outputTokens: 20,
    reasoningTokens: 5,
    cacheReadTokens: 40,
    cacheWriteTokens: 10,
    outputCharacters: 200,
    model: "claude-sonnet-5",
  };
}

function turn(
  turnNumber: number,
  conversation: DiagnosticOperationMeasurement,
  ideaMap: DiagnosticOperationMeasurement,
): DiagnosticTurnMeasurement {
  return {
    sequence: 1,
    turn: turnNumber,
    condition: "cold_to_warm",
    totalMs: Math.max(conversation.completeMs, ideaMap.completeMs),
    conversation,
    ideaMap,
    ideaMapRevision: turnNumber,
    ideaCount: 1,
  };
}
