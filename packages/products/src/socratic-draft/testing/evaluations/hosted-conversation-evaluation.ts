export interface HostedConversationTurnMetrics {
  turn: number;
  totalLatencyMs: number;
  providerLatencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  reasoningTokens: number | null;
  outputCharacters: number;
  model: string;
  mapRevision: number;
  ideaCount: number;
  retainedIdeaCount: number;
  totalSynthesisCharacters: number;
  totalSubstanceCharacters: number;
}

export interface HostedConversationEvaluationSummary {
  turns: number;
  medianTotalLatencyMs: number;
  maximumTotalLatencyMs: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalReasoningTokens: number;
  finalMapRevision: number;
  finalIdeaCount: number;
  finalSubstanceCharacters: number;
}

export function summariseHostedConversationEvaluation(
  turns: HostedConversationTurnMetrics[],
): HostedConversationEvaluationSummary {
  const orderedLatencies = turns
    .map((turn) => turn.totalLatencyMs)
    .sort((left, right) => left - right);
  const middle = Math.floor(orderedLatencies.length / 2);
  const medianTotalLatencyMs =
    orderedLatencies.length === 0
      ? 0
      : orderedLatencies.length % 2 === 0
        ? Math.round(
            (orderedLatencies[middle - 1]! + orderedLatencies[middle]!) / 2,
          )
        : orderedLatencies[middle]!;
  const finalTurn = turns.at(-1);

  return {
    turns: turns.length,
    medianTotalLatencyMs,
    maximumTotalLatencyMs: Math.max(0, ...orderedLatencies),
    totalInputTokens: sumMetric(turns, "inputTokens"),
    totalOutputTokens: sumMetric(turns, "outputTokens"),
    totalReasoningTokens: sumMetric(turns, "reasoningTokens"),
    finalMapRevision: finalTurn?.mapRevision ?? 0,
    finalIdeaCount: finalTurn?.ideaCount ?? 0,
    finalSubstanceCharacters: finalTurn?.totalSubstanceCharacters ?? 0,
  };
}

function sumMetric(
  turns: HostedConversationTurnMetrics[],
  metric: "inputTokens" | "outputTokens" | "reasoningTokens",
) {
  return turns.reduce((total, turn) => total + (turn[metric] ?? 0), 0);
}
