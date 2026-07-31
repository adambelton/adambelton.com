import { describe, expect, it } from "vitest";
import {
  PRODUCT_ROUTE_ACCESSES,
  PRODUCT_ROUTE_STATUSES,
} from "packages/shared/src";
import { resolveProductRoute } from "apps/client/src/products/resolveProductRoute";
import type { ProductAppComponents } from "packages/products/src/socratic-draft/client";

const testProductAppComponents: ProductAppComponents = {
  Link({ children, href }) {
    return <a href={href}>{children}</a>;
  },
};

describe("resolveProductRoute", () => {
  it("mounts the Socratic Draft product root", () => {
    expect(
      resolveProductRoute({
        components: testProductAppComponents,
        path: "",
        productSlug: "socratic-draft",
      })
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.authenticated,
    });
  });

  it("passes nested paths to the product route renderer", () => {
    expect(
      resolveProductRoute({
        components: testProductAppComponents,
        path: "editor",
        productSlug: "socratic-draft",
      })
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.authenticated,
    });
  });

  it("preserves owner-only product route requirements", () => {
    expect(
      resolveProductRoute({
        components: testProductAppComponents,
        path: "conversations",
        productSlug: "socratic-draft",
      })
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.owner,
    });
  });

  it("preserves owner-only saved conversation detail requirements", () => {
    expect(
      resolveProductRoute({
        components: testProductAppComponents,
        path: "conversations/conversation-1",
        productSlug: "socratic-draft",
      }),
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.owner,
    });
  });

  it("does not resolve unknown products", () => {
    expect(
      resolveProductRoute({
        components: testProductAppComponents,
        path: "",
        productSlug: "unknown-product",
      })
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.notFound,
    });
  });
});
