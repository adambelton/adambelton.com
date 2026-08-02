import { describe, expect, it } from "vitest";
import {
  ACCESS_LEVELS,
  PRODUCT_ROUTE_ACCESSES,
  PRODUCT_ROUTE_STATUSES,
} from "packages/shared/src";
import { renderProductRoute } from "packages/products/src/socratic-draft/client/app/routes";
import type { ProductAppComponents } from "packages/products/src/socratic-draft/client/app/product-app-components";
import { DemoEditorPage } from "packages/products/src/socratic-draft/client/app/pages/DemoEditorPage";

const testProductAppComponents: ProductAppComponents = {
  navigate: () => undefined,
  Link({ children, href }) {
    return <a href={href}>{children}</a>;
  },
};

describe("renderProductRoute", () => {
  it("marks the product root as requiring an authenticated user", () => {
    expect(
      renderProductRoute({
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
      renderProductRoute({
        accessLevel: ACCESS_LEVELS.demo,
        components: testProductAppComponents,
        segments: ["editor"],
      })
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.authenticated,
      breadcrumbs: [
        { label: "Products", href: "/products" },
        { label: "Socratic Draft", href: "/products/socratic-draft" },
        { label: "Editor" },
      ],
    });
  });

  it("renders the owner at the editor route through demo mode", () => {
    const route = renderProductRoute({
      accessLevel: ACCESS_LEVELS.owner,
      components: testProductAppComponents,
      segments: ["editor"],
    });

    expect(route).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.authenticated,
      element: { type: DemoEditorPage },
    });
  });

  it("makes product privacy information public", () => {
    expect(
      renderProductRoute({
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
      renderProductRoute({
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
      renderProductRoute({
        accessLevel: ACCESS_LEVELS.owner,
        components: testProductAppComponents,
        segments: ["conversations", "conversation-1"],
      }),
    ).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.owner,
    });
  });

  it("marks persistent conversation editor routes as owner-only", () => {
    const route = renderProductRoute({
      accessLevel: ACCESS_LEVELS.owner,
      components: testProductAppComponents,
      segments: ["conversations", "conversation-1", "editor"],
    });

    expect(route).toMatchObject({
      status: PRODUCT_ROUTE_STATUSES.found,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.owner,
      element: { key: "conversation-1" },
    });
  });

  it("keys saved conversation pages by conversation id", () => {
    const firstRoute = renderProductRoute({
      accessLevel: ACCESS_LEVELS.owner,
      components: testProductAppComponents,
      segments: ["conversations", "conversation-1"],
    });
    const secondRoute = renderProductRoute({
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
