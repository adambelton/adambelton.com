import {
  ConversationInputTooLargeError,
  type ConversationService,
} from "packages/products/src/socratic-draft/server/conversation/conversation-service";
import {
  HostedAiDisabledError,
  HostedAiUnavailableError,
} from "packages/products/src/socratic-draft/server/conversation/conversation-model";
import {
  CONVERSATION_TURN_RETENTION_STATUSES,
  type ConversationStore,
} from "packages/products/src/socratic-draft/server/conversation/conversation-store";
import { WORKSPACE_EVENT_TYPES } from "packages/products/src/socratic-draft/server/workspace/workspace-events";
import type { WorkspaceEvent } from "packages/products/src/socratic-draft/server/workspace/workspace-events";
import {
  CONVERSATION_ERROR_CODES,
  CONVERSATION_MESSAGE_ROLES,
  type ConversationResponse,
} from "packages/products/src/socratic-draft/shared";

export const WORKSPACE_RESPONSE_STATUSES = {
  responded: "responded",
} as const;

export type ConversationResponder = Pick<ConversationService, "respond">;

export type RespondInWorkspaceResult =
  | {
      status: typeof WORKSPACE_RESPONSE_STATUSES.responded;
      response: ConversationResponse;
      events: WorkspaceEvent[];
    }
  | { status: typeof CONVERSATION_ERROR_CODES.notFound }
  | { status: typeof CONVERSATION_ERROR_CODES.unavailable }
  | { status: typeof CONVERSATION_ERROR_CODES.inputTooLarge }
  | { status: typeof CONVERSATION_ERROR_CODES.hostedAiDisabled }
  | { status: typeof CONVERSATION_ERROR_CODES.hostedAiUnavailable };

export async function respondInWorkspace(input: {
  conversationId: string | null;
  message: string;
  conversation: ConversationResponder;
  conversations: ConversationStore;
}): Promise<RespondInWorkspaceResult> {
  const previousMessages = input.conversationId
    ? await input.conversations.getConversationMessages(input.conversationId)
    : [];

  if (previousMessages === null) {
    return { status: CONVERSATION_ERROR_CODES.notFound };
  }

  let generatedResponse: ConversationResponse;

  try {
    generatedResponse = await input.conversation.respond({
      conversationId: input.conversationId,
      message: input.message,
      previousMessages,
    });
  } catch (error) {
    if (error instanceof ConversationInputTooLargeError) {
      return { status: CONVERSATION_ERROR_CODES.inputTooLarge };
    }
    if (error instanceof HostedAiDisabledError) {
      return { status: CONVERSATION_ERROR_CODES.hostedAiDisabled };
    }
    if (error instanceof HostedAiUnavailableError) {
      return { status: CONVERSATION_ERROR_CODES.hostedAiUnavailable };
    }
    throw error;
  }

  const conversationId =
    input.conversationId ?? input.conversations.createConversationId();
  const response = { ...generatedResponse, conversationId };
  const appendResult = await input.conversations.appendConversationTurn({
    conversationId,
    userMessage: {
      role: CONVERSATION_MESSAGE_ROLES.user,
      content: input.message,
    },
    assistantMessage: response.message,
  });

  if (appendResult.status !== CONVERSATION_TURN_RETENTION_STATUSES.retained) {
    return { status: CONVERSATION_ERROR_CODES.unavailable };
  }

  return {
    status: WORKSPACE_RESPONSE_STATUSES.responded,
    response,
    events: [
      {
        type: WORKSPACE_EVENT_TYPES.conversationTurnRetained,
        conversationId,
      },
    ],
  };
}
