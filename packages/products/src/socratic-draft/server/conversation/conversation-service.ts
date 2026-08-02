import type {
  AssistantMove,
  AssistantReadiness,
  ConversationMessage,
  ConversationResponse,
  IdeaMap,
  DraftSelection,
  UserIntention,
} from "packages/products/src/socratic-draft/shared";
import {
  ACTIVITIES,
  ASSISTANT_MOVES,
  CONVERSATION_MESSAGE_ROLES,
  IDEA_ACTION_TYPES,
  IDEA_DISPOSITIONS,
  IDEA_EXPLORATION_ASSESSMENTS,
  IDEA_IMPORTANCE_ASSESSMENTS,
  READINESS_ACTIONS,
  READINESS_ASSESSMENTS,
  USER_INTENTIONS,
} from "packages/products/src/socratic-draft/shared";
import type { ConversationModel } from "packages/products/src/socratic-draft/server/conversation/conversation-model";
import {
  parseProposedIdeas,
  parseProposedIdeaActions,
  type ProposedIdea,
  type ProposedIdeaAction,
} from "packages/products/src/socratic-draft/server/idea-map";
import { TestConversationModel } from "packages/products/src/socratic-draft/server/testing/test-conversation-model";

const DEFAULT_CONVERSATION_ID = "draft-conversation";
export const MAX_CONVERSATION_INPUT_BYTES = 32 * 1024;
export const MAX_CONVERSATION_OUTPUT_TOKENS = 4_096;
const DEFAULT_ASSISTANT_MESSAGE =
  "I'm here with you. Share the thought you want to examine, and we can start by finding the question inside it.";
