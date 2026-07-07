import { Hono } from "hono";
import { success } from "@adambelton/shared";

export const healthRoute = new Hono().get("/", (context) => {
  return context.json(
    success({
      service: "api",
      status: "ok"
    })
  );
});
