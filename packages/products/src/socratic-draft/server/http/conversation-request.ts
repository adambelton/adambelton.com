import type {
  ConversationRequest,
  DraftSelection,
} from "packages/products/src/socratic-draft/shared";

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

  if (
    body.draftSelection !== undefined &&
    !isDraftSelection(body.draftSelection)
  ) {
    return null;
  }

  return {
    conversationId: body.conversationId ?? null,
    message: body.message,
    ...(isDraftSelection(body.draftSelection)
      ? { draftSelection: body.draftSelection }
      : {}),
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

function isDraftSelection(value: unknown): value is DraftSelection {
  if (value === undefined) return false;
  if (!isRecord(value)) return false;
  return typeof value.baseDraftRevision === "number" &&
    typeof value.start === "number" &&
    typeof value.end === "number" &&
    typeof value.selectedText === "string";
}
