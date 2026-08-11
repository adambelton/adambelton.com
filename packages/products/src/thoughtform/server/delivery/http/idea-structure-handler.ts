import type { ConversationStore } from "packages/products/src/thoughtform/server/capabilities/conversation";
import { changeIdeaStructureInWorkspace } from "packages/products/src/thoughtform/server/application/workspace";
import { parseIdeaStructureCommandRequest } from "packages/products/src/thoughtform/server/delivery/http/idea-structure-request";
import {
  CONVERSATION_ERROR_CODES,
  IDEA_ACTION_RESULT_STATUSES,
  IDEA_MAP_ERROR_CODES,
  WORKSPACE_PERSISTENCE_TYPES,
  type WorkspacePersistenceType,
} from "packages/products/src/thoughtform/shared";
import { failure, success } from "packages/shared/src";

export async function handleIdeaStructureRequest(input: {
  request: Request;
  conversationId: string;
  conversations: ConversationStore;
  persistenceType: WorkspacePersistenceType;
}): Promise<Response> {
  const request = await parseIdeaStructureCommandRequest(input.request);
  if (!request) return json(failure(IDEA_MAP_ERROR_CODES.invalidAction, "The structural change is invalid."), 400);
  const result = await changeIdeaStructureInWorkspace({
    conversationId: input.conversationId,
    request,
    conversations: input.conversations,
  });
  if (result.status === CONVERSATION_ERROR_CODES.notFound) {
    return input.persistenceType === WORKSPACE_PERSISTENCE_TYPES.temporary
      ? json(failure(CONVERSATION_ERROR_CODES.unavailable, "This temporary workspace is no longer available."), 409)
      : json(failure(result.status, "The conversation was not found."), 404);
  }
  if (result.status === IDEA_MAP_ERROR_CODES.conflict) {
    return result.ideaMap
      ? json(success({ status: IDEA_ACTION_RESULT_STATUSES.conflict, ideaMap: result.ideaMap }), 409)
      : json(failure(CONVERSATION_ERROR_CODES.unavailable, "The workspace is no longer available."), 409);
  }
  if (result.status === IDEA_MAP_ERROR_CODES.invalidAction) {
    return json(failure(result.status, "The structural change could not be applied."), 400);
  }
  return json(success({ status: IDEA_ACTION_RESULT_STATUSES.changed, ideaMap: result.ideaMap }), 200);
}

function json(value: unknown, status: number) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json; charset=UTF-8" },
  });
}
