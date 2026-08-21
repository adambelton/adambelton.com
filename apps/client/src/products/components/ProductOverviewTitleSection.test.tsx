import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductOverviewTitleSection } from "apps/client/src/products/components/ProductOverviewTitleSection";

describe("ProductOverviewTitleSection", () => {
  it("renders the shared labelled title, introduction, and optional actions", () => {
    const markup = renderToStaticMarkup(
      <ProductOverviewTitleSection
        description="A description."
        id="example-title"
        tagline="A concise proposition."
        title="Example"
      >
        <a href="/example">Open example</a>
      </ProductOverviewTitleSection>,
    );

    expect(markup).toContain('<section aria-labelledby="example-title">');
    expect(markup).toContain('id="example-title">Example</h1>');
    expect(markup).toContain("A concise proposition.");
    expect(markup).toContain("A description.");
    expect(markup).toContain('<a href="/example">Open example</a>');
  });
});
