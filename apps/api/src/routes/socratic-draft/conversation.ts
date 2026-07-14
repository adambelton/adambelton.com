import { Hono } from "hono";
import { ConversationService } from "packages/products/src/socratic-draft/server/conversation";
import type { EntryStore } from "packages/products/src/socratic-draft/server/conversation";
import type { ConversationRequest } from "packages/products/src/socratic-draft/shared";
import { failure, success } from "packages/shared/src";

export type CreateConversationRouteDependencies = {
  entryStore: EntryStore;
  conversationService?: ConversationService;
};

export function createConversationRoute({
  entryStore,
  conversationService = new ConversationService(),
}: CreateConversationRouteDependencies) {
  return new Hono().post("/respond", async (context) => {
    const request = await parseConversationRequest(context.req.raw);

    if (!request) {
      return context.json(
        failure(
          "invalid_conversation_request",
          "Conversation requests require a message and optional entryId.",
        ),
        400,
      );
    }

    const entryId = request.entryId ?? entryStore.createEntryId();
    const response = conversationService.respond({
      entryId,
      message: request.message,
    });

    await entryStore.appendConversationTurn({
      entryId: response.entryId,
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
    body.entryId !== undefined &&
    body.entryId !== null &&
    typeof body.entryId !== "string"
  ) {
    return null;
  }

  return {
    entryId: body.entryId ?? null,
    message: body.message,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
