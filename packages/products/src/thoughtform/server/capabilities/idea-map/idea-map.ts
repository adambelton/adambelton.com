import {
  EMPTY_IDEA_MAP,
  IDEA_ACTION_TYPES,
  IDEA_DISPOSITIONS,
  IDEA_EXPLORATION_ASSESSMENTS,
  IDEA_IMPORTANCE_ASSESSMENTS,
  POTENTIAL_CONFLICT_RESOLUTION_TYPES,
  POTENTIAL_CONFLICT_SCOPES,
  type Idea,
  type IdeaActionRequest,
  type IdeaDisposition,
  type IdeaMap,
  type PotentialConflict,
  type PotentialConflictResolutionRequest,
} from "packages/products/src/thoughtform/shared";

export const MAX_RETAINED_IDEAS = 12;
export const MAX_ACTIVE_IDEAS = 6;

const ACTIVE_IDEA_DISPOSITIONS = new Set<IdeaDisposition>([
  IDEA_DISPOSITIONS.active,
  IDEA_DISPOSITIONS.focused,
]);

import type {
  ProposedIdea,
  ProposedIdeaAction,
} from "packages/products/src/thoughtform/server/capabilities/idea-map/idea-map-model-output";

export const IDEA_MAP_UPDATE_STATUSES = {
  changed: "changed",
  invalid: "invalid",
  unchanged: "unchanged",
} as const;

export type IdeaMapUpdateResult =
  | { status: typeof IDEA_MAP_UPDATE_STATUSES.changed; ideaMap: IdeaMap }
  | { status: typeof IDEA_MAP_UPDATE_STATUSES.unchanged; ideaMap: IdeaMap }
  | { status: typeof IDEA_MAP_UPDATE_STATUSES.invalid; ideaMap: IdeaMap };

export function addPotentialConflicts(input: {
  current: IdeaMap;
  conflicts: PotentialConflict[];
}): IdeaMapUpdateResult {
  const currentIds = new Set(input.current.ideas.map((idea) => idea.id));
  const existing = input.current.potentialConflicts ?? [];
  const knownIds = new Set(existing.map((conflict) => conflict.id));
  const additions: PotentialConflict[] = [];
  for (const conflict of input.conflicts) {
    if (
      knownIds.has(conflict.id) || !conflict.summary.trim() ||
      !conflict.explanation.trim() ||
      conflict.ideaIds.some((ideaId) => !currentIds.has(ideaId)) ||
      !isValidConflictReferences(conflict)
    ) {
      return { status: IDEA_MAP_UPDATE_STATUSES.invalid, ideaMap: cloneIdeaMap(input.current) };
    }
    knownIds.add(conflict.id);
    additions.push(clonePotentialConflict(conflict));
  }
  if (additions.length === 0) {
    return { status: IDEA_MAP_UPDATE_STATUSES.unchanged, ideaMap: cloneIdeaMap(input.current) };
  }
  return {
    status: IDEA_MAP_UPDATE_STATUSES.changed,
    ideaMap: {
      ...cloneIdeaMap(input.current),
      revision: input.current.revision + 1,
      potentialConflicts: [...existing.map(clonePotentialConflict), ...additions],
    },
  };
}

export function resolvePotentialConflict(input: {
  current: IdeaMap;
  conflictId: string;
  request: PotentialConflictResolutionRequest;
}): IdeaMapUpdateResult {
  const conflicts = input.current.potentialConflicts ?? [];
  const conflict = conflicts.find((candidate) => candidate.id === input.conflictId);
  if (!conflict || input.request.expectedRevision !== input.current.revision) {
    return { status: IDEA_MAP_UPDATE_STATUSES.invalid, ideaMap: cloneIdeaMap(input.current) };
  }
  const meaning = input.request.userEstablishedMeaning?.trim();
  if (input.request.resolution !== POTENTIAL_CONFLICT_RESOLUTION_TYPES.dismiss && !meaning) {
    return { status: IDEA_MAP_UPDATE_STATUSES.invalid, ideaMap: cloneIdeaMap(input.current) };
  }
  const ideas = input.current.ideas.map((idea) => ({
    ...idea,
    unresolvedQuestions: [...idea.unresolvedQuestions],
    assistantAssessment: { ...idea.assistantAssessment },
  }));
  if (meaning) {
    const target = ideas.find((idea) => conflict.ideaIds.includes(idea.id));
    if (!target) {
      return { status: IDEA_MAP_UPDATE_STATUSES.invalid, ideaMap: cloneIdeaMap(input.current) };
    }
    target.substance = appendEstablishedMeaning(target.substance, meaning);
  }
  return {
    status: IDEA_MAP_UPDATE_STATUSES.changed,
    ideaMap: {
      revision: input.current.revision + 1,
      ideas,
      potentialConflicts: conflicts
        .filter((candidate) => candidate.id !== input.conflictId)
        .map(clonePotentialConflict),
    },
  };
}

