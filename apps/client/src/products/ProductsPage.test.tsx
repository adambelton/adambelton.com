import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { ProductsPage } from "apps/client/src/products/ProductsPage";

describe("ProductsPage", () => {
  it("presents the current products without provisional copy", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>,
    );

    expect(markup).toContain("<title>Products — Adam Belton</title>");
    expect(markup).toContain(
      '<link href="https://adambelton.com/products" rel="canonical"/>',
    );
    expect(markup).toContain(">Products</h1>");
    expect(markup).toContain(
      "Products and experiments built around difficult, human problems.",
    );
    expect(markup).toContain("Demo available");
    expect(markup).not.toContain("Preparing the product demo");
    expect(markup).toContain("A conversational workspace for exploring ideas");
    expect(markup).not.toContain("Through focused questions");
    expect(markup).not.toContain("Things being built");
    expect(markup).not.toContain("will live here");
  });
});
