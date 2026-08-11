import type {
  ConversationMessage,
  DraftChange,
  IdeaMap,
} from "packages/products/src/thoughtform/shared";
import {
  CONVERSATION_MESSAGE_ROLES,
  IDEA_ACTION_TYPES,
  IDEA_DISPOSITIONS,
  IDEA_EXPLORATION_ASSESSMENTS,
  IDEA_IMPORTANCE_ASSESSMENTS,
  IDEA_STRUCTURE_OPERATION_TYPES,
} from "packages/products/src/thoughtform/shared";
import type { IdeaMapAnalysisModel } from "packages/products/src/thoughtform/server/capabilities/idea-map/ports/idea-map-analysis-model";
import {
  parseProposedIdeaActions,
  parseProposedIdeaStructure,
  parseProposedIdeas,
  type ProposedIdea,
  type ProposedIdeaAction,
  type ProposedIdeaStructure,
} from "packages/products/src/thoughtform/server/capabilities/idea-map/idea-map-model-output";
import { MAX_SPLIT_RESULTS } from "packages/products/src/thoughtform/server/capabilities/idea-map/idea-structure";
import {
  ConversationInputTooLargeError,
  MAX_CONVERSATION_INPUT_BYTES,
  measureConversationInputBytes,
} from "packages/products/src/thoughtform/server/capabilities/conversation/conversation-service";
import {
  IDEA_MAP_ANALYSIS_PROMPT_DEFINITION,
} from "packages/products/src/thoughtform/server/capabilities/idea-map/prompts/idea-map-analysis-prompt";
import {
  fallbackThoughtFormPromptProvider,
  type ThoughtFormPromptProvider,
} from "packages/products/src/thoughtform/server/ports/thoughtform-prompt-provider";

const MAX_IDEA_MAP_ANALYSIS_OUTPUT_TOKENS = 3_072;
const IDEA_ACTION_VALUES = Object.values(IDEA_ACTION_TYPES);

export const IDEA_MAP_ANALYSIS_OUTPUT_FORMAT = {
  name: "thoughtform_idea_map_analysis",
  schema: {
    type: "object",
    properties: {
      proposedIdeas: {
        anyOf: [
          {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: ["string", "null"] },
                title: { type: "string", minLength: 1 },
                synthesis: { type: "string", minLength: 1 },
                substance: { type: "string", minLength: 1 },
                unresolvedQuestions: {
                  type: "array",
                  maxItems: 3,
                  items: { type: "string", minLength: 1 },
                },
                disposition: {
                  type: "string",
                  enum: [IDEA_DISPOSITIONS.active],
                },
                assistantAssessment: {
                  type: "object",
                  properties: {
                    exploration: {
                      type: "string",
                      enum: Object.values(IDEA_EXPLORATION_ASSESSMENTS),
                    },
                    importance: {
                      type: "string",
                      enum: Object.values(IDEA_IMPORTANCE_ASSESSMENTS),
                    },
                  },
                  required: ["exploration", "importance"],
                  additionalProperties: false,
                },
                evidence: {
                  type: "array",
                  minItems: 1,
                  items: {
                    type: "object",
                    properties: { quote: { type: "string", minLength: 1 } },
                    required: ["quote"],
                    additionalProperties: false,
                  },
                },
              },
              required: [
                "id",
                "title",
                "synthesis",
                "substance",
                "unresolvedQuestions",
                "disposition",
                "assistantAssessment",
                "evidence",
              ],
              additionalProperties: false,
            },
          },
          { type: "null" },
        ],
      },
      ideaActions: {
        anyOf: [
          {
            type: "array",
            items: {
              type: "object",
              properties: {
                ideaId: { type: "string" },
                action: { type: "string", enum: IDEA_ACTION_VALUES },
                userInterpretation: { type: ["string", "null"] },
              },
              required: ["ideaId", "action", "userInterpretation"],
              additionalProperties: false,
            },
          },
          { type: "null" },
        ],
      },
      resolvedPotentialConflictIds: {
        anyOf: [
          { type: "array", items: { type: "string" } },
          { type: "null" },
        ],
      },
      proposedStructure: {
        anyOf: [
          {
            type: "object",
            properties: {
              type: { type: "string", enum: [IDEA_STRUCTURE_OPERATION_TYPES.merge] },
              ideaIds: { type: "array", minItems: 2, items: { type: "string" } },
              result: {
                type: "object",
                properties: {
                  title: { type: "string", minLength: 1 },
                  synthesis: { type: "string", minLength: 1 },
                  assistantAssessment: assessmentSchema(),
                },
                required: ["title", "synthesis", "assistantAssessment"],
                additionalProperties: false,
              },
              explanation: { type: "string", minLength: 1 },
            },
            required: ["type", "ideaIds", "result", "explanation"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              type: { type: "string", enum: [IDEA_STRUCTURE_OPERATION_TYPES.split] },
              ideaId: { type: "string" },
              results: {
                type: "array",
                minItems: 2,
                maxItems: MAX_SPLIT_RESULTS,
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string", minLength: 1 },
                    synthesis: { type: "string", minLength: 1 },
                    substance: { type: "string", minLength: 1 },
                    unresolvedQuestions: {
                      type: "array",
                      items: { type: "string", minLength: 1 },
                    },
                    assistantAssessment: assessmentSchema(),
                  },
                  required: ["title", "synthesis", "substance", "unresolvedQuestions", "assistantAssessment"],
                  additionalProperties: false,
                },
              },
              explanation: { type: "string", minLength: 1 },
            },
            required: ["type", "ideaId", "results", "explanation"],
            additionalProperties: false,
          },
          { type: "null" },
        ],
      },
    },
    required: [
      "proposedIdeas",
      "ideaActions",
      "resolvedPotentialConflictIds",
      "proposedStructure",
    ],
    additionalProperties: false,
  },
} as const;

