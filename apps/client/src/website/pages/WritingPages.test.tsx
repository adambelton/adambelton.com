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
    expect(markup).toContain("First post (placeholder)");
    expect(markup).toContain('href="/writing/first-post"');
    expect(markup).toContain('dateTime="2026-08-06"');
  });

  it("renders a complete post at its dedicated route", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/writing/first-post"]}>
        <Routes>
          <Route element={<WritingPostPage />} path="/writing/:slug" />
        </Routes>
      </MemoryRouter>,
    );
    expect(markup).toContain("First post (placeholder)");
    expect(markup).toContain("This is a placeholder for the first writing post.");
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
