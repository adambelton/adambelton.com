import type { LlmClient, LlmRequest } from "packages/ai/src";
import {
  projectThoughtFormOutputSchema,
  type ThoughtFormAiProfile,
} from "packages/products/src/thoughtform/server/capabilities/hosted-ai-profile";

export class ThoughtFormLlmClientAdapter implements LlmClient {
  constructor(
    private readonly profile: ThoughtFormAiProfile,
    private readonly client: LlmClient,
  ) {}

  createMessage(request: LlmRequest) {
    return this.client.createMessage(this.projectRequest(request));
  }

  async *streamMessage(request: LlmRequest) {
    const projectedRequest = this.projectRequest(request);
    if (this.client.streamMessage) {
      yield* this.client.streamMessage(projectedRequest);
      return;
    }
    const response = await this.client.createMessage(projectedRequest);
    yield { type: "text_delta" as const, text: response.content };
    yield { type: "completed" as const, response };
  }

  private projectRequest(request: LlmRequest): LlmRequest {
    return {
      ...request,
      ...(request.outputFormat ? {
        outputFormat: {
          ...request.outputFormat,
          schema: projectThoughtFormOutputSchema(
            this.profile,
            request.outputFormat.schema,
          ),
        },
      } : {}),
    };
  }
}
