import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductRouteLoading } from "apps/client/src/products/components/ProductRouteLoading";

describe("product route loading state", () => {
  it("announces that the product interface is loading", () => {
    const markup = renderToStaticMarkup(<ProductRouteLoading />);
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain("Preparing the product interface.");
  });
});
