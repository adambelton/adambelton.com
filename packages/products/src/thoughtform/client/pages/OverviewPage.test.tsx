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
  it("presents cathartic journaling and the complete reflective loop", () => {
    const markup = renderToStaticMarkup(
      <OverviewPage accessLevel={ACCESS_LEVELS.demo} components={components} />,
    );

    expect(markup).toContain("AI-assisted cathartic journaling");
    expect(markup).toContain(
      "something is bothering you, but you cannot quite put your finger on why",
    );
    expect(markup).toContain("When it helps");
    expect(markup).toContain("How it works");
    expect(markup).toContain("Explore");
    expect(markup).toContain("Inspect");
    expect(markup).toContain("Articulate");
    expect(markup).toContain("Designed around your agency");
    expect(markup).toContain("make you more capable, not replace your judgement");
    expect(markup).toContain("not a therapist, diagnostic tool");
    expect(markup).toContain("A possible open model");
    expect(markup).toContain("rather than a commercial service");
    expect(markup).toContain("non-expiring usage credit");
    expect(markup).toContain("This is not yet how ThoughtForm is operated");
    expect(markup).toContain("Development snapshot");
    expect(markup).not.toContain("Preparing the product demo");
    expect(markup).toContain("product demo includes the complete reflective loop");
    expect(markup).toContain("user-correctable Idea Map");
    expect(markup).toContain("owner-only operational monitoring");
    expect(markup).not.toContain("audience");
    expect(markup).not.toContain("word count");
    expect(markup).not.toContain("when it is useful");
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
      <OverviewPage
        accessLevel={ACCESS_LEVELS.owner}
        components={{ ...components, isTemporaryWorkspaceAvailable: true }}
      />,
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

  it("shows the host-supplied operations link only in the owner presentation", () => {
    const ownerMarkup = renderToStaticMarkup(
      <OverviewPage
        accessLevel={ACCESS_LEVELS.owner}
        components={{
          ...components,
          isTemporaryWorkspaceAvailable: true,
          ownerOperationsHref: "/products/thoughtform/operations",
        }}
      />,
    );
    const demoMarkup = renderToStaticMarkup(
      <OverviewPage accessLevel={ACCESS_LEVELS.demo} components={components} />,
    );

    expect(ownerMarkup).toContain('href="/products/thoughtform/operations"');
    expect(demoMarkup).not.toContain("Operations");
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
