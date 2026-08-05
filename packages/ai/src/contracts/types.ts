export type LlmMessage = {
  role: "user" | "assistant";
  content: string;
};

export type LlmRequest = {
  system: string;
  messages: LlmMessage[];
  maxTokens: number;
  outputFormat?: LlmOutputFormat;
  temperature?: number;
};

export interface LlmOutputFormat {
  name: string;
  schema: Record<string, unknown>;
}

export type LlmResponse = {
  content: string;
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  model: string;
};

export interface LlmClient {
  createMessage(request: LlmRequest): Promise<LlmResponse>;
}
