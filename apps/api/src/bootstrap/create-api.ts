import { Hono } from "hono";
import { authRoute } from "apps/api/src/platform/auth/auth-route";
import { healthRoute } from "apps/api/src/platform/health/health-route";
import { socraticDraftRoute } from "apps/api/src/products/socratic-draft/mount";

export const app = new Hono();

app.route("/auth", authRoute);
app.route("/health", healthRoute);
app.route("/products/socratic-draft", socraticDraftRoute);
