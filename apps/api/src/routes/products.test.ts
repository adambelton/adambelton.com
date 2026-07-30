import { describe, expect, it } from "vitest";
import { app } from "apps/api/src/server";
import type { ApiResponse } from "packages/shared/src";

describe("products API route mount", () => {
  it("routes Socratic Draft conversation requests through the product API entrypoint", async () => {
    const response = await app.request(
      "/products/socratic-draft/conversation/respond",
      {
        method: "POST",
        body: JSON.stringify({
          entryId: null,
          message: "This route should be product-mounted.",
        }),
        headers: {
          "content-type": "application/json",
        },
      },
    );

    const body = (await response.json()) as ApiResponse<unknown>;

    expect(response.status).toBe(401);
    expect(body).toEqual({
      ok: false,
      error: {
        code: "unauthorized",
        message: "Sign in to continue the conversation.",
      },
    });
  });
});
