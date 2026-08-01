import type { LlmClient } from "packages/ai/src";
import type {
  ConversationModel,
  ConversationModelRequest,
} from "packages/products/src/socratic-draft/server/conversation";

export class LlmConversationModelAdapter implements ConversationModel {
  constructor(private readonly llmClient: LlmClient) {}

  async createResponse(request: ConversationModelRequest) {
    const response = await this.llmClient.createMessage({
      system: request.system,
      messages: request.messages,
    });

    return {
      content: response.content,
    };
  }
}
