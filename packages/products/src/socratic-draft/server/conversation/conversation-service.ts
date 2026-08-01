import type {
  ConversationMessage,
  ConversationResponse,
  IdeaMap,
} from "packages/products/src/socratic-draft/shared";
import {
  ACTIVITIES,
  ASSISTANT_MOVES,
  CONVERSATION_MESSAGE_ROLES,
  IDEA_DISPOSITIONS,
} from "packages/products/src/socratic-draft/shared";
import type { ConversationModel } from "packages/products/src/socratic-draft/server/conversation/conversation-model";
import {
  parseProposedIdeas,
  parseProposedIdeaActions,
  type ProposedIdea,
  type ProposedIdeaAction,
} from "packages/products/src/socratic-draft/server/idea-map";

const DEFAULT_CONVERSATION_ID = "draft-conversation";
export const MAX_CONVERSATION_INPUT_BYTES = 32 * 1024;
export const MAX_CONVERSATION_OUTPUT_TOKENS = 4_096;
const DEFAULT_ASSISTANT_MESSAGE =
  "I'm here with you. Share the thought you want to examine, and we can start by finding the question inside it.";
const SOCRATIC_DRAFT_SYSTEM_PROMPT = [
  "You are The Socratic Draft, a calm writing companion.",
  "Help the user examine one rough thought at a time.",
  "Ask one useful question or offer one concise reflection.",
  "Do not rewrite the user's thought yet.",
  "Keep the response brief, grounded, and humane.",
  "Use the supplied idea map to avoid repeating resolved questions and respect user dispositions.",
  "Return the response using the supplied structured output format.",
  "response must be the concise message shown to the user.",
  "proposedIdeas must contain only ideas that should be created or updated; use an existing id when enriching an idea and null only for a genuinely distinct new idea.",
  "Return ideaActions for explicit conversational focus, satisfy, park, dismiss, reopen, or correct instructions; each action must reference an existing idea id.",
  "For every proposed idea include id, title, synthesis, substance, unresolvedQuestions, disposition, and assistantAssessment with exploration and importance.",
  "For a genuinely new idea, id must be null; for enrichment, id must exactly match an id in the supplied idea map. Never invent an idea id.",
  "A proposed idea disposition must be active. Disposition changes happen only through ideaActions.",
  "assistantAssessment.exploration must be emerging, developing, or well_explored; importance must be background, supporting, or central.",
  "The idea map records only material expressed by the user or assistant language the user has explicitly adopted, confirmed, corrected, or meaningfully developed.",
  "Never put your own hypotheses, inferred causes, possible themes, genre suggestions, audience suggestions, structural advice, practical strategies, or unconfirmed interpretations into a title, synthesis, substance, or unresolved question.",
  "Substance may organise and clarify established user material, but every claim in it must be traceable to the conversation. Do not lead the user by canonising what the idea might become.",
  "Return at most three unresolved questions. Each must arise directly from a tension or uncertainty already expressed by the user and remain appropriate to discovery; do not introduce composition questions about audience, tone, form, evidence, or structure before a draft exists.",
  "You may use private hypotheses only to choose one useful conversational question or explicitly tentative reflection. They are transient reasoning, not idea-map content.",
  "ideaActions must be null unless the user explicitly requests focus, satisfaction, parking, dismissal, reopening, or correction. Each action uses ideaId, action, and a userInterpretation string only for correction; never target a newly proposed idea.",
  "Preserve established substance, incorporate new discoveries coherently, and do not split facets of one idea into shallow separate ideas.",
].join(" ");
const MAX_CONTEXT_SUBSTANCE_CHARACTERS = 8_000;

export const CONVERSATION_MODEL_OUTPUT_FORMAT = {
  name: "socratic_draft_conversation",
  schema: {
    type: "object",
    properties: {
      response: { type: "string" },
      proposedIdeas: {
        anyOf: [
          {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: ["string", "null"] },
                title: { type: "string" },
                synthesis: { type: "string" },
                substance: { type: "string" },
                unresolvedQuestions: {
                  type: "array",
                  maxItems: 3,
                  items: { type: "string" },
                },
                disposition: { type: "string", enum: ["active"] },
                assistantAssessment: {
                  type: "object",
                  properties: {
                    exploration: {
                      type: "string",
                      enum: ["emerging", "developing", "well_explored"],
                    },
                    importance: {
                      type: "string",
                      enum: ["background", "supporting", "central"],
                    },
                  },
                  required: ["exploration", "importance"],
                  additionalProperties: false,
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
                action: {
                  type: "string",
                  enum: ["correct", "dismiss", "focus", "park", "reopen", "satisfy"],
                },
                userInterpretation: { type: ["string", "null"] },
              },
              required: ["ideaId", "action", "userInterpretation"],
              additionalProperties: false,
            },
          },
          { type: "null" },
        ],
      },
    },
    required: ["response", "proposedIdeas", "ideaActions"],
    additionalProperties: false,
  },
} as const;

export interface ConversationServiceRequest {
  conversationId: string | null;
  message: string;
  previousMessages: ConversationMessage[];
  ideaMap?: IdeaMap;
}

export type ConversationGeneration = Omit<ConversationResponse, "ideaMap"> & {
  proposedIdeas: ProposedIdea[] | null;
  proposedIdeaActions: ProposedIdeaAction[] | null;
};

export interface ConversationServiceDependencies {
  conversationModel?: ConversationModel;
}

export class ConversationInputTooLargeError extends Error {
  constructor() {
    super("The conversation is too large to continue.");
    this.name = "ConversationInputTooLargeError";
  }
}

