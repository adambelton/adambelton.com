import { Hono } from "hono";
import { authRoute } from "apps/api/src/platform/auth/auth-route";
import { healthRoute } from "apps/api/src/platform/health/health-route";
import { thoughtFormRoute } from "apps/api/src/products/thoughtform/mount";

export const app = new Hono();

app.route("/auth", authRoute);
app.route("/health", healthRoute);
app.route("/products/thoughtform", thoughtFormRoute);
