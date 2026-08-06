import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "apps/client/src/ui/layout/SiteFooter";

describe("SiteFooter", () => {
  it("keeps global navigation focused on privacy", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );

    expect(markup).toContain('href="/privacy"');
    expect(markup).not.toContain("mailto:");
  });
});
