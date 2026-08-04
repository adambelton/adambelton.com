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
    return this.client.createMessage({
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
    });
  }
}
