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
import {
  CONVERSATION_ERROR_CODES,
  CONVERSATION_MESSAGE_ROLES,
  type ConversationResponse,
} from "packages/products/src/socratic-draft/shared";

export const CONVERSATION_RESPONSE_STATUSES = {
  responded: "responded",
} as const;

export type ConversationResponder = Pick<ConversationService, "respond">;

export type RespondToConversationResult =
  | {
      status: typeof CONVERSATION_RESPONSE_STATUSES.responded;
      response: ConversationResponse;
    }
  | { status: typeof CONVERSATION_ERROR_CODES.notFound }
  | { status: typeof CONVERSATION_ERROR_CODES.unavailable }
  | { status: typeof CONVERSATION_ERROR_CODES.inputTooLarge }
  | { status: typeof CONVERSATION_ERROR_CODES.hostedAiDisabled }
  | { status: typeof CONVERSATION_ERROR_CODES.hostedAiUnavailable };

export async function respondToConversation(input: {
  conversationId: string | null;
  message: string;
  conversationService: ConversationResponder;
  conversationStore: ConversationStore;
}): Promise<RespondToConversationResult> {
  const previousMessages = input.conversationId
    ? await input.conversationStore.getConversationMessages(input.conversationId)
    : [];

  if (previousMessages === null) {
    return { status: CONVERSATION_ERROR_CODES.notFound };
  }

  let generatedResponse: ConversationResponse;

  try {
    generatedResponse = await input.conversationService.respond({
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
    input.conversationId ?? input.conversationStore.createConversationId();
  const response = { ...generatedResponse, conversationId };
  const appendResult = await input.conversationStore.appendConversationTurn({
    conversationId: response.conversationId,
    userMessage: {
      role: CONVERSATION_MESSAGE_ROLES.user,
      content: input.message,
    },
    assistantMessage: response.message,
  });

  return appendResult.status === CONVERSATION_TURN_RETENTION_STATUSES.retained
    ? { status: CONVERSATION_RESPONSE_STATUSES.responded, response }
    : { status: CONVERSATION_ERROR_CODES.unavailable };
}
