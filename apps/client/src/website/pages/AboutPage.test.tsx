import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { AboutPage } from "apps/client/src/website/pages/AboutPage";

describe("AboutPage", () => {
  it("renders Adam's biography and contact route without placeholder copy", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(markup).toContain(
      "Senior software engineer building complex products around the way people actually work.",
    );
    expect(markup).toContain(
      "I’m Adam, a senior software engineer who builds complex products around the way people actually work.",
    );
    expect(markup).toContain("Over the past eight years");
    expect(markup).toContain("without displacing their judgement—both");
    expect(markup).toContain('href="mailto:hello@adambelton.com"');
    expect(markup).toContain(
      'href="https://www.linkedin.com/in/adam-b-7505693ab"',
    );
    expect(markup).toContain('href="https://github.com/adambelton"');
    expect(markup).toContain('<section aria-labelledby="contact-title" id="contact">');
    expect(markup).toContain("<title>About — Adam Belton</title>");
    expect(markup).not.toContain("placeholder");
  });
});
