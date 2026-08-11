import { describe, expect, it } from "vitest";
import {
  applyIdeaStructure,
  IDEA_MAP_UPDATE_STATUSES,
  undoLatestIdeaStructure,
} from "packages/products/src/thoughtform/server/capabilities/idea-map";
import {
  IDEA_DISPOSITIONS,
  IDEA_EXPLORATION_ASSESSMENTS,
  IDEA_IMPORTANCE_ASSESSMENTS,
  IDEA_STRUCTURE_CHANGE_SOURCES,
  IDEA_STRUCTURE_OPERATION_TYPES,
  POTENTIAL_CONFLICT_SCOPES,
  type Idea,
  type IdeaMap,
  type IdeaStructureRequest,
} from "packages/products/src/thoughtform/shared";

describe("Idea Map structural evolution", () => {
  it("merges established ideas into the oldest identity without losing meaning or references", () => {
    const current: IdeaMap = {
      revision: 4,
      ideas: [
        idea({ id: "idea-old", substance: "Established meaning one.", disposition: IDEA_DISPOSITIONS.focused }),
        idea({ id: "idea-new", substance: "Established meaning two.", userInterpretation: "Keep this distinction." }),
      ],
      potentialConflicts: [{
        id: "conflict-1",
        scope: POTENTIAL_CONFLICT_SCOPES.betweenIdeas,
        summary: "A tension",
        explanation: "Both ideas are involved.",
        ideaIds: ["idea-old", "idea-new"],
        draftChange: null,
      }],
    };
    const result = applyIdeaStructure({
      current,
      source: IDEA_STRUCTURE_CHANGE_SOURCES.assistant,
      request: {
        type: IDEA_STRUCTURE_OPERATION_TYPES.merge,
        expectedRevision: 4,
        ideaIds: ["idea-new", "idea-old"],
        result: {
          title: "One underlying concern",
          synthesis: "The concerns overlap.",
          assistantAssessment: assessment(),
        },
        explanation: "These ideas describe the same underlying concern.",
      },
    });

    expect(result.status).toBe(IDEA_MAP_UPDATE_STATUSES.changed);
    expect(result.ideaMap.ideas).toHaveLength(1);
    expect(result.ideaMap.ideas[0]).toMatchObject({
      id: "idea-old",
      disposition: IDEA_DISPOSITIONS.active,
      userInterpretation: "Keep this distinction.",
      substance: "Established meaning two.\n\nEstablished meaning one.",
    });
    expect(result.ideaMap.potentialConflicts?.[0]).toMatchObject({
      scope: POTENTIAL_CONFLICT_SCOPES.withinIdea,
      ideaIds: ["idea-old"],
    });
  });

  it("splits exact established substance, retains the primary identity, and remaps references", () => {
    const current: IdeaMap = {
      revision: 2,
      ideas: [idea({
        substance: "First established meaning. Second established meaning.",
        unresolvedQuestions: ["Question one?", "Question two?"],
        userInterpretation: "The first concern is primary.",
      })],
      potentialConflicts: [{
        id: "conflict-1",
        scope: POTENTIAL_CONFLICT_SCOPES.withinIdea,
        summary: "A tension",
        explanation: "The idea contains a tension.",
        ideaIds: ["idea-1"],
        draftChange: null,
      }],
    };
    const ids = ["idea-2"];
    const result = applyIdeaStructure({
      current,
      source: IDEA_STRUCTURE_CHANGE_SOURCES.user,
      createIdeaId: () => ids.shift()!,
      request: {
        type: IDEA_STRUCTURE_OPERATION_TYPES.split,
        expectedRevision: 2,
        ideaId: "idea-1",
        explanation: "These are distinct concerns.",
        results: [
          structureResult("First", "First established meaning.", ["Question one?"]),
          structureResult("Second", "Second established meaning.", ["Question two?"]),
        ],
      },
    });

    expect(result.status).toBe(IDEA_MAP_UPDATE_STATUSES.changed);
    expect(result.ideaMap.ideas.map((candidate) => candidate.id)).toEqual(["idea-1", "idea-2"]);
    expect(result.ideaMap.ideas[0]?.userInterpretation).toBe("The first concern is primary.");
    expect(result.ideaMap.ideas[1]?.userInterpretation).toBeNull();
    expect(result.ideaMap.potentialConflicts?.[0]).toMatchObject({
      scope: POTENTIAL_CONFLICT_SCOPES.betweenIdeas,
      ideaIds: ["idea-1", "idea-2"],
    });
  });

  it("rejects a split that drops established substance or unresolved questions", () => {
    const current = map([idea({
      substance: "Meaning one. Meaning two.",
      unresolvedQuestions: ["Still open?"],
    })]);
    const result = applyIdeaStructure({
      current,
      source: IDEA_STRUCTURE_CHANGE_SOURCES.assistant,
      request: {
        type: IDEA_STRUCTURE_OPERATION_TYPES.split,
        expectedRevision: current.revision,
        ideaId: "idea-1",
        explanation: "Two concerns.",
        results: [
          structureResult("One", "Meaning one.", []),
          structureResult("Two", "Meaning two.", []),
        ],
      },
    });
    expect(result.status).toBe(IDEA_MAP_UPDATE_STATUSES.invalid);
    expect(result.ideaMap).toEqual(current);
  });

  it("lets the user correct dismissed structure while rejecting the same assistant proposal", () => {
    const current = map([
      idea({ id: "idea-1", disposition: IDEA_DISPOSITIONS.dismissed }),
      idea({ id: "idea-2" }),
    ]);
    const request = {
      type: IDEA_STRUCTURE_OPERATION_TYPES.merge,
      expectedRevision: current.revision,
      ideaIds: ["idea-1", "idea-2"],
      result: { title: "Together", synthesis: "Together.", assistantAssessment: assessment() },
      explanation: "The user says these belong together.",
    } as const;
    expect(applyIdeaStructure({
      current,
      request: { ...request, ideaIds: [...request.ideaIds] },
      source: IDEA_STRUCTURE_CHANGE_SOURCES.assistant,
    }).status).toBe(IDEA_MAP_UPDATE_STATUSES.invalid);
    const userResult = applyIdeaStructure({
      current,
      request: { ...request, ideaIds: [...request.ideaIds] },
      source: IDEA_STRUCTURE_CHANGE_SOURCES.user,
    });
    expect(userResult.status).toBe(IDEA_MAP_UPDATE_STATUSES.changed);
    expect(userResult.ideaMap.ideas[0]?.disposition).toBe(IDEA_DISPOSITIONS.dismissed);
  });

  it("undoes only the latest structural interpretation and suppresses its unchanged proposal", () => {
    const current = map([
      idea({ id: "idea-1", substance: "Meaning one." }),
      idea({ id: "idea-2", substance: "Meaning two." }),
    ]);
    const request: IdeaStructureRequest = {
      type: IDEA_STRUCTURE_OPERATION_TYPES.merge,
      expectedRevision: current.revision,
      ideaIds: ["idea-1", "idea-2"],
      result: { title: "Together", synthesis: "Together.", assistantAssessment: assessment() },
      explanation: "They overlap.",
    };
    const changed = applyIdeaStructure({
      current,
      request,
      source: IDEA_STRUCTURE_CHANGE_SOURCES.assistant,
    }).ideaMap;
    const undone = undoLatestIdeaStructure({ current: changed, expectedRevision: changed.revision });
    expect(undone.status).toBe(IDEA_MAP_UPDATE_STATUSES.changed);
    expect(undone.ideaMap.ideas).toEqual(current.ideas);
    expect(undone.ideaMap.structuralChange).toBeUndefined();

    const repeated = applyIdeaStructure({
      current: undone.ideaMap,
      request: { ...request, expectedRevision: undone.ideaMap.revision },
      source: IDEA_STRUCTURE_CHANGE_SOURCES.assistant,
    });
    expect(repeated.status).toBe(IDEA_MAP_UPDATE_STATUSES.unchanged);
  });
});

function map(ideas: Idea[]): IdeaMap {
  return { revision: 1, ideas, potentialConflicts: [] };
}

function idea(overrides: Partial<Idea> = {}): Idea {
  return {
    id: "idea-1",
    title: "An idea",
    synthesis: "A synthesis.",
    substance: "Established meaning.",
    unresolvedQuestions: [],
    assistantAssessment: assessment(),
    userInterpretation: null,
    disposition: IDEA_DISPOSITIONS.active,
    ...overrides,
  };
}

function assessment() {
  return {
    exploration: IDEA_EXPLORATION_ASSESSMENTS.developing,
    importance: IDEA_IMPORTANCE_ASSESSMENTS.central,
  } as const;
}

function structureResult(title: string, substance: string, unresolvedQuestions: string[]) {
  return {
    title,
    synthesis: `${title} synthesis.`,
    substance,
    unresolvedQuestions,
    assistantAssessment: assessment(),
  };
}
