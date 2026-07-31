import { matchPath } from "react-router";
import { describe, expect, it } from "vitest";
import { productRoutePath } from "apps/client/src/products/productRoutePath";

describe("productRoutePath", () => {
  it("matches nested product routes with a product slug and wildcard path", () => {
    expect(
      matchPath(productRoutePath, "/products/socratic-draft/editor")
    ).toMatchObject({
      params: {
        "*": "editor",
        productSlug: "socratic-draft",
      },
    });
  });

  it("matches the product root with an empty wildcard path", () => {
    expect(
      matchPath(productRoutePath, "/products/socratic-draft")
    ).toMatchObject({
      params: {
        "*": "",
        productSlug: "socratic-draft",
      },
    });
  });
});
