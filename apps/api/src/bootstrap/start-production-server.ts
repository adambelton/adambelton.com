import { serve } from "@hono/node-server";
import { createProductionApp } from "apps/api/src/bootstrap/create-production-app";

const port = Number(process.env.PORT ?? 8787);
const hostname = process.env.HOST ?? "0.0.0.0";
const app = createProductionApp();

serve(
  {
    fetch: app.fetch,
    hostname,
    port,
  },
  (info) => {
    console.log(`Application listening on ${hostname}:${info.port}`);
  },
);
