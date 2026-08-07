import type { LlmClient } from "packages/ai/src";
import type {
  ConversationModel,
  ConversationModelRequest,
} from "packages/products/src/thoughtform/server/capabilities/conversation";
import {
  HostedAiDisabledError,
  HostedAiUnavailableError,
} from "packages/products/src/thoughtform/server/capabilities/conversation";
import {
  noOpObservability,
  OBSERVATION_ATTRIBUTE_NAMES,
  observeStream,
  type Observability,
} from "packages/observability/src";

export class LlmConversationModelAdapter implements ConversationModel {
  constructor(
    private readonly llmClient: LlmClient,
    private readonly observability: Observability = noOpObservability,
    private readonly provider?: string,
    private readonly effort?: string,
  ) {}

  async createResponse(request: ConversationModelRequest) {
    try {
      return await this.observability.observe("thoughtform.provider.generate_conversation", {
        ...(this.provider ? { [OBSERVATION_ATTRIBUTE_NAMES.provider]: this.provider } : {}),
        ...(this.effort ? { [OBSERVATION_ATTRIBUTE_NAMES.effort]: this.effort } : {}),
        [OBSERVATION_ATTRIBUTE_NAMES.inputBytes]: new TextEncoder().encode(
          JSON.stringify({
            system: request.system,
            context: request.context,
            messages: request.messages,
          }),
        ).byteLength,
      }, async () => {
      this.observability.recordContent({ input: request });
      const response = await this.llmClient.createMessage({
        maxTokens: request.maxOutputTokens,
        outputFormat: request.outputFormat,
        system: request.system,
        context: request.context,
        messages: request.messages,
      });

      this.observability.record({
        [OBSERVATION_ATTRIBUTE_NAMES.model]: response.model,
        [OBSERVATION_ATTRIBUTE_NAMES.inputTokens]: response.inputTokens ?? 0,
        [OBSERVATION_ATTRIBUTE_NAMES.outputTokens]: response.outputTokens ?? 0,
        [OBSERVATION_ATTRIBUTE_NAMES.reasoningTokens]: response.reasoningTokens ?? 0,
        [OBSERVATION_ATTRIBUTE_NAMES.cacheReadTokens]: response.cacheReadTokens ?? 0,
        [OBSERVATION_ATTRIBUTE_NAMES.cacheWriteTokens]: response.cacheWriteTokens ?? 0,
        [OBSERVATION_ATTRIBUTE_NAMES.outputCharacters]: response.content.length,
      });
      this.observability.recordContent({ output: response.content });
      return {
        content: response.content,
      };
      });
    } catch (error) {
      throw new HostedAiUnavailableError({ cause: error });
    }
  }

  async *streamResponse(request: ConversationModelRequest) {
    try {
      yield* observeStream(
        this.observability,
        "thoughtform.provider.generate_conversation_stream",
        {
          ...(this.provider
            ? { [OBSERVATION_ATTRIBUTE_NAMES.provider]: this.provider }
            : {}),
          ...(this.effort
            ? { [OBSERVATION_ATTRIBUTE_NAMES.effort]: this.effort }
            : {}),
          [OBSERVATION_ATTRIBUTE_NAMES.inputBytes]: new TextEncoder().encode(
            JSON.stringify(request),
          ).byteLength,
        },
        () => this.generateStream(request),
      );
    } catch (error) {
      throw new HostedAiUnavailableError({ cause: error });
    }
  }

  private async *generateStream(request: ConversationModelRequest) {
    const startedAt = globalThis.performance.now();
    let isFirstDeltaRecorded = false;
    this.observability.recordContent({ input: request });
    if (!this.llmClient.streamMessage) {
      const response = await this.llmClient.createMessage({
        maxTokens: request.maxOutputTokens,
        outputFormat: request.outputFormat,
        system: request.system,
        context: request.context,
        messages: request.messages,
      });
      this.observability.record({
        [OBSERVATION_ATTRIBUTE_NAMES.serverTimeToFirstTokenMs]: Math.round(
          globalThis.performance.now() - startedAt,
        ),
      });
      yield { type: "text_delta" as const, text: response.content };
      this.recordUsage(response);
      yield { type: "completed" as const, content: response.content };
      return;
    }
    for await (const event of this.llmClient.streamMessage({
      maxTokens: request.maxOutputTokens,
      outputFormat: request.outputFormat,
      system: request.system,
      context: request.context,
      messages: request.messages,
    })) {
      if (event.type === "text_delta") {
        if (!isFirstDeltaRecorded) {
          isFirstDeltaRecorded = true;
          this.observability.record({
            [OBSERVATION_ATTRIBUTE_NAMES.serverTimeToFirstTokenMs]: Math.round(
              globalThis.performance.now() - startedAt,
            ),
          });
        }
        yield event;
      }
      else {
        this.recordUsage(event.response);
        yield { type: "completed" as const, content: event.response.content };
      }
    }
  }

  private recordUsage(response: Awaited<ReturnType<LlmClient["createMessage"]>>) {
    this.observability.record({
      ...(this.provider
        ? { [OBSERVATION_ATTRIBUTE_NAMES.provider]: this.provider }
        : {}),
      ...(this.effort
        ? { [OBSERVATION_ATTRIBUTE_NAMES.effort]: this.effort }
        : {}),
      [OBSERVATION_ATTRIBUTE_NAMES.model]: response.model,
      [OBSERVATION_ATTRIBUTE_NAMES.inputTokens]: response.inputTokens ?? 0,
      [OBSERVATION_ATTRIBUTE_NAMES.outputTokens]: response.outputTokens ?? 0,
      [OBSERVATION_ATTRIBUTE_NAMES.reasoningTokens]: response.reasoningTokens ?? 0,
      [OBSERVATION_ATTRIBUTE_NAMES.cacheReadTokens]: response.cacheReadTokens ?? 0,
      [OBSERVATION_ATTRIBUTE_NAMES.cacheWriteTokens]: response.cacheWriteTokens ?? 0,
      [OBSERVATION_ATTRIBUTE_NAMES.outputCharacters]: response.content.length,
    });
    this.observability.recordContent({ output: response.content });
  }
}

export class DisabledConversationModelAdapter implements ConversationModel {
  async createResponse(_request: ConversationModelRequest): Promise<never> {
    throw new HostedAiDisabledError();
  }
}
