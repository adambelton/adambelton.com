import {
  IDEA_ACTION_TYPES,
  IDEA_DISPOSITIONS,
  IDEA_EXPLORATION_ASSESSMENTS,
  IDEA_IMPORTANCE_ASSESSMENTS,
  IDEA_STRUCTURE_OPERATION_TYPES,
  type Idea,
  type IdeaActionRequest,
  type MergeIdeasRequest,
  type SplitIdeaRequest,
} from "packages/products/src/thoughtform/shared";

export type ProposedIdea = Omit<Idea, "id" | "userInterpretation"> & {
  id: string | null;
};

export interface ProposedIdeaAction {
  ideaId: string;
  action: IdeaActionRequest["action"];
  userInterpretation?: string;
}

export type ProposedIdeaStructure =
  | Omit<MergeIdeasRequest, "expectedRevision">
  | Omit<SplitIdeaRequest, "expectedRevision">;

export function parseProposedIdeaStructure(value: unknown): ProposedIdeaStructure | null {
  if (!isRecord(value) || !isConstantValue(IDEA_STRUCTURE_OPERATION_TYPES, value.type)) {
    return null;
  }
  if (!isNonEmptyString(value.explanation)) return null;
  if (value.type === IDEA_STRUCTURE_OPERATION_TYPES.merge) {
    if (
      !Array.isArray(value.ideaIds) || value.ideaIds.length < 2 ||
      !value.ideaIds.every(isNonEmptyString) || !isRecord(value.result) ||
      !isNonEmptyString(value.result.title) || !isNonEmptyString(value.result.synthesis) ||
      !isAssessment(value.result.assistantAssessment)
    ) return null;
    return {
      type: value.type,
      ideaIds: value.ideaIds.map((id) => id.trim()),
      result: {
        title: value.result.title.trim(),
        synthesis: value.result.synthesis.trim(),
        assistantAssessment: parseAssessment(value.result.assistantAssessment),
      },
      explanation: value.explanation.trim(),
    };
  }
  if (
    !isNonEmptyString(value.ideaId) || !Array.isArray(value.results) ||
    value.results.length < 2 || !value.results.every(isStructureResult)
  ) return null;
  return {
    type: value.type,
    ideaId: value.ideaId.trim(),
    results: value.results.map((result) => ({
      title: result.title.trim(),
      synthesis: result.synthesis.trim(),
      substance: result.substance.trim(),
      unresolvedQuestions: result.unresolvedQuestions.map((question) => question.trim()),
      assistantAssessment: parseAssessment(result.assistantAssessment),
    })),
    explanation: value.explanation.trim(),
  };
}

export function getProposedIdeaStructureValidationIssues(value: unknown): string[] {
  if (value === null) return [];
  return parseProposedIdeaStructure(value) ? [] : ["proposedStructure is invalid"];
}

export function parseProposedIdeas(value: unknown): ProposedIdea[] | null {
  if (getProposedIdeasValidationIssues(value).length > 0 || !Array.isArray(value)) return null;
  return value.map((candidate) => {
    const record = candidate as Record<string, unknown>;
    const assessment = record.assistantAssessment as Record<string, unknown>;
    return {
      id: record.id as string | null,
      title: (record.title as string).trim(),
      synthesis: (record.synthesis as string).trim(),
      substance: (record.substance as string).trim(),
      unresolvedQuestions: (record.unresolvedQuestions as string[]).map((question) => question.trim()),
      disposition: record.disposition as ProposedIdea["disposition"],
      assistantAssessment: {
        exploration: assessment.exploration as ProposedIdea["assistantAssessment"]["exploration"],
        importance: assessment.importance as ProposedIdea["assistantAssessment"]["importance"],
      },
    };
  });
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
    if (!isConstantValue(IDEA_DISPOSITIONS, candidate.disposition)) issues.push(`${path}.disposition is not an allowed disposition`);
    if (!isRecord(candidate.assistantAssessment)) {
      issues.push(`${path}.assistantAssessment must be an object`);
      continue;
    }
    if (!isConstantValue(IDEA_EXPLORATION_ASSESSMENTS, candidate.assistantAssessment.exploration)) issues.push(`${path}.assistantAssessment.exploration is not allowed`);
    if (!isConstantValue(IDEA_IMPORTANCE_ASSESSMENTS, candidate.assistantAssessment.importance)) issues.push(`${path}.assistantAssessment.importance is not allowed`);
  }
  return issues;
}

export function parseProposedIdeaActions(value: unknown): ProposedIdeaAction[] | null {
  if (getProposedIdeaActionsValidationIssues(value).length > 0 || !Array.isArray(value)) return null;
  return value.map((candidate) => {
    const record = candidate as Record<string, unknown>;
    return {
      ideaId: (record.ideaId as string).trim(),
      action: record.action as ProposedIdeaAction["action"],
      ...(record.userInterpretation === undefined || record.userInterpretation === null
        ? {}
        : { userInterpretation: (record.userInterpretation as string).trim() }),
    };
  });
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
    if (candidate.userInterpretation !== undefined && candidate.userInterpretation !== null && typeof candidate.userInterpretation !== "string") issues.push(`${path}.userInterpretation must be a string or null`);
  }
  return issues;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStructureResult(value: unknown): value is {
  title: string;
  synthesis: string;
  substance: string;
  unresolvedQuestions: string[];
  assistantAssessment: Record<string, unknown>;
} {
  return isRecord(value) && isNonEmptyString(value.title) &&
    isNonEmptyString(value.synthesis) && isNonEmptyString(value.substance) &&
    Array.isArray(value.unresolvedQuestions) && value.unresolvedQuestions.every(isNonEmptyString) &&
    isAssessment(value.assistantAssessment);
}

function isAssessment(value: unknown): value is Record<string, unknown> {
  return isRecord(value) &&
    isConstantValue(IDEA_EXPLORATION_ASSESSMENTS, value.exploration) &&
    isConstantValue(IDEA_IMPORTANCE_ASSESSMENTS, value.importance);
}

function parseAssessment(value: Record<string, unknown>) {
  return {
    exploration: value.exploration as Idea["assistantAssessment"]["exploration"],
    importance: value.importance as Idea["assistantAssessment"]["importance"],
  };
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
  return typeof candidate === "string" && (Object.values(values) as string[]).includes(candidate);
}
