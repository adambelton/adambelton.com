import { Hono } from "hono";
import { healthRoute } from "apps/api/src/routes/health";

export const app = new Hono();

app.route("/health", healthRoute);
