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
      "Senior product engineer turning complex domains into clear, reliable software.",
    );
    expect(markup).toContain(
      'class="m-0 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-normal sm:text-7xl"',
    );
    expect(markup).toContain(
      "markdown-content max-w-2xl text-base leading-7 text-[var(--muted)]",
    );
    expect(markup).toContain(
      'class="max-w-3xl text-lg leading-8 text-[var(--muted)] mt-6"',
    );
    expect(markup).toContain(
      "I’m Adam, a senior product engineer with eight years of experience building complex SaaS products.",
    );
    expect(markup).toContain("Over the past eight years");
    expect(markup).toContain("At INDY, I joined as the third engineer");
    expect(markup).toContain("not as a substitute for human responsibility");
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
