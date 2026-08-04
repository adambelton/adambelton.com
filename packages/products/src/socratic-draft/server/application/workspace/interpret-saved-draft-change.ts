import {
  CONVERSATION_TURN_RETENTION_STATUSES,
  type ConversationStore,
} from "packages/products/src/socratic-draft/server/capabilities/conversation";
import {
  classifyObviousDraftMaintenance,
  type DraftChangeInterpretationModel,
} from "packages/products/src/socratic-draft/server/capabilities/drafting";
import {
  addPotentialConflicts,
  IDEA_MAP_UPDATE_STATUSES,
} from "packages/products/src/socratic-draft/server/capabilities/idea-map";
import {
  ACTIVITIES,
  ASSISTANT_MOVES,
  CONVERSATION_MESSAGE_ROLES,
  DRAFT_CHANGE_INTERPRETATION_TYPES,
  type DraftChange,
  type DraftOperationInterpretation,
  type PotentialConflict,
} from "packages/products/src/socratic-draft/shared";

export async function interpretSavedDraftChange(input: {
  conversationId: string;
  change: DraftChange;
  model: DraftChangeInterpretationModel;
  conversations: ConversationStore;
  createId?: () => string;
}): Promise<DraftOperationInterpretation> {
  if (classifyObviousDraftMaintenance(input.change)) {
    return { status: "not_needed" };
  }
  const workspace = await input.conversations.getConversationWorkspace(input.conversationId);
  if (!workspace) return { status: "failed", failureStage: "workspace" };

  let failureStage: "generation" | "interpretation" | "retention" = "generation";
  try {
    const interpreted = await input.model.interpret({
      change: input.change,
      currentIdeaMap: workspace.ideaMap,
      previousMessages: workspace.messages,
    });
    if (interpreted.type === DRAFT_CHANGE_INTERPRETATION_TYPES.textualMaintenance) {
      return { status: "not_needed" };
    }
    failureStage = "interpretation";
    const createId = input.createId ?? (() => globalThis.crypto.randomUUID());
    const conflicts: PotentialConflict[] = interpreted.potentialConflicts.map((conflict) => ({
      ...conflict,
      id: createId(),
      draftChange: conflict.scope === "saved_edit"
        ? { fromRevision: input.change.fromRevision, toRevision: input.change.toRevision }
        : null,
    }));
    let ideaMap = workspace.ideaMap;
    for (const conflict of conflicts) {
      const updatedMap = addPotentialConflicts({ current: ideaMap, conflicts: [conflict] });
      if (updatedMap.status !== IDEA_MAP_UPDATE_STATUSES.invalid) {
        ideaMap = updatedMap.ideaMap;
      }
    }
    const assistantMessage = {
      role: CONVERSATION_MESSAGE_ROLES.assistant,
      content: interpreted.assistantMessage.trim(),
    } as const;
    if (!assistantMessage.content) return { status: "failed", failureStage };
    failureStage = "retention";
    const retained = await input.conversations.appendAssistantMessage({
      conversationId: input.conversationId,
      operationId: `saved-edit-${input.change.toRevision}`,
      assistantMessage,
      expectedIdeaMapRevision: workspace.ideaMap.revision,
      ideaMap,
    });
    if (retained.status !== CONVERSATION_TURN_RETENTION_STATUSES.retained) {
      return { status: "failed", failureStage };
    }
    return {
      status: "responded",
      response: {
        conversationId: input.conversationId,
        message: assistantMessage,
        activity: ACTIVITIES.discovery,
        move: ASSISTANT_MOVES.clarify,
        assistantReadiness: [],
        userIntention: null,
        ideaMap,
      },
    };
  } catch {
    return { status: "failed", failureStage };
  }
}
