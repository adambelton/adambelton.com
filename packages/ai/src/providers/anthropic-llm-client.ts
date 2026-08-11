import Anthropic from "@anthropic-ai/sdk";
import { LLM_STREAM_EVENT_TYPES } from "packages/ai/src/contracts/types";
import type {
  LlmClient,
  LlmOutputFormat,
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
    const outputConfig = createOutputConfig(request, this.effort);
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
      ...(outputConfig ? { output_config: outputConfig } : {}),
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
    const outputConfig = createOutputConfig(request, this.effort);
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
      ...(outputConfig ? { output_config: outputConfig } : {}),
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield { type: LLM_STREAM_EVENT_TYPES.textDelta, text: event.delta.text };
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
      type: LLM_STREAM_EVENT_TYPES.completed,
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

function createOutputConfig(
  request: LlmRequest,
  effort: AnthropicEffort | undefined,
) {
  if (!request.outputFormat && !effort) return undefined;

  const outputConfig: {
    effort?: AnthropicEffort;
    format?: {
      type: "json_schema";
      schema: LlmOutputFormat["schema"];
    };
  } = {};
  if (effort) outputConfig.effort = effort;
  if (request.outputFormat) {
    outputConfig.format = {
      type: "json_schema",
      schema: request.outputFormat.schema,
    };
  }
  return outputConfig;
}
