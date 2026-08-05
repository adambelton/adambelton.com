import type { LlmClient } from "packages/ai/src";
import type {
  IdeaMapAnalysisModel,
  IdeaMapAnalysisModelRequest,
} from "packages/products/src/thoughtform/server/capabilities/idea-map";
import {
  HostedAiDisabledError,
  HostedAiUnavailableError,
} from "packages/products/src/thoughtform/server/capabilities/conversation";
import {
  noOpObservability,
  OBSERVATION_ATTRIBUTE_NAMES,
  type Observability,
} from "packages/observability/src";

export class LlmIdeaMapAnalysisModelAdapter implements IdeaMapAnalysisModel {
  constructor(
    private readonly llmClient: LlmClient,
    private readonly observability: Observability = noOpObservability,
    private readonly provider?: string,
    private readonly effort?: string,
  ) {}

  async createAnalysis(request: IdeaMapAnalysisModelRequest) {
    try {
      return await this.observability.observe(
        "thoughtform.provider.analyse_idea_map",
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
        async () => {
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
          return { content: response.content };
        },
      );
    } catch (error) {
      throw new HostedAiUnavailableError({ cause: error });
    }
  }
}

export class DisabledIdeaMapAnalysisModelAdapter implements IdeaMapAnalysisModel {
  async createAnalysis(_request: IdeaMapAnalysisModelRequest): Promise<never> {
    throw new HostedAiDisabledError();
  }
}
