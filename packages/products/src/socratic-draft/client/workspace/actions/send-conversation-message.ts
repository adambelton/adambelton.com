import type {
  ConversationRequest,
  ConversationResponse,
  TemporaryConversationResponse,
} from "packages/products/src/socratic-draft/shared";
import type { ApiResponse } from "packages/shared/src";

const conversationEndpoint = "/api/products/socratic-draft/conversation/respond";

export class ConversationRequestError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ConversationRequestError";
  }
}

export async function sendConversationMessage(
  request: ConversationRequest,
  fetcher: typeof fetch = fetch,
): Promise<TemporaryConversationResponse> {
  return sendRequest(conversationEndpoint, request, fetcher);
}

export async function sendPersistentConversationMessage(
  request: ConversationRequest & { conversationId: string },
  fetcher: typeof fetch = fetch,
): Promise<ConversationResponse> {
  return sendRequest(
    `/api/products/socratic-draft/conversations/${encodeURIComponent(request.conversationId)}/respond`,
    request,
    fetcher,
  );
}

async function sendRequest<T extends ConversationResponse>(
  endpoint: string,
  request: ConversationRequest,
  fetcher: typeof fetch,
): Promise<T> {
  const response = await fetcher(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !body.ok) {
    throw new ConversationRequestError(
      body.ok ? "conversation_request_failed" : body.error.code,
      body.ok ? "Conversation request failed." : body.error.message,
    );
  }

  return body.data;
}
