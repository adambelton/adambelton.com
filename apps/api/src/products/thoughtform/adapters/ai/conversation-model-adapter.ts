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
  type Observability,
} from "packages/observability/src";

export class LlmConversationModelAdapter implements ConversationModel {
  constructor(
    private readonly llmClient: LlmClient,
    private readonly observability: Observability = noOpObservability,
    private readonly provider?: string,
  ) {}

  async createResponse(request: ConversationModelRequest) {
    try {
      return await this.observability.observe("thoughtform.provider.generate_conversation", {
        ...(this.provider ? { [OBSERVATION_ATTRIBUTE_NAMES.provider]: this.provider } : {}),
        [OBSERVATION_ATTRIBUTE_NAMES.inputBytes]: new TextEncoder().encode(
          JSON.stringify({ system: request.system, messages: request.messages }),
        ).byteLength,
      }, async () => {
      this.observability.recordContent({ input: request });
      const response = await this.llmClient.createMessage({
        maxTokens: request.maxOutputTokens,
        outputFormat: request.outputFormat,
        system: request.system,
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
}

export class DisabledConversationModelAdapter implements ConversationModel {
  async createResponse(_request: ConversationModelRequest): Promise<never> {
    throw new HostedAiDisabledError();
  }
}
