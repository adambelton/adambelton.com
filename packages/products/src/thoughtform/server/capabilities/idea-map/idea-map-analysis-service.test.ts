import { describe, expect, it } from "vitest";
import {
  IDEA_MAP_ANALYSIS_OUTPUT_FORMAT,
  IdeaMapAnalysisService,
  MAX_IDEA_MAP_ANALYSIS_OUTPUT_TOKENS,
} from "packages/products/src/thoughtform/server/capabilities/idea-map/idea-map-analysis-service";
import type { IdeaMapAnalysisModelRequest } from "packages/products/src/thoughtform/server/capabilities/idea-map/ports/idea-map-analysis-model";
import {
  IDEA_ACTION_TYPES,
  IDEA_EXPLORATION_ASSESSMENTS,
  IDEA_IMPORTANCE_ASSESSMENTS,
  IDEA_STRUCTURE_OPERATION_TYPES,
} from "packages/products/src/thoughtform/shared";

describe("IdeaMapAnalysisService", () => {
  it("derives Idea Map schema values from product constants", () => {
    const properties = IDEA_MAP_ANALYSIS_OUTPUT_FORMAT.schema.properties;
    const proposedIdea = properties.proposedIdeas.anyOf[0].items.properties;
    const ideaAction = properties.ideaActions.anyOf[0].items.properties;
    const proposedMerge = properties.proposedStructure.anyOf[0].properties;

    expect(proposedIdea.assistantAssessment.properties.exploration.enum).toEqual(
      Object.values(IDEA_EXPLORATION_ASSESSMENTS),
    );
    expect(proposedIdea.assistantAssessment.properties.importance.enum).toEqual(
      Object.values(IDEA_IMPORTANCE_ASSESSMENTS),
    );
    expect(ideaAction.action.enum).toEqual(Object.values(IDEA_ACTION_TYPES));
    expect(proposedMerge.type.enum).toEqual([IDEA_STRUCTURE_OPERATION_TYPES.merge]);
  });

  it("parses one bounded structural proposal from the existing analysis call", async () => {
    const service = new IdeaMapAnalysisService({
      async createAnalysis() {
        return { content: JSON.stringify({
          proposedIdeas: null,
          ideaActions: null,
          resolvedPotentialConflictIds: null,
          proposedStructure: {
            type: IDEA_STRUCTURE_OPERATION_TYPES.merge,
            ideaIds: ["idea-1", "idea-2"],
            result: {
              title: "One concern",
              synthesis: "The concerns overlap.",
              assistantAssessment: {
                exploration: IDEA_EXPLORATION_ASSESSMENTS.developing,
                importance: IDEA_IMPORTANCE_ASSESSMENTS.central,
              },
            },
            explanation: "Both ideas describe the same concern.",
          },
        }) };
      },
    });
    const result = await service.analyse({
      message: "These are really the same concern.",
      previousMessages: [],
      ideaMap: { revision: 1, ideas: [] },
    });
    expect(result.proposedStructure).toMatchObject({
      type: IDEA_STRUCTURE_OPERATION_TYPES.merge,
      ideaIds: ["idea-1", "idea-2"],
    });
  });

  it("analyses the user message independently and retains grounded proposals", async () => {
    const requests: IdeaMapAnalysisModelRequest[] = [];
    const service = new IdeaMapAnalysisService({
      async createAnalysis(request) {
        requests.push(request);
        return { content: JSON.stringify({
          proposedIdeas: [{
            id: null,
            title: "Leadership without accountability",
            synthesis: "I object to leadership without accountability.",
            substance: "I condemn Infantino's leadership, not football itself.",
            unresolvedQuestions: ["How can football withdraw legitimacy?"],
            disposition: "active",
            assistantAssessment: {
              exploration: "developing",
              importance: "central",
            },
            evidence: [{
              quote: "I condemn Infantino's leadership, not football itself.",
            }],
          }],
          ideaActions: null,
          resolvedPotentialConflictIds: null,
        }) };
      },
    });

    const result = await service.analyse({
      message: "I condemn Infantino's leadership, not football itself.",
      previousMessages: [],
      ideaMap: { revision: 0, ideas: [] },
    });

    expect(requests[0]?.messages).toEqual([{
      role: "user",
      content: "I condemn Infantino's leadership, not football itself.",
    }]);
    expect(requests[0]?.system).toContain(
      "assistant's concurrently generated response is not input",
    );
    expect(requests[0]?.maxOutputTokens).toBe(
      MAX_IDEA_MAP_ANALYSIS_OUTPUT_TOKENS,
    );
    expect(MAX_IDEA_MAP_ANALYSIS_OUTPUT_TOKENS).toBe(3_072);
    expect(result.proposedIdeas?.[0]).toMatchObject({
      title: "Leadership without accountability",
      assistantAssessment: { exploration: "developing" },
    });
  });

  it("rejects canonical substance copied only from an assistant message", async () => {
    const service = new IdeaMapAnalysisService({
      async createAnalysis() {
        return { content: JSON.stringify({
          proposedIdeas: [{
            id: null,
            title: "Missing my dog",
            synthesis: "I miss my dog.",
            substance: "I feel low-energy because I miss my dog.",
            unresolvedQuestions: [],
            disposition: "active",
            assistantAssessment: {
              exploration: "emerging",
              importance: "central",
            },
            evidence: [{ quote: "I miss my dog." }],
          }],
          ideaActions: null,
          resolvedPotentialConflictIds: null,
        }) };
      },
    });

    const result = await service.analyse({
      message: "I miss my dog.",
      previousMessages: [{
        role: "assistant",
        content: "That sounds like a low-energy feeling.",
      }],
      ideaMap: { revision: 0, ideas: [] },
    });

    expect(result.proposedIdeas).toBeNull();
  });
});
