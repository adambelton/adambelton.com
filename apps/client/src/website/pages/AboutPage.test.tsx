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
      "I’m a senior product engineer with eight years of experience building complex SaaS products with React, Vue, TypeScript, Node.js and Ruby on Rails.",
    );
    expect(markup).toContain("Outside of work, I'm a die-hard Liverpool FC supporter");
    expect(markup).toContain("Up the Reds.");
    expect(markup).toContain(
      'class="mt-8 flow-root max-w-2xl"',
    );
    expect(markup).toContain(
      'class="mx-auto mb-7 w-full max-w-56 sm:float-right sm:mb-4 sm:ml-4 sm:max-w-[13rem] sm:mr-6"><img alt="Illustrated portrait of Adam Belton" class="w-full rounded-sm" decoding="async" height="800" src="/images/about/about-portrait-800.webp" width="800"',
    );
    expect(markup).toContain('class="mt-4 max-w-2xl"');
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
