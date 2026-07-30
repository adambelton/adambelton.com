import { describe, expect, it } from "vitest";
import { renderSocraticDraftRoute } from "packages/products/src/socratic-draft/client/app/routes";

describe("renderSocraticDraftRoute", () => {
  it("marks the product root as requiring an authenticated user", () => {
    expect(renderSocraticDraftRoute({ segments: [] })).toMatchObject({
      status: "found",
      requiredAccess: "authenticated",
    });
  });

  it("allows authenticated ephemeral users into the editor", () => {
    expect(renderSocraticDraftRoute({ segments: ["editor"] })).toMatchObject({
      status: "found",
      requiredAccess: "authenticated",
    });
  });

  it("marks saved entries as owner-only", () => {
    expect(renderSocraticDraftRoute({ segments: ["entries"] })).toMatchObject({
      status: "found",
      requiredAccess: "owner",
    });
  });
});
