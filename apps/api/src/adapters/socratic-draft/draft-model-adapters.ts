import type { LlmClient } from "packages/ai/src";
import {
  HostedAiDisabledError,
  HostedAiUnavailableError,
} from "packages/products/src/socratic-draft/server/conversation";
import type {
  DraftCompositionModel,
  DraftCompositionModelInput,
  RevisionProposalModel,
  RevisionProposalModelInput,
} from "packages/products/src/socratic-draft/server/draft";

export class LlmDraftModelAdapter
  implements DraftCompositionModel, RevisionProposalModel
{
  constructor(private readonly llmClient: LlmClient) {}

  async compose(input: DraftCompositionModelInput) {
    const response = await createDraftMessage(this.llmClient, {
      maxTokens: 8_192,
      system: [
        "Compose one continuous private draft from only the supplied user-established material.",
        "Preserve unresolved uncertainty and useful user language.",
        "Follow the explicit instruction, including requests for deliberately early or rough writing.",
        "Return structured JSON.",
      ].join(" "),
      messages: [{ role: "user", content: JSON.stringify(input) }],
      outputFormat: {
        name: "socratic_draft_composition",
        schema: {
          type: "object",
          properties: { body: { type: "string" } },
          required: ["body"],
          additionalProperties: false,
        },
      },
    });
    const parsed = parseObject(response.content);
    if (typeof parsed.body !== "string") throw new HostedAiUnavailableError();
    return { body: parsed.body };
  }

  async propose(input: RevisionProposalModelInput) {
    const response = await createDraftMessage(this.llmClient, {
      maxTokens: 8_192,
      system: [
        "Prepare an exact bounded revision proposal without changing canonical content.",
        "Return only replacement content for the requested scope and a concise intended effect.",
        "Do not add unsupported meaning. Return structured JSON.",
      ].join(" "),
      messages: [{ role: "user", content: JSON.stringify(input) }],
      outputFormat: {
        name: "socratic_draft_revision_proposal",
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
    });
    const parsed = parseObject(response.content);
    if (
      typeof parsed.proposedContent !== "string" ||
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
) {
  try {
    return await llmClient.createMessage(request);
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
