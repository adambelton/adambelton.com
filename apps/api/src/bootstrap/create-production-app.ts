import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { apiRoute } from "apps/api/src/bootstrap/create-api";
import { authRoute } from "apps/api/src/platform/auth/auth-route";
import { healthRoute } from "apps/api/src/platform/health/health-route";

type ProductionAppOptions = {
  staticRoot?: string;
  writingRedirects?: Record<string, string>;
};

const defaultStaticRoot = "../client/dist";

export function createProductionApp({
  staticRoot = defaultStaticRoot,
  writingRedirects = loadWritingRedirects(staticRoot),
}: ProductionAppOptions = {}) {
  const app = new Hono();
  const staticFiles = serveStatic({ root: staticRoot });
  const spaDocument = serveStatic({ root: staticRoot, path: "index.html" });

  app.route("/api", apiRoute);
  app.route("/auth", authRoute);
  app.route("/health", healthRoute);

  app.get("/writing/:slug", (context, next) => {
    const destination = writingRedirects[context.req.path];
    return destination ? context.redirect(destination, 301) : next();
  });

  app.get("*", async (context, next) => {
    if (!isFileRequest(context.req.path)) {
      return next();
    }

    const response = await staticFiles(context, async () => undefined);
    if (response) {
      response.headers.set(
        "Cache-Control",
        context.req.path.startsWith("/assets/")
          ? "public, max-age=31536000, immutable"
          : "public, max-age=3600",
      );
    }
    return response ?? context.notFound();
  });
  app.get("*", staticFiles);
  app.get("*", async (context, next) => {
    const routeDocument = serveStatic({
      root: staticRoot,
      path: `${context.req.path.replace(/^\//, "").replace(/\/$/, "")}/index.html`,
    });
    const response = await routeDocument(context, async () => undefined);
    if (!response) return next();
    response.headers.set("Cache-Control", "no-cache");
    return response;
  });
  app.get("*", async (context) => {
    const response = await spaDocument(context, async () => undefined);
    if (!response) return context.notFound();
    response.headers.set("Cache-Control", "no-cache");
    return response;
  });

  return app;
}

function loadWritingRedirects(staticRoot: string): Record<string, string> {
  const path = join(staticRoot, "writing-redirects.json");
  if (!existsSync(path)) return {};
  const value: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${path} must contain a JSON object.`);
  }
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] =>
        entry.every((part) => typeof part === "string") &&
        entry[0].startsWith("/writing/") &&
        entry[1].startsWith("/writing/"),
    ),
  );
}

function isFileRequest(path: string) {
  return /\/[^/]+\.[^/]+$/.test(path);
}
