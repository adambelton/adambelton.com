import { describe, expect, it } from "vitest";
import {
  ACCESS_LEVELS,
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
        accessLevel: ACCESS_LEVELS.demo,
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
        accessLevel: ACCESS_LEVELS.demo,
        components: testProductAppComponents,
        segments: ["editor"],
      })
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.authenticated,
    });
  });

  it("makes product privacy information public", () => {
    expect(
      renderSocraticDraftRoute({
        accessLevel: ACCESS_LEVELS.demo,
        components: testProductAppComponents,
        segments: ["privacy"],
      }),
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.public,
    });
  });

  it("marks saved conversations as owner-only", () => {
    expect(
      renderSocraticDraftRoute({
        accessLevel: ACCESS_LEVELS.owner,
        components: testProductAppComponents,
        segments: ["conversations"],
      })
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.owner,
    });
  });

  it("marks saved conversation detail routes as owner-only", () => {
    expect(
      renderSocraticDraftRoute({
        accessLevel: ACCESS_LEVELS.owner,
        components: testProductAppComponents,
        segments: ["conversations", "conversation-1"],
      }),
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.owner,
    });
  });

  it("keys saved conversation pages by conversation id", () => {
    const firstRoute = renderSocraticDraftRoute({
      accessLevel: ACCESS_LEVELS.owner,
      components: testProductAppComponents,
      segments: ["conversations", "conversation-1"],
    });
    const secondRoute = renderSocraticDraftRoute({
      accessLevel: ACCESS_LEVELS.owner,
      components: testProductAppComponents,
      segments: ["conversations", "conversation-2"],
    });

    expect(firstRoute.status).toBe(PRODUCT_ROUTE_STATUSES.found);
    expect(secondRoute.status).toBe(PRODUCT_ROUTE_STATUSES.found);

    if (
      firstRoute.status === PRODUCT_ROUTE_STATUSES.found &&
      secondRoute.status === PRODUCT_ROUTE_STATUSES.found
    ) {
      expect(firstRoute.element).toMatchObject({ key: "conversation-1" });
      expect(secondRoute.element).toMatchObject({ key: "conversation-2" });
    }
  });
});