export interface IdeaMapAnalysis {
  proposedIdeas: ProposedIdea[] | null;
  proposedIdeaActions: ProposedIdeaAction[] | null;
  resolvedPotentialConflictIds: string[] | null;
  proposedStructure?: ProposedIdeaStructure | null;
}

export class IdeaMapAnalysisService {
  constructor(
    private readonly model: IdeaMapAnalysisModel,
    private readonly promptProvider: ThoughtFormPromptProvider =
      fallbackThoughtFormPromptProvider,
  ) {}

  async analyse(input: {
    message: string;
    previousMessages: ConversationMessage[];
    ideaMap: IdeaMap;
    draftChange?: DraftChange;
  }): Promise<IdeaMapAnalysis> {
    const prompt = await this.promptProvider.getPrompt(
      IDEA_MAP_ANALYSIS_PROMPT_DEFINITION,
    );
    const ideaMapContext = {
      revision: input.ideaMap.revision,
      ideas: input.ideaMap.ideas,
      potentialConflicts: input.ideaMap.potentialConflicts ?? [],
    };
    const context = `<workspace_context>
<draft_change_attached>${input.draftChange ? "true" : "false"}</draft_change_attached>
<idea_map_json>${escapeXmlText(JSON.stringify(ideaMapContext))}</idea_map_json>
</workspace_context>`;
    const messages = selectBoundedAnalysisMessages({
      currentMessage: {
        role: CONVERSATION_MESSAGE_ROLES.user,
        content: input.message,
      },
      previousMessages: input.previousMessages,
      context,
      system: prompt.content,
    });
    if (measureConversationInputBytes({
      messages,
      system: prompt.content,
      context,
    }) > MAX_CONVERSATION_INPUT_BYTES) {
      throw new ConversationInputTooLargeError();
    }
    const response = await this.model.createAnalysis({
      maxOutputTokens: MAX_IDEA_MAP_ANALYSIS_OUTPUT_TOKENS,
      messages,
      outputFormat: IDEA_MAP_ANALYSIS_OUTPUT_FORMAT,
      system: prompt.content,
      context,
      promptReference: prompt.reference,
    });
    return parseIdeaMapAnalysis(response.content, {
      userSources: [
        ...messages
          .filter((message) => message.role === CONVERSATION_MESSAGE_ROLES.user)
          .map((message) => message.content),
        ...input.ideaMap.ideas.map((idea) => idea.substance),
      ],
      assistantSources: input.previousMessages
        .filter((message) => message.role === CONVERSATION_MESSAGE_ROLES.assistant)
        .map((message) => message.content),
    });
  }
}

