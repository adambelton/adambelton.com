import OpenAI from "openai";
import { LLM_STREAM_EVENT_TYPES } from "packages/ai/src/contracts/types";
import type {
  LlmClient,
  LlmRequest,
  LlmResponse,
  LlmStreamEvent,
} from "packages/ai/src/contracts/types";

export const DEFAULT_OPENAI_MODEL = "gpt-5.6-terra";

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
      instructions: request.context
        ? `${request.system}\n\n${request.context}`
        : request.system,
      input: request.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      max_output_tokens: request.maxTokens,
      model: this.model,
      store: false,
      ...(request.outputFormat
        ? {
            text: {
              format: {
                type: "json_schema" as const,
                name: request.outputFormat.name,
                schema: request.outputFormat.schema,
                strict: true,
              },
            },
          }
        : {}),
      temperature: request.temperature,
    });

    if (response.status === "incomplete") {
      throw new Error("The model response was incomplete.");
    }

    return {
      content: response.output_text,
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
      reasoningTokens: response.usage?.output_tokens_details?.reasoning_tokens,
      cacheReadTokens: response.usage?.input_tokens_details?.cached_tokens ?? 0,
      model: response.model,
    };
  }

  async *streamMessage(request: LlmRequest): AsyncIterable<LlmStreamEvent> {
    const stream = this.client.responses.stream({
      instructions: request.context
        ? `${request.system}\n\n${request.context}`
        : request.system,
      input: request.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      max_output_tokens: request.maxTokens,
      model: this.model,
      store: false,
      ...(request.outputFormat
        ? {
            text: {
              format: {
                type: "json_schema" as const,
                name: request.outputFormat.name,
                schema: request.outputFormat.schema,
                strict: true,
              },
            },
          }
        : {}),
      temperature: request.temperature,
    });

    for await (const event of stream) {
      if (event.type === "response.output_text.delta") {
        yield { type: LLM_STREAM_EVENT_TYPES.textDelta, text: event.delta };
      }
    }

    const response = await stream.finalResponse();
    if (response.status === "incomplete") {
      throw new Error("The model response was incomplete.");
    }
    yield {
      type: LLM_STREAM_EVENT_TYPES.completed,
      response: {
        content: response.output_text,
        inputTokens: response.usage?.input_tokens,
        outputTokens: response.usage?.output_tokens,
        reasoningTokens: response.usage?.output_tokens_details?.reasoning_tokens,
        cacheReadTokens: response.usage?.input_tokens_details?.cached_tokens ?? 0,
        model: response.model,
      },
    };
  }
}
