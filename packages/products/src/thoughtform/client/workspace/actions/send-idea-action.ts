import type {
  IdeaActionRequest,
  IdeaActionResult,
} from "packages/products/src/thoughtform/shared";
import type { ApiResponse } from "packages/shared/src";

export class IdeaActionError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = "IdeaActionError";
  }
}

export async function sendTemporaryIdeaAction(
  conversationId: string,
  ideaId: string,
  request: IdeaActionRequest,
  fetcher: typeof fetch = fetch,
) {
  return sendIdeaAction(
    `/api/products/thoughtform/conversation/${encodeURIComponent(conversationId)}/ideas/${encodeURIComponent(ideaId)}`,
    request,
    fetcher,
  );
}

export async function sendPersistentIdeaAction(
  conversationId: string,
  ideaId: string,
  request: IdeaActionRequest,
  fetcher: typeof fetch = fetch,
) {
  return sendIdeaAction(
    `/api/products/thoughtform/conversations/${encodeURIComponent(conversationId)}/ideas/${encodeURIComponent(ideaId)}`,
    request,
    fetcher,
  );
}

async function sendIdeaAction(
  endpoint: string,
  request: IdeaActionRequest,
  fetcher: typeof fetch,
): Promise<IdeaActionResult> {
  const response = await fetcher(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  const body = (await response.json()) as ApiResponse<IdeaActionResult>;
  if (!body.ok) {
    throw new IdeaActionError(
      body.error.code,
      body.error.message,
    );
  }
  return body.data;
}
