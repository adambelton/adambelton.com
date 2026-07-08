import { Hono } from "hono";
import { success } from "packages/shared/src";

export const healthRoute = new Hono().get("/", (context) => {
  return context.json(
    success({
      service: "api",
      status: "ok"
    })
  );
});
