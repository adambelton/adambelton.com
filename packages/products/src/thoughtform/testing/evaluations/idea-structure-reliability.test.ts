import { describe, expect, it } from "vitest";
import { IDEA_STRUCTURE_OPERATION_TYPES } from "packages/products/src/thoughtform/shared";
import {
  IDEA_STRUCTURE_RELIABILITY_SCENARIOS,
  observeIdeaStructureReliability,
  summariseIdeaStructureReliability,
} from "packages/products/src/thoughtform/testing/evaluations/idea-structure-reliability";

describe("Idea Map structure reliability evaluation", () => {
  it("covers merge, split, controls, and correction respect without content in summaries", () => {
    expect(IDEA_STRUCTURE_RELIABILITY_SCENARIOS.map((scenario) => scenario.category)).toEqual([
      "merge", "merge", "split", "split", "control", "control", "control", "correction",
    ]);
    const observations = IDEA_STRUCTURE_RELIABILITY_SCENARIOS.map((scenario, index) =>
      observeIdeaStructureReliability({
        scenario,
        repetition: 1,
        proposal: index === 0 ? {
          type: IDEA_STRUCTURE_OPERATION_TYPES.merge,
          ideaIds: ["idea-1", "idea-2"],
          result: {
            title: "Combined",
            synthesis: "One underlying meaning.",
            assistantAssessment: { exploration: "developing", importance: "central" },
          },
          explanation: "They overlap.",
        } : null,
      }));
    const summary = summariseIdeaStructureReliability(observations);
    expect(summary).toMatchObject({
      sampleCount: 8,
      expectedChangeCount: 4,
      correctChangeCount: 1,
      missedChangeCount: 3,
      inappropriateChangeCount: 0,
      correctionSampleCount: 1,
      correctionRespectedCount: 1,
    });
    const serialized = JSON.stringify(summary);
    for (const scenario of IDEA_STRUCTURE_RELIABILITY_SCENARIOS) {
      expect(serialized).not.toContain(scenario.message);
      for (const idea of scenario.ideaMap.ideas) {
        expect(serialized).not.toContain(idea.substance);
      }
    }
  });

  it("distinguishes an inappropriate control change from a rejected expected change", () => {
    const control = IDEA_STRUCTURE_RELIABILITY_SCENARIOS[4]!;
    const observation = observeIdeaStructureReliability({
      scenario: control,
      repetition: 2,
      proposal: {
        type: IDEA_STRUCTURE_OPERATION_TYPES.merge,
        ideaIds: ["idea-1", "idea-2"],
        result: {
          title: "Combined",
          synthesis: "Incorrectly combined.",
          assistantAssessment: { exploration: "developing", importance: "central" },
        },
        explanation: "They are related.",
      },
    });
    expect(summariseIdeaStructureReliability([observation])).toMatchObject({
      inappropriateChangeCount: 1,
      correctChangeCount: 0,
    });
  });
});
