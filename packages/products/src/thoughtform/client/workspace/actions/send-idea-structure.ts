import type {
  IdeaStructureCommandRequest,
  IdeaStructureCommandResult,
} from "packages/products/src/thoughtform/shared";
import type { ApiResponse } from "packages/shared/src";

export class IdeaStructureError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = "IdeaStructureError";
  }
}

export function sendTemporaryIdeaStructure(
  conversationId: string,
  request: IdeaStructureCommandRequest,
  fetcher: typeof fetch = fetch,
) {
  return sendIdeaStructure(
    `/api/products/thoughtform/conversation/${encodeURIComponent(conversationId)}/idea-structure`,
    request,
    fetcher,
  );
}

export function sendPersistentIdeaStructure(
  conversationId: string,
  request: IdeaStructureCommandRequest,
  fetcher: typeof fetch = fetch,
) {
  return sendIdeaStructure(
    `/api/products/thoughtform/conversations/${encodeURIComponent(conversationId)}/idea-structure`,
    request,
    fetcher,
  );
}

async function sendIdeaStructure(
  endpoint: string,
  request: IdeaStructureCommandRequest,
  fetcher: typeof fetch,
): Promise<IdeaStructureCommandResult> {
  const response = await fetcher(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  const body = await response.json() as ApiResponse<IdeaStructureCommandResult>;
  if (!body.ok) throw new IdeaStructureError(body.error.code, body.error.message);
  return body.data;
}
