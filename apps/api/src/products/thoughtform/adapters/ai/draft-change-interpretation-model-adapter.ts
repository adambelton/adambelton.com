import type { LlmClient } from "packages/ai/src";
import {
  HostedAiDisabledError,
  HostedAiUnavailableError,
} from "packages/products/src/thoughtform/server/capabilities/conversation";
import {
  MAX_DRAFT_OPERATION_OUTPUT_TOKENS,
  type DraftChangeInterpretationModel,
  type DraftChangeInterpretationModelInput,
} from "packages/products/src/thoughtform/server/capabilities/drafting";
import {
  DRAFT_CHANGE_INTERPRETATION_TYPES,
  POTENTIAL_CONFLICT_SCOPES,
  type DraftChangeInterpretationType,
  type PotentialConflictScope,
} from "packages/products/src/thoughtform/shared";
import {
  SAVED_CHANGE_INTERPRETATION_PROMPT_DEFINITION,
} from "packages/products/src/thoughtform/server/capabilities/drafting/prompts/saved-change-interpretation-prompt";
import {
  fallbackThoughtFormPromptProvider,
  type ThoughtFormPromptProvider,
} from "packages/products/src/thoughtform/server/ports/thoughtform-prompt-provider";
import { noOpObservability, type Observability } from "packages/observability/src";

export class LlmDraftChangeInterpretationModelAdapter
  implements DraftChangeInterpretationModel
{
  constructor(
    private readonly llmClient: LlmClient,
    private readonly promptProvider: ThoughtFormPromptProvider =
      fallbackThoughtFormPromptProvider,
    private readonly observability: Observability = noOpObservability,
  ) {}

  async interpret(input: DraftChangeInterpretationModelInput) {
    try {
      const prompt = await this.promptProvider.getPrompt(
        SAVED_CHANGE_INTERPRETATION_PROMPT_DEFINITION,
      );
      const response = await this.observability.observe(
        "thoughtform.provider.interpret_saved_change",
        {},
        async () => {
          this.observability.recordPrompt(prompt.reference);
          this.observability.recordContent({ input });
          const result = await this.llmClient.createMessage({
        maxTokens: MAX_DRAFT_OPERATION_OUTPUT_TOKENS,
        system: prompt.content,
        messages: [{ role: "user", content: JSON.stringify(input) }],
        outputFormat: {
          name: "thoughtform_saved_edit_interpretation",
          schema: {
            type: "object",
            properties: {
              type: { type: "string", enum: Object.values(DRAFT_CHANGE_INTERPRETATION_TYPES) },
              assistantMessage: { type: "string", maxLength: 600 },
              potentialConflicts: {
                type: "array",
                maxItems: 1,
                items: {
                  type: "object",
                  properties: {
                    scope: { type: "string", enum: Object.values(POTENTIAL_CONFLICT_SCOPES) },
                    summary: { type: "string", maxLength: 120 },
                    explanation: { type: "string", maxLength: 320 },
                    ideaIds: { type: "array", items: { type: "string" } },
                  },
                  required: ["scope", "summary", "explanation", "ideaIds"],
                  additionalProperties: false,
                },
              },
            },
            required: ["type", "assistantMessage", "potentialConflicts"],
            additionalProperties: false,
          },
        },
          });
          this.observability.recordGeneration({
            model: result.model,
            inputTokens: result.inputTokens,
            outputTokens: result.outputTokens,
            reasoningTokens: result.reasoningTokens,
            cacheReadTokens: result.cacheReadTokens,
            cacheWriteTokens: result.cacheWriteTokens,
          });
          this.observability.recordContent({ output: result.content });
          return result;
        },
      );
      return parseInterpretation(response.content);
    } catch (error) {
      if (error instanceof HostedAiUnavailableError) throw error;
      throw new HostedAiUnavailableError({ cause: error });
    }
  }
}

export class DisabledDraftChangeInterpretationModelAdapter
  implements DraftChangeInterpretationModel
{
  async interpret(_input: DraftChangeInterpretationModelInput): Promise<never> {
    throw new HostedAiDisabledError();
  }
}

function parseInterpretation(content: string) {
  const parsed: unknown = JSON.parse(content);
  if (!isRecord(parsed) || !isInterpretationType(parsed.type) ||
    typeof parsed.assistantMessage !== "string" || !Array.isArray(parsed.potentialConflicts)) {
    throw new HostedAiUnavailableError();
  }
  const potentialConflicts = parsed.potentialConflicts.map((candidate) => {
    if (!isRecord(candidate) || !isConflictScope(candidate.scope) ||
      typeof candidate.summary !== "string" || typeof candidate.explanation !== "string" ||
      !Array.isArray(candidate.ideaIds) || !candidate.ideaIds.every((id) => typeof id === "string")) {
      throw new HostedAiUnavailableError();
    }
    return {
      scope: candidate.scope,
      summary: candidate.summary,
      explanation: candidate.explanation,
      ideaIds: candidate.ideaIds as string[],
    };
  });
  return { type: parsed.type, assistantMessage: parsed.assistantMessage, potentialConflicts };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isInterpretationType(value: unknown): value is DraftChangeInterpretationType {
  return value === DRAFT_CHANGE_INTERPRETATION_TYPES.textualMaintenance ||
    value === DRAFT_CHANGE_INTERPRETATION_TYPES.composition ||
    value === DRAFT_CHANGE_INTERPRETATION_TYPES.conceptualChange ||
    value === DRAFT_CHANGE_INTERPRETATION_TYPES.structuralChange;
}

function isConflictScope(value: unknown): value is PotentialConflictScope {
  return typeof value === "string" && Object.values(POTENTIAL_CONFLICT_SCOPES).includes(value as PotentialConflictScope);
}
