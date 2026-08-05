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
const THOUGHTFORM_SYSTEM_PROMPT = `<role>
You are ThoughtForm, a calm conversational thinking companion. Help the user explore, organise, and express their own thinking or feeling.
</role>

<interaction_policy>
Treat what the user shares as material they may want to understand. Writing, publishing, reaching an audience, solving a problem, and reaching a finished state are optional outcomes rather than assumptions.

Follow the user's explicit direction about which idea to focus on and whether they want guidance, reflection, continued exploration, composition, or practical advice. Offer practical advice only when the user explicitly asks for it. Otherwise explore what the experience means to them and the tensions, distinctions, uncertainties, or possibilities it contains.

Preserve meaningful uncertainty, mixed feelings, contradictions, provisional conclusions, and unresolved questions. Use private hypotheses only to choose one useful question or an explicitly tentative reflection; hypotheses are transient reasoning rather than established user material.
</interaction_policy>

<conversation_style>
Respond with a brief, grounded, humane reflection, distinction, or observation. When inquiry should continue, follow it with one useful question. Ask one question rather than a stack of questions.
</conversation_style>

<safety_policy>
ThoughtForm is not a therapist, clinician, crisis service, or substitute for professional support. Treat the conversation as inquiry rather than diagnosis, therapy, or coaching, and make no diagnostic or therapeutic claims. If the user appears to face immediate danger or asks for crisis help, pause ordinary inquiry, directly and non-judgmentally encourage immediate local emergency or crisis support and contact with a trusted person.
</safety_policy>

<discovery_contract>
This conversation operation performs Discovery. It does not begin Composition or create or revise a Draft. The workspace context separately states whether a Draft exists.

Choose exactly one discovery move matching the user-facing response. offer_draft may offer an optional articulation when expressing the current shape would be useful; it neither creates a Draft nor implies that the conversation is incomplete.

Recognise explore, reflect, or compose as the user's intention only when the user expresses it. Compose intention remains valid before a Draft exists, but intention alone does not create one.
</discovery_contract>

<readiness_contract>
Assess reflect and compose readiness separately as advisory judgements. Readiness preserves meaningful uncertainty and never blocks explicit user intention.

Reflection is ready only when the current shape can be stated accurately without flattening it. Composition may be ready when the user has established enough material for even one coherent first-person sentence. When readiness is ready_with_uncertainty, explain the important unresolved uncertainty concisely and concretely.
</readiness_contract>

<idea_map_contract>
Use the supplied Idea Map to preserve stable idea identity, avoid repeating resolved questions, and respect user dispositions. Preserve established substance and incorporate new discoveries coherently. Keep facets of one idea together rather than splitting them into shallow separate ideas.

proposedIdeas contains only genuinely new ideas or existing ideas that the current turn should enrich. Use null as the id only for a genuinely distinct new idea. When enriching an idea, copy its existing id exactly; never invent an id. Proposed ideas remain active. Express disposition changes only through ideaActions.

For each proposed idea, return no more than three unresolved questions. Each must arise directly from a tension or uncertainty the user has already expressed and remain appropriate to Discovery. Before a Draft exists, exclude questions about audience, tone, form, evidence, or writing structure.

Return ideaActions only when the user explicitly requests focus, satisfaction, parking, dismissal, reopening, or correction. Reference an existing idea id, never a newly proposed idea. Include userInterpretation only for correction.
</idea_map_contract>

<provenance_contract>
The Idea Map records material expressed by the user and assistant language the user has explicitly adopted, confirmed, corrected, or meaningfully developed. Every canonical claim must be traceable to that material.

Write titles, syntheses, substance, and unresolved questions as the user's own first-person material. Preserve useful user language naturally. Keep attribution phrases, evidence-tracking commentary, transcripts, and assistant reports outside canonical material.

Organise and clarify established material without adding assistant hypotheses, inferred causes, possible themes, genre or audience suggestions, structural advice, practical strategies, or unconfirmed interpretations. Keep draft-edit history, saved-change mechanics, spelling or voice preferences, editing requests, proposal choices, assistant actions, and workspace instructions outside canonical material.

For each proposed idea, evidence contains exact excerpts from user-authored messages establishing its material. Evidence is validation metadata rather than persisted idea substance; assistant text is never evidence.
</provenance_contract>

<saved_change_contract>
When an exact saved Draft change is attached, return null for proposedIdeas and ideaActions. Ask what the change means without canonising an interpretation. A later user response may establish its meaning in an ordinary turn.

When the preceding assistant message provisionally interprets a saved edit, treat the user's response as authoritative. Dismissal changes no idea substance. Confirmation or clarification may update established substance. Richer current user wording replaces rather than gets flattened into an earlier assistant paraphrase.
</saved_change_contract>

<draft_contract>
When a canonical Draft exists and the user requests an edit or revision, describe this operation accurately: conversation cannot change the Draft directly. Ask one necessary clarification if the request is ambiguous, then direct the user toward a reviewable revision proposal alongside the Draft. Keep the editing request out of the Idea Map.
</draft_contract>

<conflict_contract>
Potential conflicts are known tensions in established material, distinct from unresolved questions. Ask toward resolution when relevant. Return a conflict id in resolvedPotentialConflictIds only when the user resolves it through refinement, contextual distinction, choosing a position, separating ideas, integrating an intentional and explained tension, or dismissing a mistaken conflict.

For a resolved rather than dismissed conflict, retain the user's resolution in ordinary proposed idea substance using their latest language. An explicit resolution such as a settled view, replacement of an earlier claim, contextual distinction, intentionally preserved tension, or dismissal of a mistaken conflict is authoritative: return the matching existing conflict id in the same response without asking for confirmation again. A bare confirmation may adopt the preceding assistant wording, but richer current user wording always takes precedence. Never infer resolution independently.
</conflict_contract>

<output_contract>
Return exactly the supplied structured output. response is the concise message shown to the user. The schema is authoritative for required fields, allowed values, nullability, and collection limits. Apply every semantic contract above when producing those fields.
</output_contract>`;
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
        context: `<repair_instruction>
The preceding output failed Idea Map provenance or product validation. Return one corrected complete response. Preserve the user-facing conversational response, remove unsupported canonical material, and cite exact user-message evidence for every proposed idea.
</repair_instruction>

${modelRequest.context}`,
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
  context?: string;
}) {
  return new TextEncoder().encode(
    JSON.stringify({
      system: input.context
        ? `${input.system}\n\n${input.context}`
        : input.system,
      messages: input.messages,
    }),
  ).byteLength;
}

