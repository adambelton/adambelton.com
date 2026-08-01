import { Hono } from "hono";
import {
  ConversationService,
  respondToConversation,
} from "packages/products/src/socratic-draft/server/conversation";
import type {
  ConversationResponder,
  TemporaryConversationStore,
} from "packages/products/src/socratic-draft/server/conversation";
import { parseConversationRequest } from "packages/products/src/socratic-draft/server/http/conversation-request";
import { CONVERSATION_ERROR_CODES } from "packages/products/src/socratic-draft/shared";
import { failure, success } from "packages/shared/src";

export type CreateConversationRouteDependencies = {
  conversationStore?: TemporaryConversationStore;
  getConversationStore?: (
    request: Request,
  ) => Promise<TemporaryConversationStore | null>;
  conversationService?: ConversationResponder;
};

export function createConversationRoute({
  conversationStore,
  getConversationStore,
  conversationService = new ConversationService(),
}: CreateConversationRouteDependencies) {
  return new Hono().post("/respond", async (context) => {
    const requestConversationStore = getConversationStore
      ? await getConversationStore(context.req.raw)
      : conversationStore;

    if (!requestConversationStore) {
      return context.json(
        failure("unauthorized", "Sign in to continue the conversation."),
        401,
      );
    }

    const request = await parseConversationRequest(context.req.raw);

    if (!request) {
      return context.json(
        failure(
          CONVERSATION_ERROR_CODES.invalidRequest,
          "Conversation requests require a message and optional conversationId.",
        ),
        400,
      );
    }

    const result = await respondToConversation({
      conversationId: request.conversationId,
      message: request.message,
      conversationService,
      conversationStore: requestConversationStore,
    });

    if (result.status === CONVERSATION_ERROR_CODES.notFound) {
      return context.json(
        failure(
          CONVERSATION_ERROR_CODES.notFound,
          "The requested conversation was not found.",
        ),
        404,
      );
    }

    if (result.status === CONVERSATION_ERROR_CODES.unavailable) {
      return context.json(
        failure(
          CONVERSATION_ERROR_CODES.unavailable,
          "This temporary conversation is no longer available.",
        ),
        409,
      );
    }

    if (result.status === CONVERSATION_ERROR_CODES.inputTooLarge) {
      return context.json(
        failure(
          CONVERSATION_ERROR_CODES.inputTooLarge,
          "This conversation is too large to continue. Shorten it and try again.",
        ),
        413,
      );
    }

    if (result.status === CONVERSATION_ERROR_CODES.hostedAiDisabled) {
      return context.json(
        failure(
          CONVERSATION_ERROR_CODES.hostedAiDisabled,
          "The Socratic Draft is currently disabled.",
        ),
        503,
      );
    }

    if (result.status === CONVERSATION_ERROR_CODES.hostedAiUnavailable) {
      return context.json(
        failure(
          CONVERSATION_ERROR_CODES.hostedAiUnavailable,
          "The Socratic Draft could not respond. Try again shortly.",
        ),
        503,
      );
    }

    const temporaryConversation =
      await requestConversationStore.getCurrentConversation();

    if (!temporaryConversation) {
      return context.json(
        failure(
          CONVERSATION_ERROR_CODES.unavailable,
          "This temporary conversation is no longer available.",
        ),
        409,
      );
    }

    return context.json(
      success({
        ...result.response,
        expiresAt: temporaryConversation.expiresAt,
      }),
      201,
    );
  });
}