export class ConversationService {
  private readonly conversationModel: ConversationModel;

  constructor({
    conversationModel = new StaticConversationModel(),
  }: ConversationServiceDependencies = {}) {
    this.conversationModel = conversationModel;
  }

  async respond(
    request: ConversationServiceRequest,
  ): Promise<ConversationGeneration> {
    const modelRequest = createConversationModelRequest(request);

    if (measureConversationInputBytes(modelRequest) > MAX_CONVERSATION_INPUT_BYTES) {
      throw new ConversationInputTooLargeError();
    }

    const modelResponse = await this.conversationModel.createResponse(modelRequest);

    const structured = parseStructuredResponse(modelResponse.content);

    return {
      conversationId: request.conversationId ?? DEFAULT_CONVERSATION_ID,
      message: {
        role: CONVERSATION_MESSAGE_ROLES.assistant,
        content: structured.response,
      },
      activity: ACTIVITIES.discovery,
      move: ASSISTANT_MOVES.probe,
      assistantReadiness: [],
      userIntention: null,
      suggestedReplies: [
        {
          label: "Start with a thought",
          message: request.message,
        },
      ],
      proposedIdeas: structured.proposedIdeas,
      proposedIdeaActions: structured.proposedIdeaActions,
    };
  }
}

export function measureConversationInputBytes(input: {
  messages: ConversationMessage[];
  system: string;
}) {
  return new TextEncoder().encode(
    JSON.stringify({ system: input.system, messages: input.messages }),
  ).byteLength;
}

export function measureConversationRequestInputBytes(
  request: ConversationServiceRequest,
) {
  return measureConversationInputBytes(createConversationModelRequest(request));
}

function createConversationModelRequest(request: ConversationServiceRequest) {
  return {
    maxOutputTokens: MAX_CONVERSATION_OUTPUT_TOKENS,
    outputFormat: CONVERSATION_MODEL_OUTPUT_FORMAT,
    system: `${SOCRATIC_DRAFT_SYSTEM_PROMPT} Current idea map: ${JSON.stringify(createBoundedIdeaContext(request.ideaMap))}`,
    messages: [
      ...request.previousMessages,
      {
        role: CONVERSATION_MESSAGE_ROLES.user,
        content: request.message,
      },
    ],
  };
}

export function createBoundedIdeaContext(ideaMap: IdeaMap | undefined) {
  if (!ideaMap) return { revision: 0, ideas: [] };
  const activeIdeas = ideaMap.ideas.filter((idea) =>
    idea.disposition === IDEA_DISPOSITIONS.active ||
    idea.disposition === IDEA_DISPOSITIONS.focused,
  );
  const substanceIds = new Set(
    [
      ...activeIdeas.filter(
        (idea) => idea.disposition === IDEA_DISPOSITIONS.focused,
      ),
      ...activeIdeas.filter(
        (idea) => idea.disposition !== IDEA_DISPOSITIONS.focused,
      ),
    ]
      .slice(0, 2)
      .map((idea) => idea.id),
  );
  return {
    revision: ideaMap.revision,
    ideas: ideaMap.ideas.map((idea) => ({
      id: idea.id,
      title: idea.title,
      synthesis: idea.synthesis,
      substance: substanceIds.has(idea.id)
        ? boundText(idea.substance, MAX_CONTEXT_SUBSTANCE_CHARACTERS)
        : undefined,
      unresolvedQuestions: substanceIds.has(idea.id)
        ? idea.unresolvedQuestions
        : undefined,
      assistantAssessment: idea.assistantAssessment,
      userInterpretation: idea.userInterpretation,
      disposition: idea.disposition,
    })),
  };
}

function boundText(value: string, maximumCharacters: number) {
  return value.length <= maximumCharacters
    ? value
    : `${value.slice(0, maximumCharacters)}\n[Further canonical substance omitted from this operation's bounded context.]`;
}

function parseStructuredResponse(content: string): {
  response: string;
  proposedIdeas: ProposedIdea[] | null;
  proposedIdeaActions: ProposedIdeaAction[] | null;
} {
  const trimmed = content.trim();
  try {
    const parsed = JSON.parse(stripJsonFence(trimmed)) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "response" in parsed &&
      typeof parsed.response === "string"
    ) {
      return {
        response: parsed.response.trim() || DEFAULT_ASSISTANT_MESSAGE,
        proposedIdeas:
          "proposedIdeas" in parsed
            ? parseProposedIdeas(parsed.proposedIdeas)
            : null,
        proposedIdeaActions:
          "ideaActions" in parsed
            ? parseProposedIdeaActions(parsed.ideaActions)
            : null,
      };
    }
  } catch {
    if (looksLikeStructuredOutput(trimmed)) {
      return {
        response: DEFAULT_ASSISTANT_MESSAGE,
        proposedIdeas: null,
        proposedIdeaActions: null,
      };
    }
  }

  return {
    response: trimmed || DEFAULT_ASSISTANT_MESSAGE,
    proposedIdeas: null,
    proposedIdeaActions: null,
  };
}

function looksLikeStructuredOutput(content: string) {
  return content.startsWith("{") || content.startsWith("```json");
}

function stripJsonFence(content: string) {
  return content.startsWith("```json") && content.endsWith("```")
    ? content.slice(7, -3).trim()
    : content;
}

class StaticConversationModel implements ConversationModel {
  async createResponse(): Promise<{ content: string }> {
    return {
      content: DEFAULT_ASSISTANT_MESSAGE,
    };
  }
}
