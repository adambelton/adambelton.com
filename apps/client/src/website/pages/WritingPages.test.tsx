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
    expect(markup).toContain("How a shopping-centre mental model lets me see my personal website");
    expect(markup).toContain("md:grid-cols-2 xl:grid-cols-3");
    expect(markup).toContain("border-[var(--line-subtle)]");
    expect(markup).toContain(
      'src="/images/writing/shopping-centre-website-architecture/cover-1000x420.jpg"',
    );
    expect(markup).toContain(
      'href="/writing/shopping-centre-website-architecture"',
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
          "/writing/shopping-centre-website-architecture",
        ]}
      >
        <Routes>
          <Route element={<WritingPostPage />} path="/writing/:slug" />
        </Routes>
      </MemoryRouter>,
    );
    expect(markup).toContain("How a shopping-centre mental model lets me see my personal website");
    expect(markup).toContain("This website serves two purposes:");
    expect(markup).toContain("A shopping-centre model for my website architecture");
    expect(markup).toContain(
      '<article aria-labelledby="post-title" class="min-w-0">',
    );
    expect(markup).toContain(
      'class="markdown-content max-w-2xl text-base leading-7 text-[var(--muted)]"',
    );
    expect(markup).toContain(
      "<title>How a shopping-centre mental model lets me see my personal website&#x27;s ports-and-adapters architecture with my eyes closed — Adam Belton</title>",
    );
    expect(markup).toContain(
      '<meta content="The shopping-centre mental model that lets me see my website&#x27;s architecture with my eyes closed." name="description"/>',
    );
    expect(markup).toContain(
      '<link href="https://adambelton.com/writing/shopping-centre-website-architecture" rel="canonical"/>',
    );
    expect(markup).toContain(
      '<meta content="https://adambelton.com/images/writing/shopping-centre-website-architecture/cover-2000x840.jpg" property="og:image"/>',
    );
    expect(markup).toContain('property="og:type"');
    expect(markup).toContain('type="application/ld+json"');
    expect(markup).toContain(
      'src="/images/writing/shopping-centre-website-architecture/cover-2000x840.jpg"',
    );
    expect(markup.indexOf("cover-2000x840.jpg")).toBeLessThan(markup.indexOf('id="post-title"'));
    expect(markup).toContain('<header class="mt-12">');
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
