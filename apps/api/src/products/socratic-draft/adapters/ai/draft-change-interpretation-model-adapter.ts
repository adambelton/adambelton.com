import type { LlmClient } from "packages/ai/src";
import {
  HostedAiDisabledError,
  HostedAiUnavailableError,
} from "packages/products/src/socratic-draft/server/capabilities/conversation";
import type {
  DraftChangeInterpretationModel,
  DraftChangeInterpretationModelInput,
} from "packages/products/src/socratic-draft/server/capabilities/drafting";
import {
  DRAFT_CHANGE_INTERPRETATION_TYPES,
  POTENTIAL_CONFLICT_SCOPES,
  type DraftChangeInterpretationType,
  type PotentialConflictScope,
} from "packages/products/src/socratic-draft/shared";

export class LlmDraftChangeInterpretationModelAdapter
  implements DraftChangeInterpretationModel
{
  constructor(private readonly llmClient: LlmClient) {}

  async interpret(input: DraftChangeInterpretationModelInput) {
    try {
      const response = await this.llmClient.createMessage({
        maxTokens: 1_024,
        system: [
          "Interpret one exact saved draft change conservatively.",
          "Classify it as composition, conceptual_change, or structural_change; obvious textual maintenance has already been removed.",
          "Write a brief provisional assistant response, preferably testing language in the user's voice, while making uncertainty explicit.",
          "Keep the assistant response under 80 words.",
          "Never claim the interpretation is established and never propose canonical idea changes.",
          "Potential conflicts are only for known user-established material that appears incompatible, not unanswered questions or mere possibilities.",
          "A conflict may be within_idea, between_ideas, or saved_edit and must reference existing idea ids.",
          "Return at most one conflict. Keep its summary under 12 words and explanation under 40 words.",
          "Return structured JSON.",
        ].join(" "),
        messages: [{ role: "user", content: JSON.stringify(input) }],
        outputFormat: {
          name: "socratic_draft_saved_edit_interpretation",
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