const SOCRATIC_DRAFT_SYSTEM_PROMPT = [
  "You are The Socratic Draft, a calm writing companion.",
  "Treat what the user shares as material they may want to understand and develop through writing, not as an implicit request for practical advice, diagnosis, coaching, or problem-solving.",
  "Offer practical advice only when the user explicitly asks for it. Otherwise explore what the experience means, how the user understands it, what tension it contains, or what they may want the writing to say.",
  "Help the user examine one rough thought at a time.",
  "Ask one useful question or offer one concise reflection.",
  "All work in this operation is discovery. Do not claim that composition has begun. Whether a draft exists is stated separately in the supplied workspace context.",
  "Follow explicit user direction about the idea to focus on and whether they want guidance, reflection, or continued exploration.",
  "Choose exactly one discovery move that matches the response. An offer_draft move may offer a future draft without creating one.",
  "Assess readiness separately for reflect and compose. Readiness is advisory and must preserve meaningful uncertainty rather than blocking explicit user intention.",
  "Return one readiness entry for reflect and one for compose. Use not_ready, ready_with_uncertainty, or ready; ready_with_uncertainty requires a concise grounded explanation of the important unresolved uncertainty.",
  "Reflection is ready only when you can accurately state the current shape without flattening it. Composition is ordinarily ready only after a full reflection has been confirmed or refined and enough of the user's own language exists, but an explicit early composition request remains valid user intention even when readiness is not_ready or ready_with_uncertainty.",
  "Recognise explore, reflect, or compose intention only when the user expresses it. A compose intention does not create a draft in this operation.",
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

export const DISCOVERY_ASSISTANT_MOVES = [
  ASSISTANT_MOVES.askForExample,
  ASSISTANT_MOVES.branchCheck,
  ASSISTANT_MOVES.challenge,
  ASSISTANT_MOVES.clarify,
  ASSISTANT_MOVES.distinguish,
  ASSISTANT_MOVES.fullReflection,
  ASSISTANT_MOVES.offerDraft,
  ASSISTANT_MOVES.partialReflection,
  ASSISTANT_MOVES.probe,
  ASSISTANT_MOVES.suggestResearch,
  ASSISTANT_MOVES.surfacePerspective,
] as const;

const READINESS_ACTION_VALUES = Object.values(READINESS_ACTIONS);
const READINESS_ASSESSMENT_VALUES = Object.values(READINESS_ASSESSMENTS);
const USER_INTENTION_VALUES = Object.values(USER_INTENTIONS);
const ACTIVE_IDEA_DISPOSITION_VALUES = [IDEA_DISPOSITIONS.active] as const;
const IDEA_EXPLORATION_ASSESSMENT_VALUES = Object.values(
  IDEA_EXPLORATION_ASSESSMENTS,
);
const IDEA_IMPORTANCE_ASSESSMENT_VALUES = Object.values(
  IDEA_IMPORTANCE_ASSESSMENTS,
);
const IDEA_ACTION_TYPE_VALUES = Object.values(IDEA_ACTION_TYPES);

export const CONVERSATION_MODEL_OUTPUT_FORMAT = {
  name: "socratic_draft_conversation",
  schema: {
    type: "object",
    properties: {
      response: { type: "string" },
      move: {
        type: "string",
        enum: DISCOVERY_ASSISTANT_MOVES,
      },
      assistantReadiness: {
        type: "array",
        minItems: 2,
        maxItems: 2,
        items: {
          type: "object",
          properties: {
            action: { type: "string", enum: READINESS_ACTION_VALUES },
            assessment: {
              type: "string",
              enum: READINESS_ASSESSMENT_VALUES,
            },
            explanation: { type: ["string", "null"] },
          },
          required: ["action", "assessment", "explanation"],
          additionalProperties: false,
        },
      },
      userIntention: {
        type: ["string", "null"],
        enum: [...USER_INTENTION_VALUES, null],
      },
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
                disposition: {
                  type: "string",
                  enum: ACTIVE_IDEA_DISPOSITION_VALUES,
                },
                assistantAssessment: {
                  type: "object",
                  properties: {
                    exploration: {
                      type: "string",
                      enum: IDEA_EXPLORATION_ASSESSMENT_VALUES,
                    },
                    importance: {
                      type: "string",
                      enum: IDEA_IMPORTANCE_ASSESSMENT_VALUES,
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
                  enum: IDEA_ACTION_TYPE_VALUES,
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
    required: [
      "response",
      "move",
      "assistantReadiness",
      "userIntention",
      "proposedIdeas",
      "ideaActions",
    ],
    additionalProperties: false,
  },
} as const;

export interface ConversationServiceRequest {
  conversationId: string | null;
  message: string;
  previousMessages: ConversationMessage[];
  ideaMap?: IdeaMap;
  draftSelection?: DraftSelection;
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
    conversationModel = new TestConversationModel(),
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
      move: structured.move,
      assistantReadiness: structured.assistantReadiness,
      userIntention: structured.userIntention,
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
  const selectionContext = request.draftSelection
    ? ` A canonical draft exists. The user explicitly attached this exact passage from canonical draft revision ${request.draftSelection.baseDraftRevision} for discussion only; it does not authorize a draft change: ${JSON.stringify(request.draftSelection.selectedText)}`
    : " No canonical draft exists in this operation.";
  const system = `${SOCRATIC_DRAFT_SYSTEM_PROMPT}${selectionContext} Current idea map: ${JSON.stringify(createBoundedIdeaContext(request.ideaMap))}`;
  const currentMessage = {
    role: CONVERSATION_MESSAGE_ROLES.user,
    content: request.message,
  } as const;
  return {
    maxOutputTokens: MAX_CONVERSATION_OUTPUT_TOKENS,
    outputFormat: CONVERSATION_MODEL_OUTPUT_FORMAT,
    system,
    messages: selectBoundedConversationMessages({
      currentMessage,
      previousMessages: request.previousMessages,
      system,
    }),
  };
}

function selectBoundedConversationMessages(input: {
  currentMessage: ConversationMessage;
  previousMessages: ConversationMessage[];
  system: string;
}) {
  const messages = [input.currentMessage];
  for (let index = input.previousMessages.length - 1; index >= 0; index -= 1) {
    const candidate = [input.previousMessages[index]!, ...messages];
    if (
      measureConversationInputBytes({ messages: candidate, system: input.system }) >
      MAX_CONVERSATION_INPUT_BYTES
    ) {
      break;
    }
    messages.unshift(input.previousMessages[index]!);
  }
  while (
    messages.length > 1 &&
    messages[0]?.role === CONVERSATION_MESSAGE_ROLES.assistant
  ) {
    messages.shift();
  }
  return messages;
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
  move: AssistantMove;
  assistantReadiness: AssistantReadiness[];
  userIntention: UserIntention | null;
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
        move: parseAssistantMove("move" in parsed ? parsed.move : null),
        assistantReadiness: parseAssistantReadiness(
          "assistantReadiness" in parsed ? parsed.assistantReadiness : null,
        ),
        userIntention: parseUserIntention(
          "userIntention" in parsed ? parsed.userIntention : null,
        ),
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
        ...createDefaultDiscoveryMetadata(),
        proposedIdeas: null,
        proposedIdeaActions: null,
      };
    }
  }

  return {
    response: trimmed || DEFAULT_ASSISTANT_MESSAGE,
    ...createDefaultDiscoveryMetadata(),
    proposedIdeas: null,
    proposedIdeaActions: null,
  };
}

const DISCOVERY_MOVES = new Set<AssistantMove>(DISCOVERY_ASSISTANT_MOVES);

function createDefaultDiscoveryMetadata(): {
  move: AssistantMove;
  assistantReadiness: AssistantReadiness[];
  userIntention: UserIntention | null;
} {
  return {
    move: ASSISTANT_MOVES.probe,
    assistantReadiness: [],
    userIntention: null,
  };
}

function parseAssistantMove(value: unknown): AssistantMove {
  return typeof value === "string" && DISCOVERY_MOVES.has(value as AssistantMove)
    ? (value as AssistantMove)
    : ASSISTANT_MOVES.probe;
}

function parseAssistantReadiness(value: unknown): AssistantReadiness[] {
  if (!Array.isArray(value)) return [];
  const actions = new Set<string>();
  const readiness: AssistantReadiness[] = [];
  for (const item of value.slice(0, 2)) {
    if (typeof item !== "object" || item === null) continue;
    const action = "action" in item ? item.action : null;
    const assessment = "assessment" in item ? item.assessment : null;
    if (
      (action !== READINESS_ACTIONS.reflect && action !== READINESS_ACTIONS.compose) ||
      (assessment !== READINESS_ASSESSMENTS.notReady &&
        assessment !== READINESS_ASSESSMENTS.ready &&
        assessment !== READINESS_ASSESSMENTS.readyWithUncertainty) ||
      actions.has(action)
    ) continue;
    const explanation = "explanation" in item ? item.explanation : null;
    if (
      assessment === READINESS_ASSESSMENTS.readyWithUncertainty &&
      (typeof explanation !== "string" || explanation.trim().length === 0)
    ) continue;
    readiness.push({
      action,
      assessment,
      ...(typeof explanation === "string" && explanation.trim()
        ? { explanation: explanation.trim() }
        : {}),
    });
    actions.add(action);
  }
  return readiness;
}

function parseUserIntention(value: unknown): UserIntention | null {
  return value === USER_INTENTIONS.explore ||
    value === USER_INTENTIONS.reflect ||
    value === USER_INTENTIONS.compose
    ? value
    : null;
}

function looksLikeStructuredOutput(content: string) {
  return content.startsWith("{") || content.startsWith("```json");
}

function stripJsonFence(content: string) {
  return content.startsWith("```json") && content.endsWith("```")
    ? content.slice(7, -3).trim()
    : content;
}
