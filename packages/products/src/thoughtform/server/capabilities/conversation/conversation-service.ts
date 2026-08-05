import type {
  AssistantMove,
  AssistantReadiness,
  ConversationMessage,
  ConversationResponse,
  IdeaMap,
  DraftSelection,
  DraftChange,
  UserIntention,
} from "packages/products/src/thoughtform/shared";
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
} from "packages/products/src/thoughtform/shared";
import type { ConversationModel } from "packages/products/src/thoughtform/server/capabilities/conversation/ports/conversation-model";
import {
  parseProposedIdeas,
  parseProposedIdeaActions,
  type ProposedIdea,
  type ProposedIdeaAction,
} from "packages/products/src/thoughtform/server/capabilities/idea-map";
import { FallbackConversationModel } from "packages/products/src/thoughtform/server/capabilities/conversation/fallback-conversation-model";
import {
  noOpObservability,
  OBSERVATION_ATTRIBUTE_NAMES,
  type Observability,
} from "packages/observability/src";

const DEFAULT_CONVERSATION_ID = "draft-conversation";
export const MAX_CONVERSATION_INPUT_BYTES = 32 * 1024;
export const MAX_CONVERSATION_OUTPUT_TOKENS = 4_096;
const DEFAULT_ASSISTANT_MESSAGE =
  "What would you like to think through?";
