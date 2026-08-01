import { describe, expect, it } from "vitest";
import {
  applyIdeaAction,
  applyProposedIdeas,
  MAX_ACTIVE_IDEAS,
  parseProposedIdeas,
} from "packages/products/src/socratic-draft/server/idea-map";
import {
  IDEA_ACTION_TYPES,
  IDEA_DISPOSITIONS,
  type Idea,
  type IdeaMap,
} from "packages/products/src/socratic-draft/shared";

describe("idea map", () => {
  it("rejects an unbounded list of unresolved questions", () => {
    expect(
      parseProposedIdeas([
        {
          ...idea(),
          id: null,
          unresolvedQuestions: ["One?", "Two?", "Three?", "Four?"],
        },
      ]),
    ).toBeNull();
  });
  it("enriches an existing idea without changing its identity or user meaning", () => {
    const current = map([idea({ userInterpretation: "This is about agency." })]);
    const result = applyProposedIdeas({
      current,
      proposedIdeas: [
        {
          id: "idea-1",
          title: "A smaller life",
          synthesis: "The loss concerns agency rather than blame.",
          substance: "The user misses spontaneity. Plans now feel conditional, while love and commitment remain intact.",
          unresolvedQuestions: ["Which freedom matters most?"],
          disposition: IDEA_DISPOSITIONS.active,
          assistantAssessment: {
            exploration: "developing",
            importance: "central",
          },
        },
      ],
    });

    expect(result.status).toBe("changed");
    expect(result.ideaMap.ideas).toHaveLength(1);
    expect(result.ideaMap.ideas[0]).toMatchObject({
      id: "idea-1",
      title: "A smaller life",
      userInterpretation: "This is about agency.",
      substance: expect.stringContaining("Plans now feel conditional"),
    });
  });

  it("does not add another active idea at the provisional active bound", () => {
    const current = map(
      Array.from({ length: MAX_ACTIVE_IDEAS }, (_, index) =>
        idea({ id: `idea-${index + 1}`, title: `Idea ${index + 1}` }),
      ),
    );
    const result = applyProposedIdeas({
      current,
      proposedIdeas: [
        {
          id: null,
          title: "Another idea",
          synthesis: "Another synthesis",
          substance: "Another substance",
          unresolvedQuestions: [],
          disposition: IDEA_DISPOSITIONS.active,
          assistantAssessment: idea().assistantAssessment,
        },
      ],
    });
    expect(result.status).toBe("unchanged");
    expect(result.ideaMap.ideas).toHaveLength(MAX_ACTIVE_IDEAS);
  });

  it("records user satisfaction without rewriting the assistant assessment", () => {
    const current = map([idea()]);
    const result = applyIdeaAction({
      current,
      ideaId: "idea-1",
      request: {
        action: IDEA_ACTION_TYPES.satisfy,
        expectedRevision: current.revision,
      },
    });
    expect(result.ideaMap.ideas[0]).toMatchObject({
      disposition: IDEA_DISPOSITIONS.satisfied,
      assistantAssessment: current.ideas[0]?.assistantAssessment,
    });
  });

  it("enriches dismissed historical material without silently reactivating it", () => {
    const current = map([idea({ disposition: IDEA_DISPOSITIONS.dismissed })]);
    const existing = current.ideas[0];
    if (!existing) throw new Error("Expected an idea.");
    const result = applyProposedIdeas({
      current,
      proposedIdeas: [
        {
          id: existing.id,
          title: existing.title,
          synthesis: "The tangent is better understood but remains excluded.",
          substance: `${existing.substance}\nLater evidence clarifies why it was tangential.`,
          unresolvedQuestions: [],
          disposition: IDEA_DISPOSITIONS.active,
          assistantAssessment: existing.assistantAssessment,
        },
      ],
    });
    expect(result.ideaMap.ideas[0]?.disposition).toBe(
      IDEA_DISPOSITIONS.dismissed,
    );
  });

  it("supports sustained enrichment of one identity across a long focused exploration", () => {
    let current = map([idea({ disposition: IDEA_DISPOSITIONS.focused })]);
    for (let turn = 1; turn <= 12; turn += 1) {
      const existing = current.ideas[0];
      if (!existing) throw new Error("Expected the focused idea.");
      const result = applyProposedIdeas({
        current,
        proposedIdeas: [
          {
            id: existing.id,
            title: existing.title,
            synthesis: `The idea now integrates ${turn} explored perspectives.`,
            substance: `${existing.substance}\nPerspective ${turn} adds another distinction, example, tension, or counterargument.`,
            unresolvedQuestions: [`What remains after perspective ${turn}?`],
            disposition: existing.disposition,
            assistantAssessment: {
              ...existing.assistantAssessment,
              exploration: turn < 10 ? "developing" : "well_explored",
            },
          },
        ],
      });
      current = result.ideaMap;
    }
    expect(current.ideas).toHaveLength(1);
    expect(current.ideas[0]?.id).toBe("idea-1");
    expect(current.ideas[0]?.substance).toContain("Perspective 1");
    expect(current.ideas[0]?.substance).toContain("Perspective 12");
    expect(current.ideas[0]?.assistantAssessment.exploration).toBe(
      "well_explored",
    );
  });
});

function map(ideas: Idea[]): IdeaMap {
  return { revision: 1, ideas };
}

function idea(overrides: Partial<Idea> = {}): Idea {
  return {
    id: "idea-1",
    title: "Loss of freedom",
    synthesis: "The user is grieving lost agency.",
    substance: "Spontaneity and open time have become scarce.",
    unresolvedQuestions: [],
    assistantAssessment: {
      exploration: "emerging",
      importance: "central",
    },
    userInterpretation: null,
    disposition: IDEA_DISPOSITIONS.active,
    ...overrides,
  };
}
