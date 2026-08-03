import { serve } from "@hono/node-server";
import { loadLocalEnvironment } from "apps/api/src/bootstrap/local-environment";

loadLocalEnvironment();

const { app } = await import("apps/api/src/bootstrap/create-api");

const port = Number(process.env.PORT ?? 8787);

serve(
  {
    fetch: app.fetch,
    port
  },
  (info) => {
    console.log(`API listening on http://localhost:${info.port}`);
  }
);
