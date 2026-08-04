import type {
  ConversationModel,
  ConversationModelRequest,
  ConversationModelResponse,
} from "packages/products/src/thoughtform/server/capabilities/conversation/ports/conversation-model";

export type TestConversationModelResponse =
  | ConversationModelResponse
  | ((request: ConversationModelRequest) => ConversationModelResponse);

export class TestConversationModel implements ConversationModel {
  private responseIndex = 0;

  constructor(
    private readonly responses: TestConversationModelResponse[] = [
      {
        content:
          "I'm here with you. Share the thought you want to examine, and we can start by finding the question inside it.",
      },
    ],
  ) {
    if (responses.length === 0) {
      throw new Error("TestConversationModel requires at least one response.");
    }
  }

  async createResponse(
    request: ConversationModelRequest,
  ): Promise<ConversationModelResponse> {
    const response =
      this.responses[Math.min(this.responseIndex, this.responses.length - 1)]!;
    this.responseIndex += 1;
    return typeof response === "function" ? response(request) : response;
  }
}
