import {
  IDEA_DISPOSITIONS,
  IDEA_EXPLORATION_ASSESSMENTS,
  IDEA_IMPORTANCE_ASSESSMENTS,
  IDEA_STRUCTURE_OPERATION_TYPES,
  IDEA_STRUCTURE_CHANGE_SOURCES,
  POTENTIAL_CONFLICT_SCOPES,
  type AssistantIdeaAssessment,
  type Idea,
  type IdeaDisposition,
  type IdeaMap,
  type IdeaStructureChangeSource,
  type IdeaStructureRequest,
  type PotentialConflict,
} from "packages/products/src/thoughtform/shared";
import {
  cloneIdeaMap,
  IDEA_MAP_UPDATE_STATUSES,
  MAX_ACTIVE_IDEAS,
  MAX_RETAINED_IDEAS,
  type IdeaMapUpdateResult,
} from "packages/products/src/thoughtform/server/capabilities/idea-map/idea-map";

const MAX_SUPPRESSED_STRUCTURAL_OPERATIONS = 8;
export const MAX_SPLIT_RESULTS = 3;

export function applyIdeaStructure(input: {
  current: IdeaMap;
  request: IdeaStructureRequest;
  source: IdeaStructureChangeSource;
  createIdeaId?: () => string;
}): IdeaMapUpdateResult {
  if (input.request.expectedRevision !== input.current.revision) return invalid(input.current);
  const signature = structuralOperationSignature(input.request, input.current);
  if (input.current.suppressedStructuralOperationSignatures?.includes(signature)) {
    return unchanged(input.current);
  }
  return input.request.type === IDEA_STRUCTURE_OPERATION_TYPES.merge
    ? mergeIdeas({ ...input, request: input.request, signature })
    : splitIdea({ ...input, request: input.request, signature });
}

export function undoLatestIdeaStructure(input: {
  current: IdeaMap;
  expectedRevision: number;
}): IdeaMapUpdateResult {
  const change = input.current.structuralChange;
  if (!change || input.expectedRevision !== input.current.revision) return invalid(input.current);
  const resultIds = new Set(change.resultIdeaIds);
  if (change.resultIdeaIds.some((id) => !input.current.ideas.some((idea) => idea.id === id))) {
    return invalid(input.current);
  }
  const retainedIdeas = input.current.ideas.filter((idea) => !resultIds.has(idea.id));
  retainedIdeas.splice(change.insertionIndex, 0, ...change.previousIdeas.map(cloneIdea));
  const retainedConflicts = (input.current.potentialConflicts ?? []).filter(
    (conflict) => conflict.ideaIds.every((id) => !resultIds.has(id)),
  );
  return {
    status: IDEA_MAP_UPDATE_STATUSES.changed,
    ideaMap: {
      revision: input.current.revision + 1,
      ideas: retainedIdeas,
      potentialConflicts: [
        ...retainedConflicts.map(cloneConflict),
        ...change.previousPotentialConflicts.map(cloneConflict),
      ],
      suppressedStructuralOperationSignatures: [
        ...(input.current.suppressedStructuralOperationSignatures ?? []),
        change.signature,
      ].slice(-MAX_SUPPRESSED_STRUCTURAL_OPERATIONS),
    },
  };
}

function mergeIdeas(input: {
  current: IdeaMap;
  request: Extract<IdeaStructureRequest, {
    type: typeof IDEA_STRUCTURE_OPERATION_TYPES.merge;
  }>;
  source: IdeaStructureChangeSource;
  signature: string;
}): IdeaMapUpdateResult {
  const uniqueIds = [...new Set(input.request.ideaIds)];
  if (uniqueIds.length < 2 || uniqueIds.length !== input.request.ideaIds.length) {
    return invalid(input.current);
  }
  const selected = uniqueIds
    .map((id) => input.current.ideas.find((idea) => idea.id === id))
    .filter((idea): idea is Idea => Boolean(idea));
  if (
    selected.length !== uniqueIds.length ||
    (input.source === IDEA_STRUCTURE_CHANGE_SOURCES.assistant &&
      selected.some((idea) => idea.disposition === IDEA_DISPOSITIONS.dismissed)) ||
    !validText(input.request.result.title) ||
    !validText(input.request.result.synthesis) ||
    !validText(input.request.explanation)
  ) return invalid(input.current);

  const sourceIds = new Set(uniqueIds);
  const insertionIndex = Math.min(...selected.map((idea) => input.current.ideas.indexOf(idea)));
  const survivor = selected.reduce((oldest, idea) =>
    input.current.ideas.indexOf(idea) < input.current.ideas.indexOf(oldest) ? idea : oldest);
  const merged: Idea = {
    id: survivor.id,
    title: input.request.result.title.trim(),
    synthesis: input.request.result.synthesis.trim(),
    substance: uniqueStrings(selected.map((idea) => idea.substance)).join("\n\n"),
    unresolvedQuestions: uniqueStrings(selected.flatMap((idea) => idea.unresolvedQuestions)),
    assistantAssessment: cloneAssessment(input.request.result.assistantAssessment),
    userInterpretation: joinInterpretations(selected),
    disposition: leastActiveDisposition(selected.map((idea) => idea.disposition)),
  };
  const impactedConflicts = conflictsReferencing(input.current, sourceIds);
  const ideas = input.current.ideas.filter((idea) => !sourceIds.has(idea.id));
  ideas.splice(insertionIndex, 0, merged);
  return changedMap({
    current: input.current,
    ideas,
    conflicts: remapConflicts(input.current.potentialConflicts ?? [], sourceIds, [merged.id]),
    source: input.source,
    signature: input.signature,
    type: input.request.type,
    explanation: input.request.explanation,
    insertionIndex,
    previousIdeas: selected,
    previousPotentialConflicts: impactedConflicts,
    resultIdeaIds: [merged.id],
  });
}

