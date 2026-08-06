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
} from "packages/products/src/thoughtform/shared";
import type { IdeaMapAnalysisModel } from "packages/products/src/thoughtform/server/capabilities/idea-map/ports/idea-map-analysis-model";
import {
  parseProposedIdeaActions,
  parseProposedIdeas,
  type ProposedIdea,
  type ProposedIdeaAction,
} from "packages/products/src/thoughtform/server/capabilities/idea-map/idea-map-model-output";
import {
  ConversationInputTooLargeError,
  MAX_CONVERSATION_INPUT_BYTES,
  measureConversationInputBytes,
} from "packages/products/src/thoughtform/server/capabilities/conversation/conversation-service";

const IDEA_MAP_ANALYSIS_PROMPT = `<role>
You maintain ThoughtForm's Idea Map: the evolving, inspectable collection of ideas established by the user during Discovery.
</role>

<idea_map_contract>
Analyse the user's latest message against the supplied conversation history and current Idea Map. The assistant's concurrently generated response is not input and must not affect this update.

Preserve stable idea identity, established substance, resolved questions, user dispositions, and corrections. Keep facets of one idea together rather than splitting them into shallow separate ideas.

proposedIdeas contains only genuinely new ideas or existing ideas that the current user message should enrich. Use null as the id only for a genuinely distinct new idea. When enriching an idea, copy its existing id exactly. Proposed ideas remain active. Express disposition changes only through ideaActions.

Return no more than three unresolved questions for each proposed idea. Each question must arise from a tension or uncertainty the user has already expressed and remain appropriate to Discovery.

Return ideaActions only when the user explicitly requests focus, satisfaction, parking, dismissal, reopening, or correction. Reference an existing idea id and include userInterpretation only for correction.
</idea_map_contract>

<provenance_contract>
The Idea Map contains only material expressed by the user and assistant language the user has explicitly adopted, confirmed, corrected, or meaningfully developed. Every canonical claim must be traceable to that material.

Write titles, syntheses, substance, and unresolved questions as the user's own first-person material. Organise and clarify established material without adding assistant hypotheses, inferred causes, possible themes, practical strategies, writing advice, or unconfirmed interpretations.

For every proposed idea, evidence contains exact excerpts from user-authored messages establishing its material. Assistant text is never evidence.
</provenance_contract>

<saved_change_contract>
When an exact saved Draft change is attached, return null for proposedIdeas and ideaActions. A later user response may establish what the change means in an ordinary turn.
</saved_change_contract>

<conflict_contract>
Return a potential conflict id in resolvedPotentialConflictIds only when the user's latest message explicitly resolves or dismisses it. For a resolution rather than dismissal, retain the user's resolution in proposed idea substance. Never infer resolution from the assistant's response.
</conflict_contract>

<output_contract>
Return exactly the supplied structured output. The schema is authoritative for required fields, values, nullability, and collection limits.
</output_contract>`;

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
    },
    required: [
      "proposedIdeas",
      "ideaActions",
      "resolvedPotentialConflictIds",
    ],
    additionalProperties: false,
  },
} as const;

export interface IdeaMapAnalysis {
  proposedIdeas: ProposedIdea[] | null;
  proposedIdeaActions: ProposedIdeaAction[] | null;
  resolvedPotentialConflictIds: string[] | null;
}

export class IdeaMapAnalysisService {
  constructor(private readonly model: IdeaMapAnalysisModel) {}

  async analyse(input: {
    message: string;
    previousMessages: ConversationMessage[];
    ideaMap: IdeaMap;
    draftChange?: DraftChange;
  }): Promise<IdeaMapAnalysis> {
    const context = `<workspace_context>
<draft_change_attached>${input.draftChange ? "true" : "false"}</draft_change_attached>
<idea_map_json>${escapeXmlText(JSON.stringify(input.ideaMap))}</idea_map_json>
</workspace_context>`;
    const messages = selectBoundedAnalysisMessages({
      currentMessage: {
        role: CONVERSATION_MESSAGE_ROLES.user,
        content: input.message,
      },
      previousMessages: input.previousMessages,
      context,
    });
    if (measureConversationInputBytes({
      messages,
      system: IDEA_MAP_ANALYSIS_PROMPT,
      context,
    }) > MAX_CONVERSATION_INPUT_BYTES) {
      throw new ConversationInputTooLargeError();
    }
    const response = await this.model.createAnalysis({
      maxOutputTokens: MAX_IDEA_MAP_ANALYSIS_OUTPUT_TOKENS,
      messages,
      outputFormat: IDEA_MAP_ANALYSIS_OUTPUT_FORMAT,
      system: IDEA_MAP_ANALYSIS_PROMPT,
      context,
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
    };
  } catch {
    return {
      proposedIdeas: null,
      proposedIdeaActions: null,
      resolvedPotentialConflictIds: null,
    };
  }
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
    const validEvidence = record.evidence.length > 0 && record.evidence.every((item) => {
      if (!item || typeof item !== "object" || !("quote" in item)) return false;
      const quote = (item as { quote?: unknown }).quote;
      return typeof quote === "string" && quote.trim().length > 0 &&
        userSources.some((source) => source.includes(quote.trim()));
    });
    const substance = record.substance.toLocaleLowerCase();
    return validEvidence && [...assistantOnlyHyphenatedWords].every(
      (word) => !substance.includes(word),
    );
  });
  return grounded.length > 0 ? parseProposedIdeas(grounded) : null;
}

function selectBoundedAnalysisMessages(input: {
  currentMessage: ConversationMessage;
  previousMessages: ConversationMessage[];
  context: string;
}) {
  const messages = [input.currentMessage];
  for (let index = input.previousMessages.length - 1; index >= 0; index -= 1) {
    const candidate = [input.previousMessages[index]!, ...messages];
    if (measureConversationInputBytes({
      messages: candidate,
      system: IDEA_MAP_ANALYSIS_PROMPT,
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
