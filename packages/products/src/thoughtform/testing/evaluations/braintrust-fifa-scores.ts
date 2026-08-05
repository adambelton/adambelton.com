import {
  READINESS_ACTIONS,
  type ConversationResponse,
  type IdeaMap,
} from "packages/products/src/thoughtform/shared";
import type {
  HostedConversationEvaluationSummary,
  HostedConversationTurnMetrics,
} from "packages/products/src/thoughtform/testing/evaluations/hosted-conversation-evaluation";

export type EvaluatedFifaTurn = {
  turn: number;
  userMessage: string;
  response: ConversationResponse;
  rawModelOutputs: string[];
  repairCalls: number;
  validationIssues: string[];
  ideaMap: IdeaMap;
  metrics: HostedConversationTurnMetrics;
};

export type FifaConversationEvaluation = {
  scenarioId: string;
  turns: EvaluatedFifaTurn[];
  finalIdeaMap: IdeaMap;
  summary: HostedConversationEvaluationSummary;
  totalModelCalls: number;
};

export function completeConversationScore(
  output: FifaConversationEvaluation,
  expectedTurns: number,
) {
  return output.turns.length === expectedTurns ? 1 : 0;
}

export function structuredOutputScore(output: FifaConversationEvaluation) {
  return ratio(output.turns, (turn) => turn.validationIssues.length === 0);
}

export function readinessContractScore(output: FifaConversationEvaluation) {
  return ratio(output.turns, (turn) => hasReadinessContract(turn.response));
}

export function finalIntentionScore(
  output: FifaConversationEvaluation,
  expectedIntention: string | undefined,
) {
  return output.turns.at(-1)?.response.userIntention === expectedIntention ? 1 : 0;
}

export function hasReadinessContract(response: ConversationResponse) {
  const actions = new Set(response.assistantReadiness.map((entry) => entry.action));
  return actions.size === 2 &&
    actions.has(READINESS_ACTIONS.reflect) &&
    actions.has(READINESS_ACTIONS.compose) &&
    response.assistantReadiness.every((entry) =>
      entry.assessment !== "ready_with_uncertainty" || Boolean(entry.explanation?.trim())
    );
}

export function firstPersonCanonicalMaterialScore(
  output: FifaConversationEvaluation,
) {
  const forbidden =
    /\b(?:the )?user (?:reports?|says?|said|states?|wrote|mentions?)\b|exact user|assistant assessment|the conversation/i;
  const canonicalParts = output.finalIdeaMap.ideas.flatMap((idea) => [
    idea.title,
    idea.synthesis,
    idea.substance,
    ...idea.unresolvedQuestions,
  ]);
  return canonicalParts.some((part) => forbidden.test(part)) ? 0 : 1;
}

export function ideaIdentityContinuityScore(
  output: FifaConversationEvaluation,
) {
  const comparableTurns = output.turns.filter(
    (turn, index) =>
      index > 0 && output.turns[index - 1]!.ideaMap.ideas.length > 0,
  );
  return ratio(comparableTurns, (turn) => turn.metrics.retainedIdeaCount > 0);
}

export function fifaConceptualCoverageScore(output: FifaConversationEvaluation) {
  const content = evaluationContent(output);
  const concepts = [
    /leadership|Infantino/i,
    /football.{0,40}(?:larger|belongs|meaning)|(?:larger|belongs|meaning).{0,40}football/i,
    /legitimacy/i,
    /supporters?|associations?/i,
    /accountab|scrutin|transparent|independent|enforceable|limits?/i,
  ];
  return concepts.filter((concept) => concept.test(content)).length / concepts.length;
}

export function unresolvedPracticalTensionScore(
  output: FifaConversationEvaluation,
) {
  const finalTurn = output.turns.at(-1);
  if (!finalTurn) return 0;
  const content = [
    finalTurn.response.message.content,
    ...finalTurn.ideaMap.ideas.flatMap((idea) => idea.unresolvedQuestions),
  ].join(" ");
  return /how|which|practical|translate|coordinate|enforce|reform|pressure/i.test(
    content,
  )
    ? 1
    : 0;
}

export function oneQuestionDisciplineScore(output: FifaConversationEvaluation) {
  return ratio(
    output.turns,
    (turn) => (turn.response.message.content.match(/\?/g)?.length ?? 0) <= 1,
  );
}

function evaluationContent(output: FifaConversationEvaluation) {
  return [
    ...output.turns.flatMap((turn) => [
      turn.response.message.content,
    ]),
    ...output.finalIdeaMap.ideas.flatMap((idea) => [
      idea.title,
      idea.synthesis,
      idea.substance,
      ...idea.unresolvedQuestions,
    ]),
  ].join(" ");
}

function ratio<T>(values: T[], predicate: (value: T) => boolean) {
  if (values.length === 0) return 0;
  return values.filter(predicate).length / values.length;
}