function splitIdea(input: {
  current: IdeaMap;
  request: Extract<IdeaStructureRequest, {
    type: typeof IDEA_STRUCTURE_OPERATION_TYPES.split;
  }>;
  source: IdeaStructureChangeSource;
  signature: string;
  createIdeaId?: () => string;
}): IdeaMapUpdateResult {
  const original = input.current.ideas.find((idea) => idea.id === input.request.ideaId);
  if (
    !original ||
    (input.source === IDEA_STRUCTURE_CHANGE_SOURCES.assistant &&
      original.disposition === IDEA_DISPOSITIONS.dismissed) ||
    input.request.results.length < 2 || input.request.results.length > MAX_SPLIT_RESULTS ||
    input.current.ideas.length - 1 + input.request.results.length > MAX_RETAINED_IDEAS ||
    activeCountAfterSplit(input.current, original, input.request.results.length) > MAX_ACTIVE_IDEAS ||
    !validText(input.request.explanation) ||
    input.request.results.some((result) =>
      !validText(result.title) || !validText(result.synthesis) || !validText(result.substance)) ||
    normalize(input.request.results.map((result) => result.substance).join(" ")) !==
      normalize(original.substance) ||
    !sameStrings(
      input.request.results.flatMap((result) => result.unresolvedQuestions),
      original.unresolvedQuestions,
    )
  ) return invalid(input.current);

  const createIdeaId = input.createIdeaId ?? (() => globalThis.crypto.randomUUID());
  const insertionIndex = input.current.ideas.indexOf(original);
  const results = input.request.results.map((result, index): Idea => ({
    id: index === 0 ? original.id : createIdeaId(),
    title: result.title.trim(),
    synthesis: result.synthesis.trim(),
    substance: result.substance.trim(),
    unresolvedQuestions: result.unresolvedQuestions.map((question) => question.trim()),
    assistantAssessment: cloneAssessment(result.assistantAssessment),
    userInterpretation: index === 0 ? original.userInterpretation : null,
    disposition: original.disposition,
  }));
  if (new Set(results.map((idea) => idea.id)).size !== results.length) return invalid(input.current);
  const sourceIds = new Set([original.id]);
  const impactedConflicts = conflictsReferencing(input.current, sourceIds);
  const ideas = input.current.ideas.filter((idea) => idea.id !== original.id);
  ideas.splice(insertionIndex, 0, ...results);
  return changedMap({
    current: input.current,
    ideas,
    conflicts: remapConflicts(input.current.potentialConflicts ?? [], sourceIds, results.map((idea) => idea.id)),
    source: input.source,
    signature: input.signature,
    type: input.request.type,
    explanation: input.request.explanation,
    insertionIndex,
    previousIdeas: [original],
    previousPotentialConflicts: impactedConflicts,
    resultIdeaIds: results.map((idea) => idea.id),
  });
}

function changedMap(input: {
  current: IdeaMap;
  ideas: Idea[];
  conflicts: PotentialConflict[];
  source: IdeaStructureChangeSource;
  signature: string;
  type: IdeaStructureRequest["type"];
  explanation: string;
  insertionIndex: number;
  previousIdeas: Idea[];
  previousPotentialConflicts: PotentialConflict[];
  resultIdeaIds: string[];
}): IdeaMapUpdateResult {
  return {
    status: IDEA_MAP_UPDATE_STATUSES.changed,
    ideaMap: {
      revision: input.current.revision + 1,
      ideas: input.ideas.map(cloneIdea),
      potentialConflicts: input.conflicts.map(cloneConflict),
      structuralChange: {
        type: input.type,
        source: input.source,
        explanation: input.explanation.trim(),
        signature: input.signature,
        insertionIndex: input.insertionIndex,
        previousIdeas: input.previousIdeas.map(cloneIdea),
        previousPotentialConflicts: input.previousPotentialConflicts.map(cloneConflict),
        resultIdeaIds: [...input.resultIdeaIds],
      },
      suppressedStructuralOperationSignatures:
        input.current.suppressedStructuralOperationSignatures ?
          [...input.current.suppressedStructuralOperationSignatures] : undefined,
    },
  };
}

