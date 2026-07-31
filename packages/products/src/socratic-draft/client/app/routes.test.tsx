import { describe, expect, it } from "vitest";
import {
  PRODUCT_ROUTE_ACCESSES,
  PRODUCT_ROUTE_STATUSES,
} from "packages/shared/src";
import { renderSocraticDraftRoute } from "packages/products/src/socratic-draft/client/app/routes";
import type { ProductAppComponents } from "packages/products/src/socratic-draft/client/app/product-app-components";

const testProductAppComponents: ProductAppComponents = {
  Link({ children, href }) {
    return <a href={href}>{children}</a>;
  },
};

describe("renderSocraticDraftRoute", () => {
  it("marks the product root as requiring an authenticated user", () => {
    expect(
      renderSocraticDraftRoute({
        components: testProductAppComponents,
        segments: [],
      })
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.authenticated,
    });
  });

  it("allows authenticated ephemeral users into the editor", () => {
    expect(
      renderSocraticDraftRoute({
        components: testProductAppComponents,
        segments: ["editor"],
      })
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.authenticated,
    });
  });

  it("marks saved entries as owner-only", () => {
    expect(
      renderSocraticDraftRoute({
        components: testProductAppComponents,
        segments: ["entries"],
      })
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.owner,
    });
  });
});
