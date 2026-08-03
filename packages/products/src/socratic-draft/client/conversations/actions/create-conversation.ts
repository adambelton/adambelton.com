import type { Conversation } from "packages/products/src/socratic-draft/shared";
import type { ApiResponse } from "packages/shared/src";

const conversationsEndpoint =
  "/api/products/socratic-draft/conversations";

export async function createPersistentConversation(
  fetcher: typeof fetch = fetch,
): Promise<Conversation> {
  const response = await fetcher(conversationsEndpoint, { method: "POST" });
  const body = (await response.json()) as ApiResponse<Conversation>;

  if (!response.ok || !body.ok) {
    throw new Error(
      body.ok ? "The conversation could not be created." : body.error.message,
    );
  }

  return body.data;
}
