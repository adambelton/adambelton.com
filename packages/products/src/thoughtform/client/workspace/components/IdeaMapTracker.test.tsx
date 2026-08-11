import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { IdeaMapTracker } from "packages/products/src/thoughtform/client/workspace/components/IdeaMapTracker";
import {
  IDEA_STRUCTURE_CHANGE_SOURCES,
  IDEA_STRUCTURE_OPERATION_TYPES,
} from "packages/products/src/thoughtform/shared";

describe("IdeaMapTracker", () => {
  it("presents explored material and limited qualitative assessments without assistant hypotheses", () => {
    const markup = renderToStaticMarkup(
      <IdeaMapTracker
        ideaMap={{
          revision: 3,
          ideas: [
            {
              id: "idea-1",
              title: "Leadership without accountability",
              synthesis: "Infantino's FIFA uses football's authority while resisting scrutiny.",
              substance: "Football gives FIFA legitimacy, but its leadership is not the game itself.",
              unresolvedQuestions: ["How can football withdraw unearned legitimacy?"],
              assistantAssessment: {
                exploration: "developing",
                importance: "central",
              },
              userInterpretation: "My objection is to unaccountable power, not to football.",
              disposition: "focused",
            },
          ],
        }}
        isBusy={false}
        onAction={async () => true}
        onStructure={async () => true}
      />,
    );

    expect(markup).toContain("Leadership without accountability");
    expect(markup).toContain("uses football&#x27;s authority");
    expect(markup).toContain("View substance");
    expect(markup).toContain("Football gives FIFA legitimacy");
    expect(markup).toContain("How can football withdraw unearned legitimacy?");
    expect(markup).toContain("Developing");
    expect(markup).toContain("Appears to be central");
    expect(markup).toContain("Assessments are qualitative, not objective scores");
  });

  it("explains an automatic structural interpretation and offers immediate undo", () => {
    const markup = renderToStaticMarkup(
      <IdeaMapTracker
        ideaMap={{
          revision: 4,
          ideas: [{
            id: "idea-1",
            title: "Combined idea",
            synthesis: "A synthesis",
            substance: "Substance",
            unresolvedQuestions: [],
            assistantAssessment: { exploration: "developing", importance: "central" },
            userInterpretation: null,
            disposition: "active",
          }],
          structuralChange: {
            type: IDEA_STRUCTURE_OPERATION_TYPES.merge,
            source: IDEA_STRUCTURE_CHANGE_SOURCES.assistant,
            explanation: "These ideas described the same concern.",
            signature: "signature",
            insertionIndex: 0,
            previousIdeas: [],
            previousPotentialConflicts: [],
            resultIdeaIds: ["idea-1"],
          },
        }}
        isBusy={false}
        onAction={async () => true}
        onStructure={async () => true}
      />,
    );
    expect(markup).toContain("Idea map reorganised");
    expect(markup).toContain("These ideas described the same concern.");
    expect(markup).toContain("Undo reorganisation");
  });

  it("disables mutating controls while the workspace is busy", () => {
    const markup = renderToStaticMarkup(
      <IdeaMapTracker
        ideaMap={{
          revision: 1,
          ideas: [
            {
              id: "idea-1",
              title: "An idea",
              synthesis: "A synthesis",
              substance: "Substance",
              unresolvedQuestions: [],
              assistantAssessment: {
                exploration: "emerging",
                importance: "supporting",
              },
              userInterpretation: null,
              disposition: "active",
            },
          ],
        }}
        isBusy
        onAction={async () => true}
        onStructure={async () => true}
      />,
    );
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("disabled");
  });
});
