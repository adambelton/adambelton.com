export type ObservationValue = string | number | boolean;
export type ObservationAttributes = Readonly<Record<string, ObservationValue>>;
export type ObservationContent = Readonly<{
  input?: unknown;
  output?: unknown;
}>;

export interface Observability {
  observe<T>(
    name: string,
    attributes: ObservationAttributes,
    operation: () => Promise<T>,
  ): Promise<T>;
  record(attributes: ObservationAttributes): void;
  recordContent(content: ObservationContent): void;
}

export const noOpObservability: Observability = {
  observe: (_name, _attributes, operation) => operation(),
  record() {},
  recordContent() {},
};

export const OBSERVATION_ATTRIBUTE_NAMES = {
  operation: "operation",
  result: "result",
  provider: "provider",
  model: "model",
  inputTokens: "input_tokens",
  outputTokens: "output_tokens",
  reasoningTokens: "reasoning_tokens",
  cacheReadTokens: "cache_read_tokens",
  cacheWriteTokens: "cache_write_tokens",
  inputBytes: "input_bytes",
  outputCharacters: "output_characters",
  previousMessageCount: "previous_message_count",
  ideaCount: "idea_count",
  ideaMapRevision: "idea_map_revision",
  repairAttempted: "repair_attempted",
  clientDurationMs: "client_duration_ms",
  correlationId: "correlation_id",
} as const;
