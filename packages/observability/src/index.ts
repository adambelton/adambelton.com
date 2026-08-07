export type ObservationValue = string | number | boolean;
export type ObservationAttributes = Readonly<Record<string, ObservationValue>>;
export type ObservationContent = Readonly<{
  input?: unknown;
  output?: unknown;
}>;
export type ObservationPrompt = Readonly<{
  name: string;
  version: number;
  isFallback: boolean;
}>;
export type ObservationGeneration = Readonly<{
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
}>;

export interface Observability {
  observe<T>(
    name: string,
    attributes: ObservationAttributes,
    operation: () => Promise<T>,
  ): Promise<T>;
  record(attributes: ObservationAttributes): void;
  recordContent(content: ObservationContent): void;
  recordPrompt(prompt: ObservationPrompt): void;
  recordGeneration(generation: ObservationGeneration): void;
}

export const noOpObservability: Observability = {
  observe: (_name, _attributes, operation) => operation(),
  record() {},
  recordContent() {},
  recordPrompt() {},
  recordGeneration() {},
};

export async function* observeStream<T>(
  observability: Observability,
  name: string,
  attributes: ObservationAttributes,
  operation: () => AsyncIterable<T>,
): AsyncIterable<T> {
  const values: T[] = [];
  let isCompleted = false;
  let failure: unknown;
  let notify: (() => void) | null = null;
  const wake = () => {
    notify?.();
    notify = null;
  };
  void observability.observe(name, attributes, async () => {
    try {
      for await (const value of operation()) {
        values.push(value);
        wake();
      }
    } catch (error) {
      failure = error;
      throw error;
    } finally {
      isCompleted = true;
      wake();
    }
  }).catch(() => undefined);

  while (!isCompleted || values.length > 0) {
    if (values.length === 0) {
      await new Promise<void>((resolve) => { notify = resolve; });
      continue;
    }
    yield values.shift()!;
  }
  if (failure !== undefined) throw failure;
}

export const OBSERVATION_ATTRIBUTE_NAMES = {
  operation: "operation",
  result: "result",
  provider: "provider",
  model: "model",
  effort: "effort",
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
  serverTimeToFirstTokenMs: "server_time_to_first_token_ms",
  correlationId: "correlation_id",
  sessionId: "session_id",
} as const;
