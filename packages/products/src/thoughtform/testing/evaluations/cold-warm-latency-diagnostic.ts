export const DIAGNOSTIC_CLIENT_STATES = {
  fresh: "fresh",
  reused: "reused",
} as const;

export const DIAGNOSTIC_CACHE_STATES = {
  write: "write",
  read: "read",
  neither: "neither",
} as const;

export type DiagnosticClientState =
  typeof DIAGNOSTIC_CLIENT_STATES[keyof typeof DIAGNOSTIC_CLIENT_STATES];
export type DiagnosticCacheState =
  typeof DIAGNOSTIC_CACHE_STATES[keyof typeof DIAGNOSTIC_CACHE_STATES];

export interface DiagnosticOperationMeasurement {
  operation: "conversation" | "idea_map";
  clientState: DiagnosticClientState;
  cacheState: DiagnosticCacheState;
  firstTokenMs: number;
  completeMs: number;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  outputCharacters: number;
  model: string;
}

export interface DiagnosticTurnMeasurement {
  sequence: number;
  turn: number;
  condition: "cold_to_warm" | "fresh_client_warm_cache";
  totalMs: number;
  conversation: DiagnosticOperationMeasurement;
  ideaMap: DiagnosticOperationMeasurement;
  ideaMapRevision: number;
  ideaCount: number;
}

export interface DiagnosticSummary {
  turns: number;
  providerCalls: number;
  conversationFirstTokenRangeMs: { minimum: number; maximum: number };
  medianConversationFirstTokenMs: number;
  medianConversationCompleteMs: number;
  medianIdeaMapFirstTokenMs: number;
  medianIdeaMapCompleteMs: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalReasoningTokens: number;
  totalCacheReadTokens: number;
  totalCacheWriteTokens: number;
}

export interface DiagnosticProtocolIssue {
  sequence: number;
  turn: number;
  operation: DiagnosticOperationMeasurement["operation"];
  expectedCacheState: DiagnosticCacheState;
  observedCacheState: DiagnosticCacheState;
}

export function classifyDiagnosticCacheState(input: {
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
}): DiagnosticCacheState {
  if ((input.cacheWriteTokens ?? 0) > 0) return DIAGNOSTIC_CACHE_STATES.write;
  if ((input.cacheReadTokens ?? 0) > 0) return DIAGNOSTIC_CACHE_STATES.read;
  return DIAGNOSTIC_CACHE_STATES.neither;
}

export function summariseColdWarmLatencyDiagnostic(
  turns: readonly DiagnosticTurnMeasurement[],
): DiagnosticSummary {
  const operations = turns.flatMap((turn) => [turn.conversation, turn.ideaMap]);
  const conversationFirstTokens = turns.map(
    (turn) => turn.conversation.firstTokenMs,
  );
  return {
    turns: turns.length,
    providerCalls: operations.length,
    conversationFirstTokenRangeMs: {
      minimum: minimum(conversationFirstTokens),
      maximum: maximum(conversationFirstTokens),
    },
    medianConversationFirstTokenMs: median(conversationFirstTokens),
    medianConversationCompleteMs: median(
      turns.map((turn) => turn.conversation.completeMs),
    ),
    medianIdeaMapFirstTokenMs: median(
      turns.map((turn) => turn.ideaMap.firstTokenMs),
    ),
    medianIdeaMapCompleteMs: median(
      turns.map((turn) => turn.ideaMap.completeMs),
    ),
    totalInputTokens: sum(operations, (operation) => operation.inputTokens),
    totalOutputTokens: sum(operations, (operation) => operation.outputTokens),
    totalReasoningTokens: sum(
      operations,
      (operation) => operation.reasoningTokens,
    ),
    totalCacheReadTokens: sum(
      operations,
      (operation) => operation.cacheReadTokens,
    ),
    totalCacheWriteTokens: sum(
      operations,
      (operation) => operation.cacheWriteTokens,
    ),
  };
}

export function findColdWarmProtocolIssues(
  turns: readonly DiagnosticTurnMeasurement[],
): DiagnosticProtocolIssue[] {
  return turns.flatMap((turn) => {
    const expectedCacheState =
      turn.condition === "cold_to_warm" && turn.turn === 1
        ? DIAGNOSTIC_CACHE_STATES.write
        : DIAGNOSTIC_CACHE_STATES.read;
    return [turn.conversation, turn.ideaMap].flatMap((operation) =>
      operation.cacheState === expectedCacheState
        ? []
        : [{
            sequence: turn.sequence,
            turn: turn.turn,
            operation: operation.operation,
            expectedCacheState,
            observedCacheState: operation.cacheState,
          }],
    );
  });
}

function median(values: readonly number[]) {
  if (values.length === 0) return 0;
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 0
    ? Math.round((ordered[middle - 1]! + ordered[middle]!) / 2)
    : ordered[middle]!;
}

function minimum(values: readonly number[]) {
  return values.length === 0 ? 0 : Math.min(...values);
}

function maximum(values: readonly number[]) {
  return values.length === 0 ? 0 : Math.max(...values);
}

function sum<T>(values: readonly T[], select: (value: T) => number) {
  return values.reduce((total, value) => total + select(value), 0);
}
