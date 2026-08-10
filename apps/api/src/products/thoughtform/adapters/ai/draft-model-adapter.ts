import type { LlmClient } from "packages/ai/src";
import {
  HostedAiDisabledError,
  HostedAiUnavailableError,
} from "packages/products/src/thoughtform/server/capabilities/conversation";
import type {
  DraftCompositionModel,
  DraftCompositionModelInput,
  RevisionProposalModel,
  RevisionProposalModelInput,
} from "packages/products/src/thoughtform/server/capabilities/drafting";
import {
  DRAFT_COMPOSITION_PROMPT_DEFINITION,
} from "packages/products/src/thoughtform/server/capabilities/drafting/prompts/draft-composition-prompt";
import {
  REVISION_PROPOSAL_PROMPT_DEFINITION,
} from "packages/products/src/thoughtform/server/capabilities/drafting/prompts/revision-proposal-prompt";
import {
  fallbackThoughtFormPromptProvider,
  type ThoughtFormPromptProvider,
} from "packages/products/src/thoughtform/server/ports/thoughtform-prompt-provider";
import {
  noOpObservability,
  type Observability,
} from "packages/observability/src";

export class LlmDraftModelAdapter
  implements DraftCompositionModel, RevisionProposalModel
{
  constructor(
    private readonly llmClient: LlmClient,
    private readonly promptProvider: ThoughtFormPromptProvider =
      fallbackThoughtFormPromptProvider,
    private readonly observability: Observability = noOpObservability,
  ) {}

  async compose(input: DraftCompositionModelInput) {
    const prompt = await this.promptProvider.getPrompt(
      DRAFT_COMPOSITION_PROMPT_DEFINITION,
    );
    const response = await createDraftMessage(this.llmClient, {
      maxTokens: 8_192,
      system: prompt.content,
      messages: [{ role: "user", content: JSON.stringify(input) }],
      outputFormat: {
        name: "thoughtform_composition",
        schema: {
          type: "object",
          properties: { body: { type: "string" } },
          required: ["body"],
          additionalProperties: false,
        },
      },
    }, this.observability, "thoughtform.provider.compose_draft", prompt.reference);
    const parsed = parseObject(response.content);
    if (typeof parsed.body !== "string" || !parsed.body.trim()) {
      throw new HostedAiUnavailableError();
    }
    return { body: parsed.body };
  }

  async propose(input: RevisionProposalModelInput) {
    const prompt = await this.promptProvider.getPrompt(
      REVISION_PROPOSAL_PROMPT_DEFINITION,
    );
    const response = await createDraftMessage(this.llmClient, {
      maxTokens: 8_192,
      system: prompt.content,
      messages: [{ role: "user", content: JSON.stringify(input) }],
      outputFormat: {
        name: "thoughtform_revision_proposal",
        schema: {
          type: "object",
          properties: {
            proposedContent: { type: "string" },
            intendedEffect: { type: "string" },
          },
          required: ["proposedContent", "intendedEffect"],
          additionalProperties: false,
        },
      },
    }, this.observability, "thoughtform.provider.propose_revision", prompt.reference);
    const parsed = parseObject(response.content);
    if (
      typeof parsed.proposedContent !== "string" ||
      !parsed.proposedContent.trim() ||
      typeof parsed.intendedEffect !== "string"
    ) throw new HostedAiUnavailableError();
    return {
      proposedContent: parsed.proposedContent,
      intendedEffect: parsed.intendedEffect,
    };
  }
}

export class DisabledDraftModelAdapter
  implements DraftCompositionModel, RevisionProposalModel
{
  async compose(_input: DraftCompositionModelInput): Promise<never> {
    throw new HostedAiDisabledError();
  }

  async propose(_input: RevisionProposalModelInput): Promise<never> {
    throw new HostedAiDisabledError();
  }
}

function parseObject(content: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(content);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // The provider response is normalized to the product's unavailable error.
  }
  throw new HostedAiUnavailableError();
}

async function createDraftMessage(
  llmClient: LlmClient,
  request: Parameters<LlmClient["createMessage"]>[0],
  observability: Observability,
  observationName: string,
  prompt: Parameters<Observability["recordPrompt"]>[0],
) {
  try {
    return await observability.observe(observationName, {}, async () => {
      observability.recordPrompt(prompt);
      observability.recordContent({ input: request });
      const response = await llmClient.createMessage(request);
      observability.recordGeneration({
        model: response.model,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        reasoningTokens: response.reasoningTokens,
        cacheReadTokens: response.cacheReadTokens,
        cacheWriteTokens: response.cacheWriteTokens,
      });
      observability.recordContent({ output: response.content });
      return response;
    });
  } catch (error) {
    if (
      error instanceof HostedAiDisabledError ||
      error instanceof HostedAiUnavailableError
    ) {
      throw error;
    }
    throw new HostedAiUnavailableError();
  }
}
