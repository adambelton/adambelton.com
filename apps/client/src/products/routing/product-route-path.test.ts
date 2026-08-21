import { matchPath } from "react-router";
import { describe, expect, it } from "vitest";
import { productRoutePath } from "apps/client/src/products/routing/product-route-path";

describe("productRoutePath", () => {
  it("matches nested product routes with a product slug and wildcard path", () => {
    expect(
      matchPath(productRoutePath, "/products/thoughtform/editor")
    ).toMatchObject({
      params: {
        "*": "editor",
        productSlug: "thoughtform",
      },
    });
  });

  it("matches the product root with an empty wildcard path", () => {
    expect(
      matchPath(productRoutePath, "/products/thoughtform")
    ).toMatchObject({
      params: {
        "*": "",
        productSlug: "thoughtform",
      },
    });
  });
});
