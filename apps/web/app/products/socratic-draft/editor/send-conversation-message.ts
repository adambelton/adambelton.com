import type {
  ConversationRequest,
  ConversationResponse,
} from "packages/products/src/socratic-draft/shared";
import type { ApiResponse } from "packages/shared/src";

const conversationEndpoint = "/api/products/socratic-draft/conversation/respond";

export async function sendConversationMessage(
  request: ConversationRequest,
  fetcher: typeof fetch = fetch,
): Promise<ConversationResponse> {
  const response = await fetcher(conversationEndpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const body = (await response.json()) as ApiResponse<ConversationResponse>;

  if (!response.ok || !body.ok) {
    throw new Error(
      body.ok ? "Conversation request failed." : body.error.message,
    );
  }

  return body.data;
}