const THOUGHTFORM_SYSTEM_PROMPT = [
  "You are ThoughtForm, a calm conversational thinking companion.",
  "Help the user explore, organise, and express their own thinking or feeling. Do not assume that they want to write, publish, reach an audience, solve a problem, or reach a finished state.",
  "Treat what the user shares as material they may want to understand, not as an implicit request for practical advice, diagnosis, therapy, coaching, or problem-solving.",
  "Offer practical advice only when the user explicitly asks for it. Otherwise explore what the experience means, how the user understands it, and what tension, distinction, uncertainty, or possibility it contains.",
  "Ordinarily respond with one concise grounded reflection, distinction, or observation followed by one useful question when inquiry should continue. Do not stack questions.",
  "Acknowledge uncertainty, mixed feelings, contradictions, provisional conclusions, and unresolved questions without manufacturing confidence or resolution.",
  "You are not a therapist, clinician, crisis service, or substitute for professional support. Do not diagnose or make therapeutic claims. If the user appears to face immediate danger or asks for crisis help, pause ordinary inquiry, encourage immediate local emergency or crisis support and contact with a trusted person, and keep the response direct and non-judgmental.",
  "All work in this operation is discovery. Do not claim that composition has begun. Whether a draft exists is stated separately in the supplied workspace context.",
  "Follow explicit user direction about the idea to focus on and whether they want guidance, reflection, or continued exploration.",
  "Choose exactly one discovery move that matches the response. An offer_draft move may offer an optional articulation when expressing the current shape would be useful, without creating one or implying that the conversation is incomplete.",
  "Assess readiness separately for reflect and compose. Readiness is advisory and must preserve meaningful uncertainty rather than blocking explicit user intention.",
  "Return one readiness entry for reflect and one for compose. Use not_ready, ready_with_uncertainty, or ready; ready_with_uncertainty requires a concise grounded explanation of the important unresolved uncertainty.",
  "Reflection is ready only when you can accurately state the current shape without flattening it. Composition readiness is advisory: enough user-established material for even one coherent first-person sentence can be sufficient, and an explicit early composition request always remains valid even when readiness is not_ready or ready_with_uncertainty.",
  "Recognise explore, reflect, or compose intention only when the user expresses it. A compose intention does not create a draft in this operation.",
  "Keep the response brief, grounded, and humane.",
  "Use the supplied idea map to avoid repeating resolved questions and respect user dispositions.",
  "Return the response using the supplied structured output format.",
  "response must be the concise message shown to the user.",
  "proposedIdeas must contain only ideas that should be created or updated; use an existing id when enriching an idea and null only for a genuinely distinct new idea.",
  "Return ideaActions for explicit conversational focus, satisfy, park, dismiss, reopen, or correct instructions; each action must reference an existing idea id.",
  "For every proposed idea include id, title, synthesis, substance, unresolvedQuestions, disposition, and assistantAssessment with exploration and importance.",
  "For every proposed idea also include evidence containing one or more exact excerpts from user messages that establish its material. Evidence is validation metadata and is not persisted or shown as idea substance.",
  "For a genuinely new idea, id must be null; for enrichment, id must exactly match an id in the supplied idea map. Never invent an idea id.",
  "A proposed idea disposition must be active. Disposition changes happen only through ideaActions.",
  "assistantAssessment.exploration must be emerging, developing, or well_explored; importance must be background, supporting, or central.",
  "The idea map records only material expressed by the user or assistant language the user has explicitly adopted, confirmed, corrected, or meaningfully developed.",
  "Write every proposed idea title, synthesis, substance, and unresolved question as the user's own first-person material, not as assistant notes or a report about the user.",
  "Never use attribution or evidence-tracking phrases such as 'the user reports', 'the user says', 'exact user report', 'the conversation shows', or quotation merely to prove provenance. Preserve useful user language naturally in first person.",
  "Never put your own hypotheses, inferred causes, possible themes, genre suggestions, audience suggestions, structural advice, practical strategies, or unconfirmed interpretations into a title, synthesis, substance, or unresolved question.",
  "Substance may organise and clarify established user material, but every claim in it must be traceable to the conversation. Do not lead the user by canonising what the idea might become.",
  "Never put draft-edit history, saved-change mechanics, spelling or voice preferences, editing requests, proposal choices, assistant actions, or workspace instructions into canonical idea material. Those facts may guide the current response but are not the idea itself.",
  "When an exact saved draft change is attached, proposedIdeas and ideaActions must be null. Ask what the change means without canonising an interpretation; a later user response can establish meaning in an ordinary turn.",
  "When the preceding assistant message provisionally interprets a saved edit, treat the user's reply as authoritative: dismissal changes no idea substance; confirmation or clarification may update established substance; and richer current user wording must replace rather than be flattened into the assistant's earlier paraphrase.",
  "Potential conflicts are known tensions in established material, distinct from open questions. Ask toward resolution when relevant. Return resolvedPotentialConflictIds only when the user resolves one by refinement, contextual distinction, choosing a position, separating ideas, integrating an intentional explained tension, or dismissing a mistaken conflict.",
  "When resolving rather than dismissing a potential conflict, proposedIdeas must retain the user's established resolution in ordinary substance using the user's latest language. Never remove a conflict based only on your own inference.",
  "An explicit statement such as 'my settled view is', 'this replaces my earlier claim', 'I mean these in different contexts', 'I intend to preserve this tension', or 'that conflict is mistaken' establishes a resolution. In that same response you must return the matching existing conflict id in resolvedPotentialConflictIds and must not ask the user to confirm it again.",
  "If the user both confirms and restates a resolution, use the richer current user wording in proposedIdeas. A bare confirmation may adopt the preceding assistant wording, but an earlier assistant paraphrase must never replace richer current user language.",
  "If a canonical draft exists and the user asks to edit or revise it, do not claim that this conversation operation changed or will directly change the draft. Ask one necessary clarification when the request is ambiguous, and accurately direct the user to prepare a reviewable proposal alongside the draft. Never add the editing request to the idea map.",
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
  name: "thoughtform_conversation",
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
                title: { type: "string", minLength: 1 },
                synthesis: {
                  type: "string",
                  minLength: 1,
                  description: "A concise first-person articulation in the user's own perspective, with no attribution or assistant-facing provenance language.",
                },
                substance: {
                  type: "string",
                  minLength: 1,
                  description: "Rich first-person user-established material, never a transcript, report about the user, preference record, or editing workflow.",
                },
                unresolvedQuestions: {
                  type: "array",
                  maxItems: 3,
                  items: { type: "string", minLength: 1 },
                  description: "First-person questions grounded in unresolved user-established meaning, excluding editing, preference, format, and workflow questions.",
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
                evidence: {
                  type: "array",
                  minItems: 1,
                  items: {
                    type: "object",
                    properties: {
                      quote: { type: "string", minLength: 1 },
                    },
                    required: ["quote"],
                    additionalProperties: false,
                  },
                  description: "Exact excerpts from user-authored messages that establish this idea. Never cite assistant text as evidence.",
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
      resolvedPotentialConflictIds: {
        description: "Existing potential-conflict ids explicitly resolved or dismissed by the user's current message; never ids inferred resolved by the assistant alone.",
        anyOf: [
          { type: "array", items: { type: "string" } },
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
      "resolvedPotentialConflictIds",
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
  draftChange?: DraftChange;
  hasDraft?: boolean;
}

export type ConversationGeneration = Omit<ConversationResponse, "ideaMap"> & {
  proposedIdeas: ProposedIdea[] | null;
  proposedIdeaActions: ProposedIdeaAction[] | null;
  resolvedPotentialConflictIds?: string[] | null;
};

export interface ConversationServiceDependencies {
  conversationModel?: ConversationModel;
  observability?: Observability;
}

export class ConversationInputTooLargeError extends Error {
  constructor() {
    super("The conversation is too large to continue.");
    this.name = "ConversationInputTooLargeError";
  }
}

export class ConversationService {
  private readonly conversationModel: ConversationModel;
  private readonly observability: Observability;

  constructor({
    conversationModel = new FallbackConversationModel(),
    observability = noOpObservability,
  }: ConversationServiceDependencies = {}) {
    this.conversationModel = conversationModel;
    this.observability = observability;
  }

  async respond(
    request: ConversationServiceRequest,
  ): Promise<ConversationGeneration> {
    return this.observability.observe("thoughtform.conversation.respond", {
      [OBSERVATION_ATTRIBUTE_NAMES.previousMessageCount]: request.previousMessages.length,
      [OBSERVATION_ATTRIBUTE_NAMES.ideaCount]: request.ideaMap?.ideas.length ?? 0,
      [OBSERVATION_ATTRIBUTE_NAMES.ideaMapRevision]: request.ideaMap?.revision ?? 0,
    }, async () => {
    this.observability.recordContent({ input: {
      currentMessage: request.message,
      previousMessages: request.previousMessages,
      ideaMap: request.ideaMap,
      draftSelection: request.draftSelection,
      draftChange: request.draftChange,
      hasDraft: request.hasDraft ?? false,
    } });
    const modelRequest = createConversationModelRequest(request);

    if (measureConversationInputBytes(modelRequest) > MAX_CONVERSATION_INPUT_BYTES) {
      throw new ConversationInputTooLargeError();
    }

    let modelResponse = await this.conversationModel.createResponse(modelRequest);
    let structured = await this.observability.observe(
      "thoughtform.conversation.validate_output",
      {},
      async () => parseStructuredResponse(
      modelResponse.content,
      [
        ...modelRequest.messages
          .filter((message) => message.role === CONVERSATION_MESSAGE_ROLES.user)
          .map((message) => message.content),
        ...(request.ideaMap?.ideas.map((idea) => idea.substance) ?? []),
      ],
      request.previousMessages
        .filter((message) => message.role === CONVERSATION_MESSAGE_ROLES.assistant)
        .map((message) => message.content),
      ),
    );
    if (shouldRepairProposedIdeas(modelResponse.content, structured.proposedIdeas)) {
      this.observability.record({ [OBSERVATION_ATTRIBUTE_NAMES.repairAttempted]: true });
      modelResponse = await this.conversationModel.createResponse({
        ...modelRequest,
        system: `Your preceding output proposed idea material that failed provenance or product validation. Return one corrected complete response. Preserve the conversational response, remove unsupported material, and cite exact user-message evidence for every proposed idea. ${modelRequest.system}`,
      });
      structured = await this.observability.observe(
        "thoughtform.conversation.validate_repair",
        {},
        async () => parseStructuredResponse(modelResponse.content, [
        ...modelRequest.messages
          .filter((message) => message.role === CONVERSATION_MESSAGE_ROLES.user)
          .map((message) => message.content),
        ...(request.ideaMap?.ideas.map((idea) => idea.substance) ?? []),
      ], request.previousMessages
        .filter((message) => message.role === CONVERSATION_MESSAGE_ROLES.assistant)
        .map((message) => message.content)),
      );
    }

    const generation = {
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
      resolvedPotentialConflictIds: structured.resolvedPotentialConflictIds,
    };
    this.observability.recordContent({ output: generation });
    return generation;
    });
  }
}

function shouldRepairProposedIdeas(
  content: string,
  proposedIdeas: ProposedIdea[] | null,
) {
  if (proposedIdeas !== null) return false;
  try {
    const value = JSON.parse(stripJsonFence(content)) as Record<string, unknown>;
    return Array.isArray(value.proposedIdeas) && value.proposedIdeas.length > 0;
  } catch {
    return false;
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
  const draftContext = request.draftChange
    ? ` A canonical draft exists. The user explicitly attached the exact saved change from revision ${request.draftChange.fromRevision} to revision ${request.draftChange.toRevision} for discussion only. Do not treat it as an interpretation, preference, or authorisation to change the draft. Removed text: ${JSON.stringify(request.draftChange.removedText)} Added text: ${JSON.stringify(request.draftChange.addedText)}`
    : request.draftSelection
    ? ` A canonical draft exists. The user explicitly attached this exact passage from canonical draft revision ${request.draftSelection.baseDraftRevision} for discussion only; it does not authorize a draft change: ${JSON.stringify(request.draftSelection.selectedText)}`
    : request.hasDraft
      ? " A canonical draft exists, but no draft text is attached to this conversation operation. Conversation alone cannot change it; revision requests must lead to a reviewable proposal alongside the draft."
      : " No canonical draft exists in this operation.";
  const system = `${THOUGHTFORM_SYSTEM_PROMPT}${draftContext} Current idea map: ${JSON.stringify(createBoundedIdeaContext(request.ideaMap))}`;
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
    potentialConflicts: (ideaMap.potentialConflicts ?? []).map((conflict) => ({
      ...conflict,
      explanation: boundText(conflict.explanation, 1_000),
    })),
  };
}

function boundText(value: string, maximumCharacters: number) {
  return value.length <= maximumCharacters
    ? value
    : `${value.slice(0, maximumCharacters)}\n[Further canonical substance omitted from this operation's bounded context.]`;
}

function parseStructuredResponse(
  content: string,
  groundingSources: string[],
  assistantSources: string[],
): {
  response: string;
  move: AssistantMove;
  assistantReadiness: AssistantReadiness[];
  userIntention: UserIntention | null;
  proposedIdeas: ProposedIdea[] | null;
  proposedIdeaActions: ProposedIdeaAction[] | null;
  resolvedPotentialConflictIds: string[] | null;
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
        proposedIdeas: "proposedIdeas" in parsed
          ? parseGroundedProposedIdeas(parsed.proposedIdeas, groundingSources, assistantSources)
          : null,
        proposedIdeaActions:
          "ideaActions" in parsed
            ? parseProposedIdeaActions(parsed.ideaActions)
            : null,
        resolvedPotentialConflictIds:
          "resolvedPotentialConflictIds" in parsed
            ? parseStringArray(parsed.resolvedPotentialConflictIds)
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
        resolvedPotentialConflictIds: null,
      };
    }
  }

  return {
    response: trimmed || DEFAULT_ASSISTANT_MESSAGE,
    ...createDefaultDiscoveryMetadata(),
    proposedIdeas: null,
    proposedIdeaActions: null,
    resolvedPotentialConflictIds: null,
  };
}

function parseGroundedProposedIdeas(
  value: unknown,
  groundingSources: string[],
  assistantSources: string[],
): ProposedIdea[] | null {
  if (value === null) return null;
  if (!Array.isArray(value)) return null;
  const grounded = value.filter((candidate) =>
    hasValidUserEvidence(candidate, groundingSources) &&
    hasNoUnacceptedAssistantLanguage(candidate, groundingSources, assistantSources),
  );
  if (grounded.length === 0) return null;
  return parseProposedIdeas(grounded);
}

function hasValidUserEvidence(candidate: unknown, groundingSources: string[]) {
  if (!candidate || typeof candidate !== "object" || !("evidence" in candidate)) {
    return false;
  }
  const evidence = candidate.evidence;
  return Array.isArray(evidence) && evidence.length > 0 && evidence.every((item) => {
    if (!item || typeof item !== "object" || !("quote" in item)) return false;
    if (typeof item.quote !== "string" || !item.quote.trim()) return false;
    const quote = item.quote.trim();
    return groundingSources.some((message) => message.includes(quote));
  });
}

function hasNoUnacceptedAssistantLanguage(
  candidate: unknown,
  groundingSources: string[],
  assistantSources: string[],
) {
  if (!candidate || typeof candidate !== "object" || !("substance" in candidate)) {
    return false;
  }
  if (typeof candidate.substance !== "string") return false;
  const substance = normalizeGroundingText(candidate.substance);
  const userLanguage = normalizeGroundingText(groundingSources.join(" "));
  const assistantOnlyWords = new Set(
    normalizeGroundingText(assistantSources.join(" "))
      .split(/[^\p{L}\p{N}-]+/u)
      .filter((word) => word.includes("-") && !userLanguage.includes(word)),
  );
  return [...assistantOnlyWords].every((word) => !substance.includes(word));
}

function normalizeGroundingText(value: string) {
  return value.toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function parseStringArray(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((candidate) => typeof candidate === "string" && candidate.trim())
    ? value.map((candidate) => candidate.trim())
    : null;
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
