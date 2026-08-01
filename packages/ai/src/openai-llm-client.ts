import OpenAI from "openai";
import type { LlmClient, LlmRequest, LlmResponse } from "packages/ai/src/types";

export const DEFAULT_OPENAI_MODEL = "gpt-5-mini";

export type OpenAiLlmClientOptions = {
  apiKey: string;
  model?: string;
};

export class OpenAiLlmClient implements LlmClient {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor({
    apiKey,
    model = DEFAULT_OPENAI_MODEL,
  }: OpenAiLlmClientOptions) {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async createMessage(request: LlmRequest): Promise<LlmResponse> {
    const response = await this.client.responses.create({
      instructions: request.system,
      input: request.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      max_output_tokens: request.maxTokens,
      model: this.model,
      store: false,
      temperature: request.temperature,
    });

    return {
      content: response.output_text,
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
      model: response.model,
    };
  }
}
