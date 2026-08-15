import { describe, expect, it } from "vitest";
import { createProductionApp } from "apps/api/src/bootstrap/create-production-app";

const app = createProductionApp({ staticRoot: "apps/client" });

describe("production application", () => {
  it("permanently redirects legacy writing canonicals", async () => {
    const redirectingApp = createProductionApp({
      staticRoot: "apps/client",
      writingRedirects: {
        "/writing/old-title": "/writing/new-title",
      },
    });

    const response = await redirectingApp.request("/writing/old-title");

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("/writing/new-title");
  });

  it("exposes deployment health outside the API prefix", async () => {
    const response = await app.request("/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: { service: "api", status: "ok" },
      ok: true,
    });
  });

  it("mounts product API routes beneath the public API prefix", async () => {
    const response = await app.request(
      "/api/products/thoughtform/ai-disclosure",
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
  });

  it("serves the client document for direct client-side routes", async () => {
    const response = await app.request("/writing/a-direct-deep-link");

    expect(response.status).toBe(200);
    expect(await response.text()).toContain('<div id="root"></div>');
  });

  it("serves static files without applying the SPA fallback", async () => {
    const primaryFavicon = await app.request("/public/favicon.svg");
    const fallbackFavicon = await app.request("/public/favicon.png");
    const missing = await app.request("/assets/missing.js");
    const missingRootAsset = await app.request("/missing.png");

    expect(primaryFavicon.status).toBe(200);
    expect(primaryFavicon.headers.get("content-type")).toContain("image/svg+xml");
    expect(primaryFavicon.headers.get("cache-control")).toBe("public, max-age=3600");
    expect(fallbackFavicon.status).toBe(200);
    expect(fallbackFavicon.headers.get("content-type")).toContain("image/png");
    expect(missing.status).toBe(404);
    expect(await missing.text()).not.toContain('<div id="root"></div>');
    expect(missingRootAsset.status).toBe(404);
  });
});
