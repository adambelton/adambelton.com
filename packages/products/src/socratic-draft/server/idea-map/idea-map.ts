import {
  EMPTY_IDEA_MAP,
  IDEA_ACTION_TYPES,
  IDEA_DISPOSITIONS,
  IDEA_EXPLORATION_ASSESSMENTS,
  IDEA_IMPORTANCE_ASSESSMENTS,
  type Idea,
  type IdeaActionRequest,
  type IdeaDisposition,
  type IdeaMap,
} from "packages/products/src/socratic-draft/shared";

export const MAX_RETAINED_IDEAS = 12;
export const MAX_ACTIVE_IDEAS = 6;

const ACTIVE_IDEA_DISPOSITIONS = new Set<IdeaDisposition>([
  IDEA_DISPOSITIONS.active,
  IDEA_DISPOSITIONS.focused,
]);

export type ProposedIdea = Omit<Idea, "id" | "userInterpretation"> & {
  id: string | null;
};

export interface ProposedIdeaAction {
  ideaId: string;
  action: IdeaActionRequest["action"];
  userInterpretation?: string;
}

export const IDEA_MAP_UPDATE_STATUSES = {
  changed: "changed",
  invalid: "invalid",
  unchanged: "unchanged",
} as const;

export type IdeaMapUpdateResult =
  | { status: typeof IDEA_MAP_UPDATE_STATUSES.changed; ideaMap: IdeaMap }
  | { status: typeof IDEA_MAP_UPDATE_STATUSES.unchanged; ideaMap: IdeaMap }
  | { status: typeof IDEA_MAP_UPDATE_STATUSES.invalid; ideaMap: IdeaMap };

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
    ideaMap: { revision: input.current.revision + 1, ideas: nextIdeas },
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
    ideaMap: { revision: input.current.revision + 1, ideas },
  };
}

export function parseProposedIdeas(value: unknown): ProposedIdea[] | null {
  if (getProposedIdeasValidationIssues(value).length > 0 || !Array.isArray(value)) {
    return null;
  }

  const ideas: ProposedIdea[] = [];
  for (const candidate of value) {
    if (!isRecord(candidate) || !isRecord(candidate.assistantAssessment)) {
      return null;
    }
    const assessment = candidate.assistantAssessment;
    if (
      !isNullableString(candidate.id) ||
      !isNonEmptyString(candidate.title) ||
      !isNonEmptyString(candidate.synthesis) ||
      !isNonEmptyString(candidate.substance) ||
      !Array.isArray(candidate.unresolvedQuestions) ||
      candidate.unresolvedQuestions.length > 3 ||
      !candidate.unresolvedQuestions.every(isNonEmptyString) ||
      !isConstantValue(IDEA_DISPOSITIONS, candidate.disposition) ||
      !isConstantValue(IDEA_EXPLORATION_ASSESSMENTS, assessment.exploration) ||
      !isConstantValue(IDEA_IMPORTANCE_ASSESSMENTS, assessment.importance)
    ) {
      return null;
    }
    ideas.push({
      id: candidate.id,
      title: candidate.title.trim(),
      synthesis: candidate.synthesis.trim(),
      substance: candidate.substance.trim(),
      unresolvedQuestions: candidate.unresolvedQuestions.map((question) =>
        question.trim(),
      ),
      disposition: candidate.disposition,
      assistantAssessment: {
        exploration: assessment.exploration,
        importance: assessment.importance,
      },
    });
  }

  return ideas;
}

