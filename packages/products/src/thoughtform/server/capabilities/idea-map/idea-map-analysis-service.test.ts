import { describe, expect, it } from "vitest";
import {
  IDEA_MAP_ANALYSIS_OUTPUT_FORMAT,
  IdeaMapAnalysisService,
} from "packages/products/src/thoughtform/server/capabilities/idea-map/idea-map-analysis-service";
import type { IdeaMapAnalysisModelRequest } from "packages/products/src/thoughtform/server/capabilities/idea-map/ports/idea-map-analysis-model";
import {
  IDEA_ACTION_TYPES,
  IDEA_EXPLORATION_ASSESSMENTS,
  IDEA_IMPORTANCE_ASSESSMENTS,
} from "packages/products/src/thoughtform/shared";

describe("IdeaMapAnalysisService", () => {
  it("derives Idea Map schema values from product constants", () => {
    const properties = IDEA_MAP_ANALYSIS_OUTPUT_FORMAT.schema.properties;
    const proposedIdea = properties.proposedIdeas.anyOf[0].items.properties;
    const ideaAction = properties.ideaActions.anyOf[0].items.properties;

    expect(proposedIdea.assistantAssessment.properties.exploration.enum).toEqual(
      Object.values(IDEA_EXPLORATION_ASSESSMENTS),
    );
    expect(proposedIdea.assistantAssessment.properties.importance.enum).toEqual(
      Object.values(IDEA_IMPORTANCE_ASSESSMENTS),
    );
    expect(ideaAction.action.enum).toEqual(Object.values(IDEA_ACTION_TYPES));
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
