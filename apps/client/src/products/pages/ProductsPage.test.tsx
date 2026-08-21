import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { ProductsPage } from "apps/client/src/products/pages/ProductsPage";

describe("ProductsPage", () => {
  it("groups current and completed projects with accurate status copy", () => {
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
    expect(markup).toContain(">Current</h2>");
    expect(markup).toContain(">Completed</h2>");
    expect(markup).toContain("Demo available");
    expect(markup).toContain("In definition");
    expect(markup).toContain("Concept prototype complete");
    expect(markup.indexOf("Care Calendar")).toBeLessThan(markup.indexOf("ThoughtForm"));
    expect(markup.indexOf("ThoughtForm")).toBeLessThan(markup.indexOf(">Completed</h2>"));
    expect(markup.indexOf("The Blackout")).toBeGreaterThan(markup.indexOf(">Completed</h2>"));
    expect(markup).toContain("md:grid-cols-2");
    expect(markup).toContain("xl:grid-cols-3");
    expect(markup.match(/w-full border-b/g)).toHaveLength(2);
    expect(markup).not.toContain("w-full border-t");
    expect(markup).not.toContain("/images/products/");
    expect(markup).not.toContain("Preparing the product demo");
    expect(markup).toContain("A conversational workspace for exploring ideas");
    expect(markup).not.toContain("Through focused questions");
    expect(markup).not.toContain("Things being built");
    expect(markup).not.toContain("will live here");
  });
});