export function getProposedIdeasValidationIssues(value: unknown): string[] {
  if (value === null) return [];
  if (!Array.isArray(value)) return ["proposedIdeas must be an array or null"];
  const issues: string[] = [];
  for (const [index, candidate] of value.entries()) {
    const path = `proposedIdeas[${index}]`;
    if (!isRecord(candidate)) {
      issues.push(`${path} must be an object`);
      continue;
    }
    if (!isNullableString(candidate.id)) issues.push(`${path}.id must be a string or null`);
    if (!isNonEmptyString(candidate.title)) issues.push(`${path}.title must be a non-empty string`);
    if (!isNonEmptyString(candidate.synthesis)) issues.push(`${path}.synthesis must be a non-empty string`);
    if (!isNonEmptyString(candidate.substance)) issues.push(`${path}.substance must be a non-empty string`);
    if (!Array.isArray(candidate.unresolvedQuestions) || candidate.unresolvedQuestions.length > 3 || !candidate.unresolvedQuestions.every(isNonEmptyString)) {
      issues.push(`${path}.unresolvedQuestions must contain at most three non-empty strings`);
    }
    if (!isConstantValue(IDEA_DISPOSITIONS, candidate.disposition)) {
      issues.push(`${path}.disposition is not an allowed disposition`);
    }
    if (!isRecord(candidate.assistantAssessment)) {
      issues.push(`${path}.assistantAssessment must be an object`);
      continue;
    }
    if (!isConstantValue(IDEA_EXPLORATION_ASSESSMENTS, candidate.assistantAssessment.exploration)) {
      issues.push(`${path}.assistantAssessment.exploration is not allowed`);
    }
    if (!isConstantValue(IDEA_IMPORTANCE_ASSESSMENTS, candidate.assistantAssessment.importance)) {
      issues.push(`${path}.assistantAssessment.importance is not allowed`);
    }
  }
  return issues;
}

export function parseProposedIdeaActions(
  value: unknown,
): ProposedIdeaAction[] | null {
  if (getProposedIdeaActionsValidationIssues(value).length > 0 || !Array.isArray(value)) return null;
  const actions: ProposedIdeaAction[] = [];
  for (const candidate of value) {
    if (
      !isRecord(candidate) ||
      !isNonEmptyString(candidate.ideaId) ||
      !isConstantValue(IDEA_ACTION_TYPES, candidate.action) ||
      (candidate.userInterpretation !== undefined &&
        candidate.userInterpretation !== null &&
        typeof candidate.userInterpretation !== "string")
    ) {
      return null;
    }
    actions.push({
      ideaId: candidate.ideaId.trim(),
      action: candidate.action,
      ...(candidate.userInterpretation === undefined ||
      candidate.userInterpretation === null
        ? {}
        : { userInterpretation: candidate.userInterpretation.trim() }),
    });
  }
  return actions;
}

export function getProposedIdeaActionsValidationIssues(value: unknown): string[] {
  if (value === null) return [];
  if (!Array.isArray(value)) return ["ideaActions must be an array or null"];
  const issues: string[] = [];
  for (const [index, candidate] of value.entries()) {
    const path = `ideaActions[${index}]`;
    if (!isRecord(candidate)) {
      issues.push(`${path} must be an object`);
      continue;
    }
    if (!isNonEmptyString(candidate.ideaId)) issues.push(`${path}.ideaId must be a non-empty string`);
    if (!isConstantValue(IDEA_ACTION_TYPES, candidate.action)) issues.push(`${path}.action is not allowed`);
    if (candidate.userInterpretation !== undefined && candidate.userInterpretation !== null && typeof candidate.userInterpretation !== "string") {
      issues.push(`${path}.userInterpretation must be a string or null`);
    }
  }
  return issues;
}

export function cloneIdeaMap(ideaMap: IdeaMap = EMPTY_IDEA_MAP): IdeaMap {
  return {
    revision: ideaMap.revision,
    ideas: ideaMap.ideas.map((idea) => ({
      ...idea,
      assistantAssessment: { ...idea.assistantAssessment },
      unresolvedQuestions: [...idea.unresolvedQuestions],
    })),
  };
}

function countActiveIdeas(ideas: Idea[]) {
  return ideas.filter((idea) => ACTIVE_IDEA_DISPOSITIONS.has(idea.disposition)).length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isConstantValue<Values extends Record<string, string>>(
  values: Values,
  candidate: unknown,
): candidate is Values[keyof Values] {
  return (
    typeof candidate === "string" &&
    (Object.values(values) as string[]).includes(candidate)
  );
}
