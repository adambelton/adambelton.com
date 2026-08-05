import type {
  ConversationRequest,
  ConversationResponse,
  TemporaryConversationResponse,
} from "packages/products/src/thoughtform/shared";
import type { ApiResponse } from "packages/shared/src";

const conversationEndpoint = "/api/products/thoughtform/conversation/respond";

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
  return sendRequest(conversationEndpoint, request, fetcher, false);
}

export async function sendPersistentConversationMessage(
  request: ConversationRequest & { conversationId: string },
  fetcher: typeof fetch = fetch,
): Promise<ConversationResponse> {
  return sendRequest(
    `/api/products/thoughtform/conversations/${encodeURIComponent(request.conversationId)}/respond`,
    request,
    fetcher,
    true,
  );
}

async function sendRequest<T extends ConversationResponse>(
  endpoint: string,
  request: ConversationRequest,
  fetcher: typeof fetch,
  observeOwner: boolean,
): Promise<T> {
  const observationId = observeOwner ? globalThis.crypto.randomUUID() : null;
  const startedAt = globalThis.performance.now();
  const response = await fetcher(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(observationId ? { "x-thoughtform-observation-id": observationId } : {}),
    },
    body: JSON.stringify(request),
  });

  const body = (await response.json()) as ApiResponse<T>;
  if (observationId) {
    const durationMs = Math.round(globalThis.performance.now() - startedAt);
    try {
      void Promise.resolve(
        fetcher("/api/products/thoughtform/owner-observations/client", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            observationId,
            operation: "conversation_response",
            durationMs,
            succeeded: response.ok && body.ok,
          }),
          keepalive: true,
        }),
      ).catch(() => undefined);
    } catch {
      // Observation delivery is best-effort and must not affect the conversation.
    }
  }

  if (!response.ok || !body.ok) {
    throw new ConversationRequestError(
      body.ok ? "conversation_request_failed" : body.error.code,
      body.ok ? "Conversation request failed." : body.error.message,
    );
  }

  return body.data;
}