export function removeResolvedPotentialConflicts(input: {
  current: IdeaMap;
  conflictIds: string[];
}): IdeaMapUpdateResult {
  if (input.conflictIds.length === 0) {
    return { status: IDEA_MAP_UPDATE_STATUSES.unchanged, ideaMap: cloneIdeaMap(input.current) };
  }
  const ids = new Set(input.conflictIds);
  const conflicts = input.current.potentialConflicts ?? [];
  if (ids.size !== input.conflictIds.length || input.conflictIds.some((id) => !conflicts.some((conflict) => conflict.id === id))) {
    return { status: IDEA_MAP_UPDATE_STATUSES.invalid, ideaMap: cloneIdeaMap(input.current) };
  }
  return {
    status: IDEA_MAP_UPDATE_STATUSES.changed,
    ideaMap: {
      ...cloneIdeaMap(input.current),
      revision: input.current.revision + 1,
      potentialConflicts: conflicts.filter((conflict) => !ids.has(conflict.id)).map(clonePotentialConflict),
    },
  };
}

export function applyProposedIdeas(input: {
  current: IdeaMap;
  proposedIdeas: ProposedIdea[] | null;
  createIdeaId?: () => string;
}): IdeaMapUpdateResult {
  if (input.proposedIdeas === null || input.proposedIdeas.length === 0) {
    return { status: IDEA_MAP_UPDATE_STATUSES.unchanged, ideaMap: cloneIdeaMap(input.current) };
  }

  const createIdeaId = input.createIdeaId ?? (() => globalThis.crypto.randomUUID());
  const currentById = new Map(input.current.ideas.map((idea) => [idea.id, idea]));
  const proposedIds = input.proposedIdeas
    .map((idea) => idea.id)
    .filter((id): id is string => id !== null);

  if (
    new Set(proposedIds).size !== proposedIds.length ||
    proposedIds.some((id) => !currentById.has(id))
  ) {
    return { status: IDEA_MAP_UPDATE_STATUSES.invalid, ideaMap: cloneIdeaMap(input.current) };
  }

  const nextIdeas = input.current.ideas.map((idea) => ({ ...idea }));

  for (const proposed of input.proposedIdeas) {
    if (proposed.id) {
      const index = nextIdeas.findIndex((idea) => idea.id === proposed.id);
      const current = nextIdeas[index];
      if (!current) {
        return { status: IDEA_MAP_UPDATE_STATUSES.invalid, ideaMap: cloneIdeaMap(input.current) };
      }
      nextIdeas[index] = {
        ...proposed,
        id: current.id,
        userInterpretation: current.userInterpretation,
        disposition: current.disposition,
        unresolvedQuestions: [...proposed.unresolvedQuestions],
        assistantAssessment: { ...proposed.assistantAssessment },
      };
      continue;
    }

    if (
      nextIdeas.length >= MAX_RETAINED_IDEAS ||
      countActiveIdeas(nextIdeas) >= MAX_ACTIVE_IDEAS
    ) {
      continue;
    }

    nextIdeas.push({
      ...proposed,
      id: createIdeaId(),
      disposition: IDEA_DISPOSITIONS.active,
      userInterpretation: null,
      unresolvedQuestions: [...proposed.unresolvedQuestions],
      assistantAssessment: { ...proposed.assistantAssessment },
    });
  }

  if (JSON.stringify(nextIdeas) === JSON.stringify(input.current.ideas)) {
    return { status: IDEA_MAP_UPDATE_STATUSES.unchanged, ideaMap: cloneIdeaMap(input.current) };
  }

  return {
    status: IDEA_MAP_UPDATE_STATUSES.changed,
    ideaMap: {
      revision: input.current.revision + 1,
      ideas: nextIdeas,
      potentialConflicts: input.current.potentialConflicts?.map(
        clonePotentialConflict,
      ),
    },
  };
}

