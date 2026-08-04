import type {
  Conversation,
  ConversationSummary,
} from "packages/products/src/thoughtform/shared";
import type { ApiResponse } from "packages/shared/src";

const conversationsEndpoint = "/api/products/thoughtform/conversations";

export function loadConversations(fetcher: typeof fetch = fetch) {
  return get<ConversationSummary[]>(conversationsEndpoint, fetcher);
}

export function loadConversation(
  conversationId: string,
  fetcher: typeof fetch = fetch,
) {
  return get<Conversation>(
    `${conversationsEndpoint}/${encodeURIComponent(conversationId)}`,
    fetcher,
  );
}

async function get<T>(url: string, fetcher: typeof fetch): Promise<T> {
  const response = await fetcher(url);
  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !body.ok) {
    throw new Error(
      body.ok ? "Conversation request failed." : body.error.message,
    );
  }

  return body.data;
}
