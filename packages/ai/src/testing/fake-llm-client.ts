import type { LlmClient, LlmRequest, LlmResponse } from "packages/ai/src/contracts/types";

export class FakeLlmClient implements LlmClient {
  async createMessage(_request: LlmRequest): Promise<LlmResponse> {
    return {
      content:
        "There is something worth slowing down with here. What feels most important to say, even privately?",
      model: "fake-llm"
    };
  }
}
