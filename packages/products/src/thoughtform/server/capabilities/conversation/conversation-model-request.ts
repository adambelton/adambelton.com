import type { ConversationMessage, IdeaMap } from "packages/products/src/thoughtform/shared";
import { CONVERSATION_MESSAGE_ROLES, IDEA_DISPOSITIONS } from "packages/products/src/thoughtform/shared";
import type { ConversationModelRequest } from "packages/products/src/thoughtform/server/capabilities/conversation/ports/conversation-model";
import type { ConversationServiceRequest } from "packages/products/src/thoughtform/server/capabilities/conversation/conversation-service";
import type { ThoughtFormPromptReference } from "packages/products/src/thoughtform/server/ports/thoughtform-prompt-provider";

const MAX_CONTEXT_SUBSTANCE_CHARACTERS = 8_000;

export function measureConversationInputBytes(input: {
  messages: ConversationMessage[];
  system: string;
  context?: string;
}) {
  return new TextEncoder().encode(JSON.stringify({
    system: input.context ? `${input.system}\n\n${input.context}` : input.system,
    messages: input.messages,
  })).byteLength;
}

export function createConversationModelRequest(input: {
  request: ConversationServiceRequest;
  system: string;
  outputFormat: ConversationModelRequest["outputFormat"];
  maxOutputTokens: number;
  maxInputBytes: number;
  promptReference?: ThoughtFormPromptReference;
}): ConversationModelRequest {
  const { request } = input;
  const context = `<workspace_context>
${createDraftContext(request)}
<idea_map_json>${escapeXmlText(JSON.stringify(createBoundedIdeaContext(request.ideaMap)))}</idea_map_json>
</workspace_context>`;
  const currentMessage = {
    role: CONVERSATION_MESSAGE_ROLES.user,
    content: request.message,
  } as const;
  return {
    maxOutputTokens: input.maxOutputTokens,
    outputFormat: input.outputFormat,
    system: input.system,
    context,
    messages: selectBoundedConversationMessages({
      currentMessage,
      previousMessages: request.previousMessages,
      system: input.system,
      context,
      maxInputBytes: input.maxInputBytes,
    }),
    promptReference: input.promptReference,
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
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function selectBoundedConversationMessages(input: {
  currentMessage: ConversationMessage;
  previousMessages: ConversationMessage[];
  system: string;
  context?: string;
  maxInputBytes: number;
}) {
  const messages = [input.currentMessage];
  for (let index = input.previousMessages.length - 1; index >= 0; index -= 1) {
    const candidate = [input.previousMessages[index]!, ...messages];
    if (measureConversationInputBytes({ messages: candidate, system: input.system, context: input.context }) > input.maxInputBytes) break;
    messages.unshift(input.previousMessages[index]!);
  }
  while (messages.length > 1 && messages[0]?.role === CONVERSATION_MESSAGE_ROLES.assistant) messages.shift();
  return messages;
}

export function createBoundedIdeaContext(ideaMap: IdeaMap | undefined) {
  if (!ideaMap) return { revision: 0, ideas: [] };
  const activeIdeas = ideaMap.ideas.filter((idea) =>
    idea.disposition === IDEA_DISPOSITIONS.active || idea.disposition === IDEA_DISPOSITIONS.focused);
  const substanceIds = new Set([
    ...activeIdeas.filter((idea) => idea.disposition === IDEA_DISPOSITIONS.focused),
    ...activeIdeas.filter((idea) => idea.disposition !== IDEA_DISPOSITIONS.focused),
  ].slice(0, 2).map((idea) => idea.id));
  return {
    revision: ideaMap.revision,
    ideas: ideaMap.ideas.map((idea) => ({
      id: idea.id,
      title: idea.title,
      synthesis: idea.synthesis,
      substance: substanceIds.has(idea.id) ? boundText(idea.substance, MAX_CONTEXT_SUBSTANCE_CHARACTERS) : undefined,
      unresolvedQuestions: substanceIds.has(idea.id) ? idea.unresolvedQuestions : undefined,
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
