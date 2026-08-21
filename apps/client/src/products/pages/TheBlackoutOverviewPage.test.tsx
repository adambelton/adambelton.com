import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TheBlackoutOverviewPage } from "apps/client/src/products/pages/TheBlackoutOverviewPage";

describe("The Blackout overview page", () => {
  it("presents the football experience, writing, AI enabler, and public source", () => {
    const markup = renderToStaticMarkup(<TheBlackoutOverviewPage />);

    expect(markup).toContain(">The Blackout</h1>");
    expect(markup).toContain("A new way to consume live football");
    expect(markup).toContain("More than following the score");
    expect(markup).toContain("Football writing creates the value");
    expect(markup).toContain("AI makes the writing live");
    expect(markup).toContain("One room, one version of the match");
    expect(markup).not.toContain("The writer comes first");
    expect(markup).not.toContain("Prepare</p>");
    expect(markup).toContain("Concept prototype complete");
    expect(markup).toContain("Active development is paused");
    expect(markup).toContain("https://github.com/adambelton/the-blackout");
  });
});
