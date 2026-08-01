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
              title: "Freedom without blame",
              synthesis: "The grief concerns lost agency rather than blame.",
              substance: "Plans feel conditional, while love and commitment remain intact.",
              unresolvedQuestions: ["Which freedom matters most?"],
              assistantAssessment: {
                exploration: "developing",
                importance: "central",
              },
              userInterpretation: "This is about agency, not escape.",
              disposition: "focused",
            },
          ],
        }}
        isBusy={false}
        onAction={async () => true}
      />,
    );

    expect(markup).toContain("Freedom without blame");
    expect(markup).toContain("The grief concerns lost agency");
    expect(markup).toContain("View substance");
    expect(markup).toContain("Plans feel conditional");
    expect(markup).toContain("Which freedom matters most?");
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
