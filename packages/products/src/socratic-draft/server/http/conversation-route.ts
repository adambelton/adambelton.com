import { Hono } from "hono";
import { ConversationService } from "packages/products/src/socratic-draft/server/conversation";
import type { ConversationStore } from "packages/products/src/socratic-draft/server/conversation";
import type { ConversationRequest } from "packages/products/src/socratic-draft/shared";
import { failure, success } from "packages/shared/src";

export type ConversationResponder = Pick<ConversationService, "respond">;

export type CreateConversationRouteDependencies = {
  conversationStore?: ConversationStore;
  getConversationStore?: (request: Request) => Promise<ConversationStore | null>;
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

    const isNewConversation = request.conversationId === null;
    const conversationId =
      request.conversationId ?? requestConversationStore.createConversationId();
    const storedMessages =
      await requestConversationStore.getConversationMessages(conversationId);

    if (!isNewConversation && storedMessages === null) {
      return context.json(
        failure(
          "conversation_not_found",
          "The requested conversation was not found.",
        ),
        404,
      );
    }

    const previousMessages = storedMessages ?? [];
    const response = await conversationService.respond({
      conversationId,
      message: request.message,
      previousMessages,
    });

    await requestConversationStore.appendConversationTurn({
      conversationId: response.conversationId,
      userMessage: {
        role: "user",
        content: request.message,
      },
      assistantMessage: response.message,
    });

    return context.json(success(response), 201);
  });
}

async function parseConversationRequest(
  request: Request,
): Promise<ConversationRequest | null> {
  const body = await request.json().catch(() => null);

  if (!isRecord(body) || typeof body.message !== "string") {
    return null;
  }

  if (
    body.conversationId !== undefined &&
    body.conversationId !== null &&
    typeof body.conversationId !== "string"
  ) {
    return null;
  }

  return {
    conversationId: body.conversationId ?? null,
    message: body.message,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
