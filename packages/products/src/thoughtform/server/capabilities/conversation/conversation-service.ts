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
  decodeConversationText,
  IDEA_DISPOSITIONS,
  READINESS_ACTIONS,
  READINESS_ASSESSMENTS,
  USER_INTENTIONS,
} from "packages/products/src/thoughtform/shared";
import type { ConversationModel } from "packages/products/src/thoughtform/server/capabilities/conversation/ports/conversation-model";
import { FallbackConversationModel } from "packages/products/src/thoughtform/server/capabilities/conversation/fallback-conversation-model";
import {
  createJsonStringFieldDeltaDecoder,
} from "packages/products/src/thoughtform/server/capabilities/conversation/conversation-response-stream";
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

<idea_map_context>
Use the supplied Idea Map as established context for the conversation. Respect its distinctions, corrections, dispositions, and unresolved questions. Another concurrent operation analyses the user's message for Idea Map changes; do not report or encode those changes in this output.
</idea_map_context>

<saved_change_contract>
When an exact saved Draft change is attached, ask what the change means without canonising an interpretation. A later user response may establish its meaning in an ordinary turn.

When the preceding assistant message provisionally interprets a saved edit, treat the user's response as authoritative. Dismissal changes no idea substance. Confirmation or clarification may update established substance. Richer current user wording replaces rather than gets flattened into an earlier assistant paraphrase.
</saved_change_contract>

<draft_contract>
When a canonical Draft exists and the user requests an edit or revision, describe this operation accurately: conversation cannot change the Draft directly. Ask one necessary clarification if the request is ambiguous, then direct the user toward a reviewable revision proposal alongside the Draft. Keep the editing request out of the Idea Map.
</draft_contract>

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
    },
    required: [
      "response",
      "move",
      "assistantReadiness",
      "userIntention",
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

export type ConversationGeneration = Omit<ConversationResponse, "ideaMap">;
export type ConversationGenerationStreamEvent =
  | { type: "text_delta"; text: string }
  | { type: "completed"; generation: ConversationGeneration };

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

    const modelResponse = await this.conversationModel.createResponse(modelRequest);
    const structured = await this.observability.observe(
      "thoughtform.conversation.validate_output",
      {},
      async () => parseConversationModelResponse(modelResponse.content),
    );

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
    };
    this.observability.recordContent({ output: generation });
    return generation;
    });
  }

  async *respondStream(
    request: ConversationServiceRequest,
  ): AsyncIterable<ConversationGenerationStreamEvent> {
    const modelRequest = createConversationModelRequest(request);
    if (measureConversationInputBytes(modelRequest) > MAX_CONVERSATION_INPUT_BYTES) {
      throw new ConversationInputTooLargeError();
    }
    if (!this.conversationModel.streamResponse) {
      const generation = await this.respond(request);
      yield { type: "text_delta", text: generation.message.content };
      yield { type: "completed", generation };
      return;
    }

    const decoder = createJsonStringFieldDeltaDecoder("response");
    let emittedText = "";
    for await (const event of this.conversationModel.streamResponse(modelRequest)) {
      if (event.type === "text_delta") {
        const text = decoder.push(event.text);
        if (text) {
          emittedText += text;
          yield { type: "text_delta", text };
        }
        continue;
      }
      const structured = parseConversationModelResponse(event.content);
      const responseText = decodeConversationText(structured.response);
      if (!emittedText) {
        emittedText = responseText;
        yield { type: "text_delta", text: emittedText };
      }
      const generation: ConversationGeneration = {
        conversationId: request.conversationId ?? DEFAULT_CONVERSATION_ID,
        message: {
          role: CONVERSATION_MESSAGE_ROLES.assistant,
          content: responseText,
        },
        activity: ACTIVITIES.discovery,
        move: structured.move,
        assistantReadiness: structured.assistantReadiness,
        userIntention: structured.userIntention,
      };
      this.observability.recordContent({ output: generation });
      yield { type: "completed", generation };
    }
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

export function parseConversationModelResponse(content: string): {
  response: string;
  move: AssistantMove;
  assistantReadiness: AssistantReadiness[];
  userIntention: UserIntention | null;
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
      };
    }
  } catch {
    if (looksLikeStructuredOutput(trimmed)) {
      return {
        response: DEFAULT_ASSISTANT_MESSAGE,
        ...createDefaultDiscoveryMetadata(),
      };
    }
  }

  return {
    response: trimmed || DEFAULT_ASSISTANT_MESSAGE,
    ...createDefaultDiscoveryMetadata(),
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
