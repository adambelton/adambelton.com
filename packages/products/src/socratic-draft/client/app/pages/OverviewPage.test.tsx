import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OverviewPage } from "packages/products/src/socratic-draft/client/app/pages/OverviewPage";
import type { ProductAppComponents } from "packages/products/src/socratic-draft/client";
import { ACCESS_LEVELS } from "packages/shared/src";

const components: ProductAppComponents = {
  navigate: () => undefined,
  Link: ({ children, href }) => <a href={href}>{children}</a>,
};

describe("Socratic Draft overview page", () => {
  it("links to the product privacy information", () => {
    const markup = renderToStaticMarkup(
      <OverviewPage accessLevel={ACCESS_LEVELS.demo} components={components} />,
    );

    expect(markup).toContain(
      'href="/products/socratic-draft/privacy"',
    );
    expect(markup).toContain("Privacy information");
  });

  it("links owners to saved conversations without exposing the link to demos", () => {
    const ownerMarkup = renderToStaticMarkup(
      <OverviewPage accessLevel={ACCESS_LEVELS.owner} components={components} />,
    );
    const demoMarkup = renderToStaticMarkup(
      <OverviewPage accessLevel={ACCESS_LEVELS.demo} components={components} />,
    );

    expect(ownerMarkup).toContain('href="/products/socratic-draft/conversations"');
    expect(demoMarkup).not.toContain('href="/products/socratic-draft/conversations"');
  });
});
