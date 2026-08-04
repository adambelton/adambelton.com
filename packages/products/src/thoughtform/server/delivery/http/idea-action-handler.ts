import type { ConversationStore } from "packages/products/src/thoughtform/server/capabilities/conversation";
import { parseIdeaActionRequest } from "packages/products/src/thoughtform/server/delivery/http/idea-action-request";
import { changeIdeaInWorkspace } from "packages/products/src/thoughtform/server/application/workspace";
import {
  CONVERSATION_ERROR_CODES,
  IDEA_ACTION_RESULT_STATUSES,
  IDEA_MAP_ERROR_CODES,
} from "packages/products/src/thoughtform/shared";
import { failure, success } from "packages/shared/src";

export interface HandleIdeaActionRequestInput {
  request: Request;
  conversationId: string;
  ideaId: string;
  conversations: ConversationStore;
}

export async function handleIdeaActionRequest(
  input: HandleIdeaActionRequestInput,
): Promise<Response> {
  const request = await parseIdeaActionRequest(input.request);
  if (!request) {
    return json(
      failure(IDEA_MAP_ERROR_CODES.invalidAction, "The idea action is invalid."),
      400,
    );
  }
  const result = await changeIdeaInWorkspace({
    conversationId: input.conversationId,
    ideaId: input.ideaId,
    request,
    conversations: input.conversations,
  });
  if (result.status === CONVERSATION_ERROR_CODES.notFound) {
    return json(failure(result.status, "The conversation was not found."), 404);
  }
  if (result.status === IDEA_MAP_ERROR_CODES.conflict) {
    return result.ideaMap
      ? json(
          success({
            status: IDEA_ACTION_RESULT_STATUSES.conflict,
            ideaMap: result.ideaMap,
          }),
          409,
        )
      : json(failure(result.status, "The conversation was not found."), 404);
  }
  if (result.status === IDEA_MAP_ERROR_CODES.invalidAction) {
    return json(
      failure(result.status, "The idea action could not be applied."),
      400,
    );
  }
  return json(
    success({
      status: IDEA_ACTION_RESULT_STATUSES.changed,
      ideaMap: result.ideaMap,
    }),
    200,
  );
}

function json(value: unknown, status: number) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json; charset=UTF-8" },
  });
}