export function applyIdeaAction(input: {
  current: IdeaMap;
  ideaId: string;
  request: IdeaActionRequest;
}): IdeaMapUpdateResult {
  const ideaIndex = input.current.ideas.findIndex(
    (idea) => idea.id === input.ideaId,
  );

  if (ideaIndex === -1) {
    return { status: IDEA_MAP_UPDATE_STATUSES.invalid, ideaMap: cloneIdeaMap(input.current) };
  }

  const ideas = input.current.ideas.map((idea) => ({ ...idea }));
  const idea = ideas[ideaIndex];
  if (!idea) {
    return { status: IDEA_MAP_UPDATE_STATUSES.invalid, ideaMap: cloneIdeaMap(input.current) };
  }

  switch (input.request.action) {
    case IDEA_ACTION_TYPES.correct: {
      const correction = input.request.userInterpretation?.trim();
      if (!correction) {
        return { status: IDEA_MAP_UPDATE_STATUSES.invalid, ideaMap: cloneIdeaMap(input.current) };
      }
      idea.userInterpretation = correction;
      break;
    }
    case IDEA_ACTION_TYPES.focus:
      for (const candidate of ideas) {
        if (candidate.disposition === IDEA_DISPOSITIONS.focused) {
          candidate.disposition = IDEA_DISPOSITIONS.active;
        }
      }
      if (
        !ACTIVE_IDEA_DISPOSITIONS.has(idea.disposition) &&
        countActiveIdeas(ideas) >= MAX_ACTIVE_IDEAS
      ) {
        return { status: IDEA_MAP_UPDATE_STATUSES.invalid, ideaMap: cloneIdeaMap(input.current) };
      }
      idea.disposition = IDEA_DISPOSITIONS.focused;
      break;
    case IDEA_ACTION_TYPES.satisfy:
      idea.disposition = IDEA_DISPOSITIONS.satisfied;
      break;
    case IDEA_ACTION_TYPES.park:
      idea.disposition = IDEA_DISPOSITIONS.parked;
      break;
    case IDEA_ACTION_TYPES.dismiss:
      idea.disposition = IDEA_DISPOSITIONS.dismissed;
      break;
    case IDEA_ACTION_TYPES.reopen:
      if (
        !ACTIVE_IDEA_DISPOSITIONS.has(idea.disposition) &&
        countActiveIdeas(ideas) >= MAX_ACTIVE_IDEAS
      ) {
        return { status: IDEA_MAP_UPDATE_STATUSES.invalid, ideaMap: cloneIdeaMap(input.current) };
      }
      idea.disposition = IDEA_DISPOSITIONS.active;
      break;
  }

  if (JSON.stringify(ideas) === JSON.stringify(input.current.ideas)) {
    return { status: IDEA_MAP_UPDATE_STATUSES.unchanged, ideaMap: cloneIdeaMap(input.current) };
  }

  return {
    status: IDEA_MAP_UPDATE_STATUSES.changed,
    ideaMap: {
      revision: input.current.revision + 1,
      ideas,
      potentialConflicts: input.current.potentialConflicts?.map(
        clonePotentialConflict,
      ),
    },
  };
}

export function cloneIdeaMap(ideaMap: IdeaMap = EMPTY_IDEA_MAP): IdeaMap {
  return {
    revision: ideaMap.revision,
    ideas: ideaMap.ideas.map((idea) => ({
      ...idea,
      assistantAssessment: { ...idea.assistantAssessment },
      unresolvedQuestions: [...idea.unresolvedQuestions],
    })),
    ...(ideaMap.potentialConflicts
      ? { potentialConflicts: ideaMap.potentialConflicts.map(clonePotentialConflict) }
      : {}),
  };
}

function isValidConflictReferences(conflict: PotentialConflict) {
  if (conflict.scope === POTENTIAL_CONFLICT_SCOPES.withinIdea) {
    return conflict.ideaIds.length === 1;
  }
  if (conflict.scope === POTENTIAL_CONFLICT_SCOPES.betweenIdeas) {
    return new Set(conflict.ideaIds).size >= 2;
  }
  return conflict.scope === POTENTIAL_CONFLICT_SCOPES.savedEdit &&
    conflict.ideaIds.length >= 1 && conflict.draftChange !== null;
}

function clonePotentialConflict(conflict: PotentialConflict): PotentialConflict {
  return {
    ...conflict,
    ideaIds: [...conflict.ideaIds],
    draftChange: conflict.draftChange ? { ...conflict.draftChange } : null,
  };
}

function appendEstablishedMeaning(substance: string, meaning: string) {
  if (substance.toLocaleLowerCase().includes(meaning.toLocaleLowerCase())) return substance;
  return `${substance.trim()}\n\n${meaning}`;
}

function countActiveIdeas(ideas: Idea[]) {
  return ideas.filter((idea) => ACTIVE_IDEA_DISPOSITIONS.has(idea.disposition)).length;
}
