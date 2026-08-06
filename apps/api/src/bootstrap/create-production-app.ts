import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { apiRoute } from "apps/api/src/bootstrap/create-api";
import { authRoute } from "apps/api/src/platform/auth/auth-route";
import { healthRoute } from "apps/api/src/platform/health/health-route";

type ProductionAppOptions = {
  staticRoot?: string;
};

const defaultStaticRoot = "../client/dist";

export function createProductionApp({
  staticRoot = defaultStaticRoot,
}: ProductionAppOptions = {}) {
  const app = new Hono();
  const staticFiles = serveStatic({ root: staticRoot });
  const spaDocument = serveStatic({ root: staticRoot, path: "index.html" });

  app.route("/api", apiRoute);
  app.route("/auth", authRoute);
  app.route("/health", healthRoute);

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
  app.get("*", async (context) => {
    const response = await spaDocument(context, async () => undefined);
    if (!response) return context.notFound();
    response.headers.set("Cache-Control", "no-cache");
    return response;
  });

  return app;
}

function isFileRequest(path: string) {
  return /\/[^/]+\.[^/]+$/.test(path);
}
