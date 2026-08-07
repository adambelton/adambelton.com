import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OverviewPage } from "packages/products/src/thoughtform/client/pages/OverviewPage";
import type { ProductAppComponents } from "packages/products/src/thoughtform/client";
import { ACCESS_LEVELS } from "packages/shared/src";

const components: ProductAppComponents = {
  navigate: () => undefined,
  Link: ({ children, href }) => <a href={href}>{children}</a>,
};

describe("ThoughtForm overview page", () => {
  it("presents conversational thinking and an optional user-owned Draft", () => {
    const markup = renderToStaticMarkup(
      <OverviewPage accessLevel={ACCESS_LEVELS.demo} components={components} />,
    );

    expect(markup).toContain("Explore what you think or feel through conversation");
    expect(markup).toContain("when it is useful");
    expect(markup).toContain("remains yours to shape");
    expect(markup).not.toContain("audience");
    expect(markup).not.toContain("word count");
  });

  it("links to the product privacy information", () => {
    const markup = renderToStaticMarkup(
      <OverviewPage accessLevel={ACCESS_LEVELS.demo} components={components} />,
    );

    expect(markup).toContain(
      'href="/products/thoughtform/privacy"',
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

    expect(ownerMarkup).toContain('href="/products/thoughtform/conversations"');
    expect(ownerMarkup).toContain('href="/products/thoughtform/editor"');
    expect(demoMarkup).not.toContain('href="/products/thoughtform/conversations"');
    expect(demoMarkup).not.toContain('href="/products/thoughtform/editor"');
    expect(demoMarkup).not.toContain("editor demo");
  });

  it("makes the temporary workspace discoverable when the host enables it", () => {
    const markup = renderToStaticMarkup(
      <OverviewPage
        accessLevel={ACCESS_LEVELS.demo}
        components={{ ...components, isTemporaryWorkspaceAvailable: true }}
      />,
    );

    expect(markup).toContain('href="/products/thoughtform/editor"');
    expect(markup).not.toContain('href="/products/thoughtform/conversations"');
  });
});
