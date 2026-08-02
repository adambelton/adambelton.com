import type { LlmClient } from "packages/ai/src";
import type {
  ConversationModel,
  ConversationModelRequest,
} from "packages/products/src/socratic-draft/server/conversation";
import {
  HostedAiDisabledError,
  HostedAiUnavailableError,
} from "packages/products/src/socratic-draft/server/conversation";

export class LlmConversationModelAdapter implements ConversationModel {
  constructor(private readonly llmClient: LlmClient) {}

  async createResponse(request: ConversationModelRequest) {
    try {
      const response = await this.llmClient.createMessage({
        maxTokens: request.maxOutputTokens,
        outputFormat: request.outputFormat,
        system: request.system,
        messages: request.messages,
      });

      return {
        content: response.content,
      };
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
