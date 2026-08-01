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
          "invalid_conversation_request",
          "Conversation requests require a message and optional conversationId.",
        ),
        400,
      );
    }

    const conversationId =
      request.conversationId ?? requestConversationStore.createConversationId();
    const result = await respondToConversation({
      conversationId,
      message: request.message,
      conversationService,
      conversationStore: requestConversationStore,
    });

    if (result.status === "conversation_not_found") {
      return context.json(
        failure(
          "conversation_not_found",
          "The requested conversation was not found.",
        ),
        404,
      );
    }

    if (result.status === "conversation_unavailable") {
      return context.json(
        failure(
          "conversation_unavailable",
          "This temporary conversation is no longer available.",
        ),
        409,
      );
    }

    const temporaryConversation =
      await requestConversationStore.getCurrentConversation();

    if (!temporaryConversation) {
      return context.json(
        failure(
          "conversation_unavailable",
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
