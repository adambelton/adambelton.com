import { describe, expect, it } from "vitest";
import {
  ACCESS_LEVELS,
  PRODUCT_ROUTE_ACCESSES,
  PRODUCT_ROUTE_STATUSES,
} from "packages/shared/src";
import { resolveProductRoute } from "apps/client/src/products/resolveProductRoute";
import type { ProductAppComponents } from "packages/products/src/thoughtform/client";

const testProductAppComponents: ProductAppComponents = {
  navigate: () => undefined,
  Link({ children, href }) {
    return <a href={href}>{children}</a>;
  },
};

describe("resolveProductRoute", () => {
  it("mounts the ThoughtForm product root", () => {
    expect(
      resolveProductRoute({
        accessLevel: ACCESS_LEVELS.demo,
        components: testProductAppComponents,
        path: "",
        productSlug: "thoughtform",
      })
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.public,
    });
  });

  it("passes nested paths to the product route renderer", () => {
    expect(
      resolveProductRoute({
        accessLevel: ACCESS_LEVELS.demo,
        components: testProductAppComponents,
        path: "editor",
        productSlug: "thoughtform",
      })
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.authenticated,
    });
  });

  it("preserves public product privacy access", () => {
    expect(
      resolveProductRoute({
        accessLevel: ACCESS_LEVELS.demo,
        components: testProductAppComponents,
        path: "privacy",
        productSlug: "thoughtform",
      }),
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.public,
    });
  });

  it("preserves owner-only product route requirements", () => {
    expect(
      resolveProductRoute({
        accessLevel: ACCESS_LEVELS.owner,
        components: testProductAppComponents,
        path: "conversations",
        productSlug: "thoughtform",
      })
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.owner,
    });
  });

  it("preserves owner-only saved conversation detail requirements", () => {
    expect(
      resolveProductRoute({
        accessLevel: ACCESS_LEVELS.owner,
        components: testProductAppComponents,
        path: "conversations/conversation-1",
        productSlug: "thoughtform",
      }),
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.owner,
    });
  });

  it("preserves owner-only persistent editor requirements", () => {
    expect(
      resolveProductRoute({
        accessLevel: ACCESS_LEVELS.owner,
        components: testProductAppComponents,
        path: "conversations/conversation-1/editor",
        productSlug: "thoughtform",
      }),
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.owner,
    });
  });

  it("does not resolve unknown products", () => {
    expect(
      resolveProductRoute({
        accessLevel: ACCESS_LEVELS.demo,
        components: testProductAppComponents,
        path: "",
        productSlug: "unknown-product",
      })
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.notFound,
    });
  });
});
