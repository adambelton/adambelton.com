import { describe, expect, it } from "vitest";
import { resolveProductRoute } from "apps/client/src/products/resolveProductRoute";

describe("resolveProductRoute", () => {
  it("mounts the Socratic Draft product root", () => {
    expect(
      resolveProductRoute({
        path: "",
        productSlug: "socratic-draft",
      })
    ).toMatchObject({
      status: "found",
      requiredAccess: "authenticated",
    });
  });

  it("passes nested paths to the product route renderer", () => {
    expect(
      resolveProductRoute({
        path: "editor",
        productSlug: "socratic-draft",
      })
    ).toMatchObject({
      status: "found",
      requiredAccess: "authenticated",
    });
  });

  it("preserves owner-only product route requirements", () => {
    expect(
      resolveProductRoute({
        path: "entries",
        productSlug: "socratic-draft",
      })
    ).toMatchObject({
      status: "found",
      requiredAccess: "owner",
    });
  });

  it("does not resolve unknown products", () => {
    expect(
      resolveProductRoute({
        path: "",
        productSlug: "unknown-product",
      })
    ).toMatchObject({
      status: "not_found",
    });
  });
});
