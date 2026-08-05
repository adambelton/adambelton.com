import Anthropic from "@anthropic-ai/sdk";
import type {
  LlmClient,
  LlmRequest,
  LlmResponse,
  LlmStreamEvent,
} from "packages/ai/src/contracts/types";

export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-5";

export type AnthropicEffort = "low" | "medium" | "high" | "xhigh" | "max";

export type AnthropicLlmClientOptions = {
  apiKey: string;
  model?: string;
  effort?: AnthropicEffort;
  decorateClient?: (client: Anthropic) => Anthropic;
};

export class AnthropicLlmClient implements LlmClient {
  private readonly client: Anthropic;
  private readonly model: string;
  private readonly effort: AnthropicEffort | undefined;

  constructor({
    apiKey,
    model = DEFAULT_ANTHROPIC_MODEL,
    effort,
    decorateClient = (client) => client,
  }: AnthropicLlmClientOptions) {
    this.client = decorateClient(new Anthropic({ apiKey }));
    this.model = model;
    this.effort = effort;
  }

  async createMessage(request: LlmRequest): Promise<LlmResponse> {
    const response = await this.client.messages.create({
      max_tokens: request.maxTokens,
      messages: request.messages,
      model: this.model,
      system: request.context
        ? [
            {
              type: "text" as const,
              text: request.system,
              cache_control: { type: "ephemeral" as const },
            },
            {
              type: "text" as const,
              text: request.context,
            },
          ]
        : request.system,
      ...(request.outputFormat || this.effort
        ? {
            output_config: {
              ...(this.effort ? { effort: this.effort } : {}),
              ...(request.outputFormat
                ? {
                    format: {
                      type: "json_schema" as const,
                      schema: request.outputFormat.schema,
                    },
                  }
                : {}),
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
      cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
      cacheWriteTokens: response.usage.cache_creation_input_tokens ?? 0,
      model: response.model,
    };
  }

  async *streamMessage(request: LlmRequest): AsyncIterable<LlmStreamEvent> {
    const stream = this.client.messages.stream({
      max_tokens: request.maxTokens,
      messages: request.messages,
      model: this.model,
      system: request.context
        ? [
            {
              type: "text" as const,
              text: request.system,
              cache_control: { type: "ephemeral" as const },
            },
            { type: "text" as const, text: request.context },
          ]
        : request.system,
      ...(request.outputFormat || this.effort
        ? {
            output_config: {
              ...(this.effort ? { effort: this.effort } : {}),
              ...(request.outputFormat
                ? {
                    format: {
                      type: "json_schema" as const,
                      schema: request.outputFormat.schema,
                    },
                  }
                : {}),
            },
          }
        : {}),
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield { type: "text_delta", text: event.delta.text };
      }
    }

    const response = await stream.finalMessage();
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
    yield {
      type: "completed",
      response: {
        content,
        inputTokens:
          response.usage.input_tokens +
          (response.usage.cache_creation_input_tokens ?? 0) +
          (response.usage.cache_read_input_tokens ?? 0),
        outputTokens: response.usage.output_tokens,
        reasoningTokens: response.usage.output_tokens_details?.thinking_tokens,
        cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
        cacheWriteTokens: response.usage.cache_creation_input_tokens ?? 0,
        model: response.model,
      },
    };
  }
}
