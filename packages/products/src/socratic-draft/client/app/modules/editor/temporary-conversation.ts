import type { ApiResponse } from "packages/shared/src";
import type { TemporaryConversation } from "packages/products/src/socratic-draft/shared";

const temporaryConversationEndpoint =
  "/api/products/socratic-draft/temporary-conversation/current";

export async function loadTemporaryConversation(
  fetcher: typeof fetch = fetch,
): Promise<TemporaryConversation | null> {
  const response = await fetcher(temporaryConversationEndpoint);
  const body = (await response.json()) as ApiResponse<TemporaryConversation | null>;

  if (!response.ok || !body.ok) {
    throw new Error(
      body.ok
        ? "The temporary conversation could not be loaded."
        : body.error.message,
    );
  }

  return body.data;
}

export async function clearTemporaryConversation(
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher(temporaryConversationEndpoint, {
    method: "DELETE",
  });
  const body = (await response.json()) as ApiResponse<null>;

  if (!response.ok || !body.ok) {
    throw new Error(
      body.ok
        ? "The temporary conversation could not be cleared."
        : body.error.message,
    );
  }
}
