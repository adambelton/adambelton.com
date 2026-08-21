import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductOverviewSection } from "apps/client/src/products/components/ProductOverviewSection";

describe("ProductOverviewSection", () => {
  it("renders the shared labelled section and divider structure", () => {
    const markup = renderToStaticMarkup(
      <ProductOverviewSection
        contentClassName="grid custom-layout"
        id="example-title"
        title="Example"
      >
        <p>Section content.</p>
      </ProductOverviewSection>,
    );

    expect(markup).toContain('<section aria-labelledby="example-title">');
    expect(markup).toContain('<h2 class="eyebrow mb-5" id="example-title">');
    expect(markup).toContain(
      'class="grid custom-layout border-t border-[var(--line)] pt-5"',
    );
  });
});
