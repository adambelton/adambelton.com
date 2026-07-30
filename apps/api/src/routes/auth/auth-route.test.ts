import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { type AuthInstance } from "packages/auth/src/auth";
import { authBasePath } from "packages/auth/src/routes";
import { createAuthRoute } from "apps/api/src/routes/auth";

function createForwardingAuthStub(): AuthInstance {
  return {
    handler: async (request) => {
      return Response.json({
        method: request.method,
        pathname: new URL(request.url).pathname,
        body: request.method === "POST" ? await request.json() : null,
      });
    },
    api: {
      getSession: async () => null,
    },
  };
}

describe("authRoute", () => {
  it("forwards GET requests mounted under the auth base path to Better Auth", async () => {
    const app = new Hono();
    app.route(authBasePath, createAuthRoute(createForwardingAuthStub()));

    const response = await app.request(`${authBasePath}/magic-link/verify?token=test-token`);

    await expect(response.json()).resolves.toEqual({
      method: "GET",
      pathname: "/auth/magic-link/verify",
      body: null,
    });
  });

  it("forwards POST requests and JSON bodies mounted under the auth base path to Better Auth", async () => {
    const app = new Hono();
    app.route(authBasePath, createAuthRoute(createForwardingAuthStub()));

    const response = await app.request(`${authBasePath}/sign-out`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    });

    await expect(response.json()).resolves.toEqual({
      method: "POST",
      pathname: "/auth/sign-out",
      body: {},
    });
  });
});
