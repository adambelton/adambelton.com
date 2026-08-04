import Anthropic from "@anthropic-ai/sdk";
import type {
  LlmClient,
  LlmRequest,
  LlmResponse,
} from "packages/ai/src/contracts/types";

export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-5";

export type AnthropicLlmClientOptions = {
  apiKey: string;
  model?: string;
};

export class AnthropicLlmClient implements LlmClient {
  private readonly client: Anthropic;
  private readonly model: string;

  constructor({
    apiKey,
    model = DEFAULT_ANTHROPIC_MODEL,
  }: AnthropicLlmClientOptions) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async createMessage(request: LlmRequest): Promise<LlmResponse> {
    const response = await this.client.messages.create({
      max_tokens: request.maxTokens,
      messages: request.messages,
      model: this.model,
      system: request.system,
      ...(request.outputFormat
        ? {
            output_config: {
              format: {
                type: "json_schema" as const,
                schema: request.outputFormat.schema,
              },
            },
          }
        : {}),
    });

    if (response.stop_reason !== "end_turn") {
      throw new Error(
        `The Anthropic model response stopped with ${response.stop_reason ?? "an unknown reason"}.`,
      );
    }

    const content = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
    if (!content) {
      throw new Error("The Anthropic model response did not contain text.");
    }

    return {
      content,
      inputTokens:
        response.usage.input_tokens +
        (response.usage.cache_creation_input_tokens ?? 0) +
        (response.usage.cache_read_input_tokens ?? 0),
      outputTokens: response.usage.output_tokens,
      reasoningTokens:
        response.usage.output_tokens_details?.thinking_tokens,
      model: response.model,
    };
  }
}
