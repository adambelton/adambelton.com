import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OverviewPage } from "packages/products/src/socratic-draft/client/app/pages/OverviewPage";
import type { ProductAppComponents } from "packages/products/src/socratic-draft/client";

const components: ProductAppComponents = {
  navigate: () => undefined,
  Link: ({ children, href }) => <a href={href}>{children}</a>,
};

describe("Socratic Draft overview page", () => {
  it("links to the product privacy information", () => {
    const markup = renderToStaticMarkup(
      <OverviewPage components={components} />,
    );

    expect(markup).toContain(
      'href="/products/socratic-draft/privacy"',
    );
    expect(markup).toContain("Privacy information");
  });
});
