import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductOverviewSubsection } from "apps/client/src/products/components/ProductOverviewSubsection";

describe("ProductOverviewSubsection", () => {
  it("renders a level-three heading with its associated content", () => {
    const markup = renderToStaticMarkup(
      <ProductOverviewSubsection title="Example">
        <p>Subsection content.</p>
      </ProductOverviewSubsection>,
    );

    expect(markup).toContain('<h3 class="text-xl font-semibold">Example</h3>');
    expect(markup).toContain(
      '<div class="mt-2 text-base leading-7 text-[var(--muted)]"><p>Subsection content.</p></div>',
    );
  });
});
