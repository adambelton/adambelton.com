import { LLM_STREAM_EVENT_TYPES, type LlmClient } from "packages/ai/src";
import type {
  ConversationModel,
  ConversationModelRequest,
} from "packages/products/src/thoughtform/server/capabilities/conversation";
import {
  HostedAiDisabledError,
  HostedAiUnavailableError,
} from "packages/products/src/thoughtform/server/capabilities/conversation";
import { CONVERSATION_MODEL_STREAM_EVENT_TYPES } from "packages/products/src/thoughtform/server/capabilities/conversation/ports/conversation-model";
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
      if (request.promptReference) {
        this.observability.recordPrompt(request.promptReference);
      }
      this.observability.recordContent({ input: request });
      const response = await this.llmClient.createMessage({
        maxTokens: request.maxOutputTokens,
        outputFormat: request.outputFormat,
        system: request.system,
        context: request.context,
        messages: request.messages,
      });

      this.observability.recordGeneration({
        model: response.model,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        reasoningTokens: response.reasoningTokens,
        cacheReadTokens: response.cacheReadTokens,
        cacheWriteTokens: response.cacheWriteTokens,
      });
      this.observability.record({
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
    if (request.promptReference) {
      this.observability.recordPrompt(request.promptReference);
    }
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
      yield {
        type: CONVERSATION_MODEL_STREAM_EVENT_TYPES.textDelta,
        text: response.content,
      };
      this.recordUsage(response);
      yield {
        type: CONVERSATION_MODEL_STREAM_EVENT_TYPES.completed,
        content: response.content,
      };
      return;
    }
    for await (const event of this.llmClient.streamMessage({
      maxTokens: request.maxOutputTokens,
      outputFormat: request.outputFormat,
      system: request.system,
      context: request.context,
      messages: request.messages,
    })) {
      if (event.type === LLM_STREAM_EVENT_TYPES.textDelta) {
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
        yield {
          type: CONVERSATION_MODEL_STREAM_EVENT_TYPES.completed,
          content: event.response.content,
        };
      }
    }
  }

  private recordUsage(response: Awaited<ReturnType<LlmClient["createMessage"]>>) {
    this.observability.recordGeneration({
      model: response.model,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      reasoningTokens: response.reasoningTokens,
      cacheReadTokens: response.cacheReadTokens,
      cacheWriteTokens: response.cacheWriteTokens,
    });
    this.observability.record({
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
