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

export class LlmDraftModelAdapter
  implements DraftCompositionModel, RevisionProposalModel
{
  constructor(private readonly llmClient: LlmClient) {}

  async compose(input: DraftCompositionModelInput) {
    const response = await createDraftMessage(this.llmClient, {
      maxTokens: 8_192,
      system: [
        "Create the minimum coherent private articulation of only the supplied user-established material, in the user's own voice and perspective.",
        "The result is the user's expression itself, never a report, analysis, diagnosis, or therapeutic interpretation of the user, conversation, or workspace.",
        "Write in first person. Never write phrases such as 'the user reports', 'the user says', 'exact user language', or other provenance commentary.",
        "Choose only as much shape as coherence requires: one sentence, a paragraph, a list, or a longer account. Do not lengthen, smooth, or conclude merely to make the result seem complete.",
        "Faithfully preserve uncertainty, mixed feelings, intentional contradictions, provisional conclusions, and unresolved questions. Never manufacture resolution, confidence, causes, or advice.",
        "Do not quote the user's language merely to show that it came from them; integrate useful language naturally unless an actual quotation belongs in the requested piece.",
        "The input field names are context, not headings. Never expose labels or sections such as Synthesis, Substance, Assistant assessment, Importance, Exploration, Disposition, User interpretation, or Unresolved questions.",
        "Unresolved questions describe uncertainty to preserve within the writing when relevant; never reproduce them as a questionnaire or internal checklist.",
        "Do not mention the assistant, the model, the idea map, readiness, assessment, provenance, or selection mechanics.",
        "Follow the explicit instruction, including requests for deliberately early or rough writing.",
        "Return structured JSON.",
      ].join(" "),
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
