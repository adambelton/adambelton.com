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

    expect(thoughtForm).toBe(
      products.find((product) => product.id === PRODUCT_IDS.thoughtForm),
    );
    expect(getProductBySlug("thoughtform")).toBe(thoughtForm);
    expect(thoughtForm?.requiresAuth).toBe(false);
    expect(products.map(({ id }) => id)).toEqual([PRODUCT_IDS.thoughtForm]);
    expect(getProductBySlug("care-calendar")).toBeUndefined();
    expect(getProductBySlug("the-blackout")).toBeUndefined();
  });
});
