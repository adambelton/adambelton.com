import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { IdeaMapTracker } from "packages/products/src/socratic-draft/client/app/components/editor/IdeaMapTracker";

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
      />,
    );
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("disabled");
  });
});
