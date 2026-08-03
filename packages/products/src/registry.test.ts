import { describe, expect, it } from "vitest";
import {
  getProductById,
  getProductBySlug,
  products,
} from "packages/products/src/registry";
import { PRODUCT_IDS } from "packages/shared/src/products";

describe("product registry", () => {
  it("keeps product definitions in the product package", () => {
    const socraticDraft = getProductById(PRODUCT_IDS.socraticDraft);

    expect(socraticDraft).toBe(products[0]);
    expect(getProductBySlug("socratic-draft")).toBe(socraticDraft);
  });
});
