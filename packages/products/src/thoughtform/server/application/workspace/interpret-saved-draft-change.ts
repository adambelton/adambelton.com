import {
  CONVERSATION_TURN_RETENTION_STATUSES,
  type ConversationStore,
} from "packages/products/src/thoughtform/server/capabilities/conversation";
import {
  classifyObviousDraftMaintenance,
  requireDraftOperationInputWithinLimit,
  type DraftChangeInterpretationModel,
} from "packages/products/src/thoughtform/server/capabilities/drafting";
import {
  addPotentialConflicts,
  IDEA_MAP_UPDATE_STATUSES,
} from "packages/products/src/thoughtform/server/capabilities/idea-map";
import {
  ACTIVITIES,
  ASSISTANT_MOVES,
  CONVERSATION_MESSAGE_ROLES,
  DRAFT_CHANGE_INTERPRETATION_TYPES,
  DRAFT_OPERATION_INTERPRETATION_FAILURE_STAGES,
  DRAFT_OPERATION_INTERPRETATION_STATUSES,
  POTENTIAL_CONFLICT_SCOPES,
  type DraftChange,
  type DraftOperationInterpretationFailureStage,
  type DraftOperationInterpretation,
  type PotentialConflict,
} from "packages/products/src/thoughtform/shared";
import {
  HOSTED_ATTEMPT_ACTIONS,
  HOSTED_ATTEMPT_OUTCOMES,
  noOpHostedAttemptLifecycle,
  type HostedAttemptLifecycle,
} from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";

export async function interpretSavedDraftChange(input: {
  conversationId: string;
  change: DraftChange;
  model: DraftChangeInterpretationModel;
  conversations: ConversationStore;
  hostedAttempts?: HostedAttemptLifecycle;
  operationId?: string;
  createId?: () => string;
}): Promise<DraftOperationInterpretation> {
  if (classifyObviousDraftMaintenance(input.change)) {
    return { status: DRAFT_OPERATION_INTERPRETATION_STATUSES.notNeeded };
  }
  const workspace = await input.conversations.getConversationWorkspace(input.conversationId);
  if (!workspace) {
    return {
      status: DRAFT_OPERATION_INTERPRETATION_STATUSES.failed,
      failureStage: DRAFT_OPERATION_INTERPRETATION_FAILURE_STAGES.workspace,
    };
  }
  const modelInput = {
    change: input.change,
    currentIdeaMap: workspace.ideaMap,
    previousMessages: workspace.messages,
  };
  requireDraftOperationInputWithinLimit(modelInput);
  const attempt = await (input.hostedAttempts ?? noOpHostedAttemptLifecycle).admit({
    action: HOSTED_ATTEMPT_ACTIONS.savedChangeInterpretation,
    operationId: input.operationId ?? `saved-edit-${input.change.toRevision}`,
  });

  let failureStage: DraftOperationInterpretationFailureStage =
    DRAFT_OPERATION_INTERPRETATION_FAILURE_STAGES.generation;
  try {
    const interpreted = await attempt.run(() => input.model.interpret(modelInput));
    if (interpreted.type === DRAFT_CHANGE_INTERPRETATION_TYPES.textualMaintenance) {
      await attempt.complete(HOSTED_ATTEMPT_OUTCOMES.succeeded);
      return { status: DRAFT_OPERATION_INTERPRETATION_STATUSES.notNeeded };
    }
    failureStage = DRAFT_OPERATION_INTERPRETATION_FAILURE_STAGES.interpretation;
    const createId = input.createId ?? (() => globalThis.crypto.randomUUID());
    const conflicts: PotentialConflict[] = interpreted.potentialConflicts.map((conflict) => ({
      ...conflict,
      id: createId(),
      draftChange: conflict.scope === POTENTIAL_CONFLICT_SCOPES.savedEdit
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
    if (!assistantMessage.content) {
      await attempt.complete(HOSTED_ATTEMPT_OUTCOMES.providerFailed);
      return { status: DRAFT_OPERATION_INTERPRETATION_STATUSES.failed, failureStage };
    }
    failureStage = DRAFT_OPERATION_INTERPRETATION_FAILURE_STAGES.retention;
    const retained = await input.conversations.appendAssistantMessage({
      conversationId: input.conversationId,
      operationId: `saved-edit-${input.change.toRevision}`,
      assistantMessage,
      expectedMessageCount: workspace.messages.length,
      expectedIdeaMapRevision: workspace.ideaMap.revision,
      ideaMap,
    });
    if (retained.status !== CONVERSATION_TURN_RETENTION_STATUSES.retained) {
      await attempt.complete(HOSTED_ATTEMPT_OUTCOMES.persistenceFailed);
      return { status: DRAFT_OPERATION_INTERPRETATION_STATUSES.failed, failureStage };
    }
    await attempt.complete(HOSTED_ATTEMPT_OUTCOMES.succeeded);
    return {
      status: DRAFT_OPERATION_INTERPRETATION_STATUSES.responded,
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
    await attempt.complete(
      failureStage === DRAFT_OPERATION_INTERPRETATION_FAILURE_STAGES.generation
        ? HOSTED_ATTEMPT_OUTCOMES.providerFailed
        : HOSTED_ATTEMPT_OUTCOMES.persistenceFailed,
    );
    return { status: DRAFT_OPERATION_INTERPRETATION_STATUSES.failed, failureStage };
  }
}
