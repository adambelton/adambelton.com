import {
  CONVERSATION_TURN_RETENTION_STATUSES,
  type ConversationStore,
} from "packages/products/src/thoughtform/server/capabilities/conversation";
import {
  applyIdeaStructure,
  IDEA_MAP_UPDATE_STATUSES,
  undoLatestIdeaStructure,
} from "packages/products/src/thoughtform/server/capabilities/idea-map";
import {
  CONVERSATION_ERROR_CODES,
  IDEA_ACTION_RESULT_STATUSES,
  IDEA_MAP_ERROR_CODES,
  IDEA_STRUCTURE_CHANGE_SOURCES,
  IDEA_STRUCTURE_COMMAND_TYPES,
  type IdeaMap,
  type IdeaStructureCommandRequest,
} from "packages/products/src/thoughtform/shared";
import {
  WORKSPACE_EVENT_TYPES,
  type IdeaMapChangedEvent,
} from "packages/products/src/thoughtform/server/application/workspace/workspace-events";

export type ChangeIdeaStructureInWorkspaceResult =
  | { status: typeof IDEA_ACTION_RESULT_STATUSES.changed; ideaMap: IdeaMap; events: IdeaMapChangedEvent[] }
  | { status: typeof CONVERSATION_ERROR_CODES.notFound }
  | { status: typeof IDEA_MAP_ERROR_CODES.conflict; ideaMap: IdeaMap | null }
  | { status: typeof IDEA_MAP_ERROR_CODES.invalidAction };

export async function changeIdeaStructureInWorkspace(input: {
  conversationId: string;
  request: IdeaStructureCommandRequest;
  conversations: ConversationStore;
}): Promise<ChangeIdeaStructureInWorkspaceResult> {
  const workspace = await input.conversations.getConversationWorkspace(input.conversationId);
  if (!workspace) return { status: CONVERSATION_ERROR_CODES.notFound };
  if (workspace.ideaMap.revision !== input.request.expectedRevision) {
    return { status: IDEA_MAP_ERROR_CODES.conflict, ideaMap: workspace.ideaMap };
  }
  const result = input.request.type === IDEA_STRUCTURE_COMMAND_TYPES.undo
    ? undoLatestIdeaStructure({
        current: workspace.ideaMap,
        expectedRevision: input.request.expectedRevision,
      })
    : applyIdeaStructure({
        current: workspace.ideaMap,
        request: input.request,
        source: IDEA_STRUCTURE_CHANGE_SOURCES.user,
      });
  if (result.status === IDEA_MAP_UPDATE_STATUSES.invalid) {
    return { status: IDEA_MAP_ERROR_CODES.invalidAction };
  }
  if (result.status === IDEA_MAP_UPDATE_STATUSES.unchanged) {
    return { status: IDEA_ACTION_RESULT_STATUSES.changed, ideaMap: result.ideaMap, events: [] };
  }
  const retained = await input.conversations.replaceIdeaMap({
    conversationId: input.conversationId,
    operationId: globalThis.crypto.randomUUID(),
    expectedRevision: input.request.expectedRevision,
    ideaMap: result.ideaMap,
  });
  if (retained.status === CONVERSATION_TURN_RETENTION_STATUSES.conflict) {
    const current = await input.conversations.getConversationWorkspace(input.conversationId);
    return { status: IDEA_MAP_ERROR_CODES.conflict, ideaMap: current?.ideaMap ?? null };
  }
  if (retained.status !== CONVERSATION_TURN_RETENTION_STATUSES.retained) {
    return { status: CONVERSATION_ERROR_CODES.notFound };
  }
  return {
    status: IDEA_ACTION_RESULT_STATUSES.changed,
    ideaMap: result.ideaMap,
    events: [{
      type: WORKSPACE_EVENT_TYPES.ideaMapChanged,
      conversationId: input.conversationId,
      revision: result.ideaMap.revision,
    }],
  };
}
