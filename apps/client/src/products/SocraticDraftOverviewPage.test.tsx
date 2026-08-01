import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SocraticDraftOverviewPage } from "packages/products/src/socratic-draft/client/app/overview/SocraticDraftOverviewPage";
import type { ProductAppComponents } from "packages/products/src/socratic-draft/client";

const components: ProductAppComponents = {
  Link: ({ children, href }) => <a href={href}>{children}</a>,
};

describe("Socratic Draft overview page", () => {
  it("links to the product privacy information", () => {
    const markup = renderToStaticMarkup(
      <SocraticDraftOverviewPage components={components} />,
    );

    expect(markup).toContain(
      'href="/products/socratic-draft/privacy"',
    );
    expect(markup).toContain("Privacy information");
  });
});
