import { Hono } from "hono";
import { healthRoute } from "apps/api/src/routes/health";
import { socraticDraftRoute } from "apps/api/src/routes/socratic-draft";

export const app = new Hono();

app.route("/health", healthRoute);
app.route("/products/socratic-draft", socraticDraftRoute);
