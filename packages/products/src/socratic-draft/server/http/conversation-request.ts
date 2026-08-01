import type { ConversationRequest } from "packages/products/src/socratic-draft/shared";

export async function parseConversationRequest(
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

export async function parseConversationMessage(
  request: Request,
): Promise<string | null> {
  const parsedRequest = await parseConversationRequest(request);
  return parsedRequest?.message ?? null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
