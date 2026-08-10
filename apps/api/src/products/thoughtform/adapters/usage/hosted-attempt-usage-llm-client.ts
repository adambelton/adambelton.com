import type {
  LlmClient,
  LlmRequest,
} from "packages/ai/src";
import { LLM_STREAM_EVENT_TYPES } from "packages/ai/src";
import { recordHostedAttemptUsage } from "apps/api/src/products/thoughtform/adapters/usage/hosted-attempt-context";

export class HostedAttemptUsageLlmClient implements LlmClient {
  constructor(private readonly client: LlmClient) {}

  async createMessage(request: LlmRequest) {
    const response = await this.client.createMessage(request);
    recordHostedAttemptUsage(response);
    return response;
  }

  async *streamMessage(request: LlmRequest) {
    if (!this.client.streamMessage) {
      const response = await this.createMessage(request);
      yield { type: LLM_STREAM_EVENT_TYPES.textDelta, text: response.content };
      yield { type: LLM_STREAM_EVENT_TYPES.completed, response };
      return;
    }
    for await (const event of this.client.streamMessage(request)) {
      if (event.type === LLM_STREAM_EVENT_TYPES.completed) {
        recordHostedAttemptUsage(event.response);
      }
      yield event;
    }
  }
}