function parseIdeaMapAnalysis(
  content: string,
  sources: { userSources: string[]; assistantSources: string[] },
): IdeaMapAnalysis {
  try {
    const parsed = JSON.parse(content.trim()) as Record<string, unknown>;
    const proposedIdeas = parseGroundedIdeas(
      parsed.proposedIdeas,
      sources.userSources,
      sources.assistantSources,
    );
    return {
      proposedIdeas,
      proposedIdeaActions: parseProposedIdeaActions(parsed.ideaActions),
      resolvedPotentialConflictIds: parseStringArray(
        parsed.resolvedPotentialConflictIds,
      ),
      proposedStructure: parseProposedIdeaStructure(parsed.proposedStructure),
    };
  } catch {
    return {
      proposedIdeas: null,
      proposedIdeaActions: null,
      resolvedPotentialConflictIds: null,
      proposedStructure: null,
    };
  }
}

function assessmentSchema() {
  return {
    type: "object",
    properties: {
      exploration: { type: "string", enum: Object.values(IDEA_EXPLORATION_ASSESSMENTS) },
      importance: { type: "string", enum: Object.values(IDEA_IMPORTANCE_ASSESSMENTS) },
    },
    required: ["exploration", "importance"],
    additionalProperties: false,
  } as const;
}

function parseGroundedIdeas(
  value: unknown,
  userSources: string[],
  assistantSources: string[],
) {
  if (!Array.isArray(value)) return null;
  const userLanguage = userSources.join(" ").toLocaleLowerCase();
  const assistantOnlyHyphenatedWords = new Set(
    assistantSources
      .join(" ")
      .toLocaleLowerCase()
      .split(/[^\p{L}\p{N}-]+/u)
      .filter((word) => word.includes("-") && !userLanguage.includes(word)),
  );
  const grounded = value.filter((candidate) => {
    if (!candidate || typeof candidate !== "object") return false;
    const record = candidate as Record<string, unknown>;
    if (!Array.isArray(record.evidence) || typeof record.substance !== "string") {
      return false;
    }
    const isEvidenceValid = record.evidence.length > 0 && record.evidence.every((item) => {
      if (!item || typeof item !== "object" || !("quote" in item)) return false;
      const quote = (item as { quote?: unknown }).quote;
      return typeof quote === "string" && quote.trim().length > 0 &&
        userSources.some((source) => source.includes(quote.trim()));
    });
    const substance = record.substance.toLocaleLowerCase();
    return isEvidenceValid && [...assistantOnlyHyphenatedWords].every(
      (word) => !substance.includes(word),
    );
  });
  return grounded.length > 0 ? parseProposedIdeas(grounded) : null;
}

function selectBoundedAnalysisMessages(input: {
  currentMessage: ConversationMessage;
  previousMessages: ConversationMessage[];
  context: string;
  system: string;
}) {
  const messages = [input.currentMessage];
  for (let index = input.previousMessages.length - 1; index >= 0; index -= 1) {
    const candidate = [input.previousMessages[index]!, ...messages];
    if (measureConversationInputBytes({
      messages: candidate,
      system: input.system,
      context: input.context,
    }) > MAX_CONVERSATION_INPUT_BYTES) break;
    messages.unshift(input.previousMessages[index]!);
  }
  while (
    messages.length > 1 &&
    messages[0]?.role === CONVERSATION_MESSAGE_ROLES.assistant
  ) messages.shift();
  return messages;
}

function parseStringArray(value: unknown) {
  return Array.isArray(value) && value.every(
    (candidate) => typeof candidate === "string" && candidate.trim(),
  )
    ? value.map((candidate) => candidate.trim())
    : null;
}

function escapeXmlText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