export function structuralOperationSignature(request: IdeaStructureRequest, current: IdeaMap) {
  const ids = request.type === IDEA_STRUCTURE_OPERATION_TYPES.merge
    ? [...request.ideaIds].sort()
    : [request.ideaId];
  const sources = ids.map((id) => {
    const idea = current.ideas.find((candidate) => candidate.id === id);
    return idea ? [idea.id, idea.synthesis, idea.substance, idea.userInterpretation] : [id];
  });
  return JSON.stringify([request.type, sources]);
}

function remapConflicts(conflicts: PotentialConflict[], sourceIds: Set<string>, resultIds: string[]) {
  return conflicts.map((conflict) => {
    if (!conflict.ideaIds.some((id) => sourceIds.has(id))) return cloneConflict(conflict);
    const ideaIds = uniqueStrings(conflict.ideaIds.flatMap((id) => sourceIds.has(id) ? resultIds : [id]));
    return {
      ...cloneConflict(conflict),
      ideaIds,
      scope: conflict.scope === POTENTIAL_CONFLICT_SCOPES.savedEdit
        ? conflict.scope
        : ideaIds.length === 1
          ? POTENTIAL_CONFLICT_SCOPES.withinIdea
          : POTENTIAL_CONFLICT_SCOPES.betweenIdeas,
    };
  });
}

function conflictsReferencing(current: IdeaMap, ids: Set<string>) {
  return (current.potentialConflicts ?? [])
    .filter((conflict) => conflict.ideaIds.some((id) => ids.has(id)))
    .map(cloneConflict);
}

function leastActiveDisposition(dispositions: IdeaDisposition[]) {
  const order: IdeaDisposition[] = [
    IDEA_DISPOSITIONS.dismissed,
    IDEA_DISPOSITIONS.parked,
    IDEA_DISPOSITIONS.satisfied,
    IDEA_DISPOSITIONS.active,
    IDEA_DISPOSITIONS.focused,
  ];
  return order.find((disposition) => dispositions.includes(disposition)) ?? IDEA_DISPOSITIONS.parked;
}

function activeCountAfterSplit(current: IdeaMap, original: Idea, resultCount: number) {
  const active = new Set<IdeaDisposition>([IDEA_DISPOSITIONS.active, IDEA_DISPOSITIONS.focused]);
  const currentCount = current.ideas.filter((idea) => active.has(idea.disposition)).length;
  return active.has(original.disposition) ? currentCount - 1 + resultCount : currentCount;
}

function joinInterpretations(ideas: Idea[]) {
  const interpretations = uniqueStrings(
    ideas.map((idea) => idea.userInterpretation).filter((value): value is string => Boolean(value)),
  );
  return interpretations.length > 0 ? interpretations.join("\n\n") : null;
}

function cloneIdea(idea: Idea): Idea {
  return {
    ...idea,
    unresolvedQuestions: [...idea.unresolvedQuestions],
    assistantAssessment: cloneAssessment(idea.assistantAssessment),
  };
}

function cloneAssessment(assessment: AssistantIdeaAssessment): AssistantIdeaAssessment {
  return {
    exploration: Object.values(IDEA_EXPLORATION_ASSESSMENTS).includes(assessment.exploration)
      ? assessment.exploration : IDEA_EXPLORATION_ASSESSMENTS.emerging,
    importance: Object.values(IDEA_IMPORTANCE_ASSESSMENTS).includes(assessment.importance)
      ? assessment.importance : IDEA_IMPORTANCE_ASSESSMENTS.background,
  };
}

function cloneConflict(conflict: PotentialConflict): PotentialConflict {
  return {
    ...conflict,
    ideaIds: [...conflict.ideaIds],
    draftChange: conflict.draftChange ? { ...conflict.draftChange } : null,
  };
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function sameStrings(left: string[], right: string[]) {
  return JSON.stringify([...left].map(normalize).sort()) === JSON.stringify([...right].map(normalize).sort());
}

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function validText(value: string) {
  return typeof value === "string" && value.trim().length > 0;
}

function invalid(current: IdeaMap): IdeaMapUpdateResult {
  return { status: IDEA_MAP_UPDATE_STATUSES.invalid, ideaMap: cloneIdeaMap(current) };
}

function unchanged(current: IdeaMap): IdeaMapUpdateResult {
  return { status: IDEA_MAP_UPDATE_STATUSES.unchanged, ideaMap: cloneIdeaMap(current) };
}
