import { describe, expect, it } from "vitest";
import {
  PRODUCT_OVERVIEW_SECTIONS,
  getProductOverviewBySlug,
  productOverviewCatalogue,
} from "apps/client/src/products/catalogue/product-overview-catalogue";
import { getProductBySlug } from "packages/products/src/registry";

describe("product overview catalogue", () => {
  it("keeps website descriptions separate from hosted products", () => {
    expect(productOverviewCatalogue.map(({ slug }) => slug)).toEqual([
      "care-calendar",
      "thoughtform",
      "the-blackout",
    ]);
    expect(getProductOverviewBySlug("the-blackout")?.catalogueSection).toBe(
      PRODUCT_OVERVIEW_SECTIONS.completed,
    );
    expect(getProductBySlug("the-blackout")).toBeUndefined();
  });
});
