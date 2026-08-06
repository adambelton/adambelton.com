import { describe, expect, it } from "vitest";
import {
  getProductById,
  getProductBySlug,
  products,
} from "packages/products/src/registry";
import { PRODUCT_IDS } from "packages/shared/src/products";

describe("product registry", () => {
  it("keeps product definitions in the product package", () => {
    const thoughtForm = getProductById(PRODUCT_IDS.thoughtForm);

    expect(thoughtForm).toBe(products[0]);
    expect(getProductBySlug("thoughtform")).toBe(thoughtForm);
    expect(thoughtForm?.requiresAuth).toBe(false);
  });
});
