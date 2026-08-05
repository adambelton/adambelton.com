import { describe, expect, it } from "vitest";
import {
  completeConversationScore,
  fifaConceptualCoverageScore,
  finalIntentionScore,
  firstPersonCanonicalMaterialScore,
  ideaIdentityContinuityScore,
  oneQuestionDisciplineScore,
  readinessContractScore,
  structuredOutputScore,
  unresolvedPracticalTensionScore,
  type FifaConversationEvaluation,
} from "packages/products/src/thoughtform/testing/evaluations/braintrust-fifa-scores";
import {
  ACTIVITIES,
  ASSISTANT_MOVES,
  IDEA_DISPOSITIONS,
  IDEA_EXPLORATION_ASSESSMENTS,
  IDEA_IMPORTANCE_ASSESSMENTS,
  READINESS_ACTIONS,
  READINESS_ASSESSMENTS,
  USER_INTENTIONS,
  type ConversationResponse,
  type IdeaMap,
} from "packages/products/src/thoughtform/shared";

describe("Braintrust FIFA evaluation scores", () => {
  it("scores a sustained synthetic FIFA conversation deterministically", () => {
    const output = createEvaluation();

    expect(completeConversationScore(output, 2)).toBe(1);
    expect(structuredOutputScore(output)).toBe(1);
    expect(readinessContractScore(output)).toBe(1);
    expect(finalIntentionScore(output, USER_INTENTIONS.reflect)).toBe(1);
    expect(firstPersonCanonicalMaterialScore(output)).toBe(1);
    expect(ideaIdentityContinuityScore(output)).toBe(1);
    expect(fifaConceptualCoverageScore(output)).toBe(1);
    expect(unresolvedPracticalTensionScore(output)).toBe(1);
    expect(oneQuestionDisciplineScore(output)).toBe(1);
  });

  it("rejects assistant-facing provenance in canonical material", () => {
    const output = createEvaluation();
    output.finalIdeaMap.ideas[0]!.substance =
      "The user says football is larger than FIFA.";

    expect(firstPersonCanonicalMaterialScore(output)).toBe(0);
  });
});

function createEvaluation(): FifaConversationEvaluation {
  const ideaMap: IdeaMap = {
    revision: 2,
    ideas: [{
      id: "idea-accountability",
      title: "Football is larger than FIFA",
      synthesis:
        "Football gives FIFA legitimacy and can demand accountable leadership.",
      substance:
        "Supporters and associations can translate pressure into transparent, independent scrutiny and enforceable limits.",
      unresolvedQuestions: [
        "How can associations coordinate practical reform?",
      ],
      disposition: IDEA_DISPOSITIONS.active,
      assistantAssessment: {
        exploration: IDEA_EXPLORATION_ASSESSMENTS.developing,
        importance: IDEA_IMPORTANCE_ASSESSMENTS.central,
      },
      userInterpretation: null,
    }],
  };
  const firstMap = { ...ideaMap, revision: 1 };
  const turns = [
    createTurn(1, firstMap, USER_INTENTIONS.explore),
    createTurn(2, ideaMap, USER_INTENTIONS.reflect),
  ];
  return {
    scenarioId: "fifa-accountability",
    turns,
    finalIdeaMap: ideaMap,
    summary: {
      turns: 2,
      medianTotalLatencyMs: 100,
      maximumTotalLatencyMs: 100,
      totalInputTokens: 200,
      totalOutputTokens: 100,
      totalReasoningTokens: 0,
      totalCacheReadTokens: 0,
      totalCacheWriteTokens: 0,
      finalMapRevision: 2,
      finalIdeaCount: 1,
      finalSubstanceCharacters: ideaMap.ideas[0]!.substance.length,
    },
    totalModelCalls: 2,
  };
}

function createTurn(
  turn: number,
  ideaMap: IdeaMap,
  userIntention: ConversationResponse["userIntention"],
) {
  const response: ConversationResponse = {
    conversationId: "fifa-conversation",
    message: {
      role: "assistant",
      content:
        turn === 1
          ? "FIFA borrows authority from football. What makes that distinction important?"
          : "The argument now joins legitimacy to accountability while leaving practical reform unresolved.",
    },
    activity: ACTIVITIES.discovery,
    move: ASSISTANT_MOVES.partialReflection,
    assistantReadiness: [
      {
        action: READINESS_ACTIONS.reflect,
        assessment: READINESS_ASSESSMENTS.ready,
      },
      {
        action: READINESS_ACTIONS.compose,
        assessment: READINESS_ASSESSMENTS.readyWithUncertainty,
        explanation: "The practical reform remains unresolved.",
      },
    ],
    userIntention,
    ideaMap,
  };
  return {
    turn,
    userMessage:
      turn === 1
        ? "Football is larger than FIFA and Infantino's leadership."
        : "Supporters and associations must turn legitimacy into accountability.",
    response,
    rawModelOutputs: ["{}"],
    repairCalls: 0,
    validationIssues: [],
    ideaMap,
    metrics: {
      turn,
      totalLatencyMs: 100,
      providerLatencyMs: 90,
      inputTokens: 100,
      outputTokens: 50,
      reasoningTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      outputCharacters: response.message.content.length,
      model: "claude-sonnet-5",
      mapRevision: ideaMap.revision,
      ideaCount: ideaMap.ideas.length,
      retainedIdeaCount: turn === 1 ? 0 : 1,
      totalSynthesisCharacters: ideaMap.ideas[0]!.synthesis.length,
      totalSubstanceCharacters: ideaMap.ideas[0]!.substance.length,
    },
  };
}
