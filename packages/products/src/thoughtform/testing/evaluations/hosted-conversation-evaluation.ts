export interface HostedConversationTurnMetrics {
  turn: number;
  totalLatencyMs: number;
  providerLatencyMs: number;
  conversationLatencyMs?: number;
  ideaMapLatencyMs?: number;
  inputTokens: number | null;
  outputTokens: number | null;
  reasoningTokens: number | null;
  cacheReadTokens: number | null;
  cacheWriteTokens: number | null;
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
  totalCacheReadTokens: number;
  totalCacheWriteTokens: number;
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
  const medianTotalLatencyMs = median(orderedLatencies, middle);
  const finalTurn = turns.at(-1);

  return {
    turns: turns.length,
    medianTotalLatencyMs,
    maximumTotalLatencyMs: Math.max(0, ...orderedLatencies),
    totalInputTokens: sumMetric(turns, "inputTokens"),
    totalOutputTokens: sumMetric(turns, "outputTokens"),
    totalReasoningTokens: sumMetric(turns, "reasoningTokens"),
    totalCacheReadTokens: sumMetric(turns, "cacheReadTokens"),
    totalCacheWriteTokens: sumMetric(turns, "cacheWriteTokens"),
    finalMapRevision: finalTurn?.mapRevision ?? 0,
    finalIdeaCount: finalTurn?.ideaCount ?? 0,
    finalSubstanceCharacters: finalTurn?.totalSubstanceCharacters ?? 0,
  };
}

function median(orderedValues: number[], middle: number) {
  if (orderedValues.length === 0) return 0;
  if (orderedValues.length % 2 !== 0) return orderedValues[middle]!;
  return Math.round((orderedValues[middle - 1]! + orderedValues[middle]!) / 2);
}

function sumMetric(
  turns: HostedConversationTurnMetrics[],
  metric:
    | "inputTokens"
    | "outputTokens"
    | "reasoningTokens"
    | "cacheReadTokens"
    | "cacheWriteTokens",
) {
  return turns.reduce((total, turn) => total + (turn[metric] ?? 0), 0);
}
