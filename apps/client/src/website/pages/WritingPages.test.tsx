import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import { HomePage } from "apps/client/src/website/pages/HomePage";
import { WritingPostPage } from "apps/client/src/website/pages/WritingPostPage";

describe("public writing pages", () => {
  it("lists the repository post and links to its route", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(markup).toContain(">Writing</h1>");
    expect(markup).toContain(
      "Notes on products, technology, and the slow work of making ideas clearer.",
    );
    expect(markup).not.toContain("Notes, essays, and work in progress.");
    expect(markup).toContain("Portfolio Website Architecture for Dummies");
    expect(markup).toContain(
      'href="/writing/portfolio-website-architecture-for-dummies"',
    );
    expect(markup).toContain('dateTime="2026-08-06"');
    expect(markup).toContain("6 August 2026");
    expect(markup).toContain(
      "<title>Adam Belton — Software engineer and product builder</title>",
    );
    expect(markup).toContain(
      '<link href="https://adambelton.com/" rel="canonical"/>',
    );
  });

  it("renders a complete post at its dedicated route", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter
        initialEntries={[
          "/writing/portfolio-website-architecture-for-dummies",
        ]}
      >
        <Routes>
          <Route element={<WritingPostPage />} path="/writing/:slug" />
        </Routes>
      </MemoryRouter>,
    );
    expect(markup).toContain("Portfolio Website Architecture for Dummies");
    expect(markup).toContain("This website serves two purposes:");
    expect(markup).toContain(
      '<article aria-labelledby="post-title" class="min-w-0">',
    );
    expect(markup).toContain(
      'class="markdown-content max-w-2xl text-base leading-7 text-[var(--muted)]"',
    );
    expect(markup).toContain(
      "<title>Portfolio Website Architecture for Dummies — Adam Belton</title>",
    );
    expect(markup).toContain(
      '<meta content="The shopping-centre mental model that lets me see my website&#x27;s architecture with my eyes closed." name="description"/>',
    );
    expect(markup).toContain(
      '<link href="https://adambelton.com/writing/portfolio-website-architecture-for-dummies" rel="canonical"/>',
    );
    expect(markup).toContain("6 August 2026");
  });

  it("uses the host not-found experience for an unknown slug", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/writing/missing"]}>
        <Routes>
          <Route element={<WritingPostPage />} path="/writing/:slug" />
        </Routes>
      </MemoryRouter>,
    );
    expect(markup).toContain("That page does not exist.");
  });
});
