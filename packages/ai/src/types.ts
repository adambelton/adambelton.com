export type LlmMessage = {
  role: "user" | "assistant";
  content: string;
};

export type LlmRequest = {
  system: string;
  messages: LlmMessage[];
  maxTokens: number;
  temperature?: number;
};

export type LlmResponse = {
  content: string;
  inputTokens?: number;
  outputTokens?: number;
  model: string;
};

export interface LlmClient {
  createMessage(request: LlmRequest): Promise<LlmResponse>;
}
