import { Hono } from "hono";
import { authRoute } from "apps/api/src/routes/auth";
import { healthRoute } from "apps/api/src/routes/health";
import { productsRoute } from "apps/api/src/routes/products";

export const app = new Hono();

app.route("/auth", authRoute);
app.route("/health", healthRoute);
app.route("/products", productsRoute);