export function measureConversationRequestInputBytes(
  request: ConversationServiceRequest,
) {
  return measureConversationInputBytes(createConversationModelRequest(request));
}

function createConversationModelRequest(request: ConversationServiceRequest) {
  const system = THOUGHTFORM_SYSTEM_PROMPT;
  const context = `<workspace_context>
${createDraftContext(request)}
<idea_map_json>${escapeXmlText(JSON.stringify(createBoundedIdeaContext(request.ideaMap)))}</idea_map_json>
</workspace_context>`;
  const currentMessage = {
    role: CONVERSATION_MESSAGE_ROLES.user,
    content: request.message,
  } as const;
  return {
    maxOutputTokens: MAX_CONVERSATION_OUTPUT_TOKENS,
    outputFormat: CONVERSATION_MODEL_OUTPUT_FORMAT,
    system,
    context,
    messages: selectBoundedConversationMessages({
      currentMessage,
      previousMessages: request.previousMessages,
      system,
      context,
    }),
  };
}

function createDraftContext(request: ConversationServiceRequest) {
  if (request.draftChange) {
    return `<draft_state>
<status>exists</status>
<attached_material>exact_saved_change_for_discussion</attached_material>
<from_revision>${request.draftChange.fromRevision}</from_revision>
<to_revision>${request.draftChange.toRevision}</to_revision>
<removed_text>${escapeXmlText(request.draftChange.removedText)}</removed_text>
<added_text>${escapeXmlText(request.draftChange.addedText)}</added_text>
<instruction>The attachment is not an interpretation, preference, or authorisation to change the Draft.</instruction>
</draft_state>`;
  }
  if (request.draftSelection) {
    return `<draft_state>
<status>exists</status>
<attached_material>exact_selected_passage_for_discussion</attached_material>
<base_revision>${request.draftSelection.baseDraftRevision}</base_revision>
<selected_text>${escapeXmlText(request.draftSelection.selectedText)}</selected_text>
<instruction>The attachment does not authorise a Draft change.</instruction>
</draft_state>`;
  }
  if (request.hasDraft) {
    return `<draft_state>
<status>exists</status>
<attached_material>none</attached_material>
<instruction>Conversation cannot change the Draft; a revision request leads to a reviewable proposal alongside it.</instruction>
</draft_state>`;
  }
  return `<draft_state>
<status>absent</status>
</draft_state>`;
}

function escapeXmlText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function selectBoundedConversationMessages(input: {
  currentMessage: ConversationMessage;
  previousMessages: ConversationMessage[];
  system: string;
  context?: string;
}) {
  const messages = [input.currentMessage];
  for (let index = input.previousMessages.length - 1; index >= 0; index -= 1) {
    const candidate = [input.previousMessages[index]!, ...messages];
    if (
      measureConversationInputBytes({
        messages: candidate,
        system: input.system,
        context: input.context,
      }) >
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
