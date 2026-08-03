import { serve } from "@hono/node-server";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

const localEnvPath = fileURLToPath(new URL("../../../../.env.local", import.meta.url));

if (existsSync(localEnvPath)) {
  const localEnv = parseEnv(readFileSync(localEnvPath, "utf8"));

  for (const [key, value] of Object.entries(localEnv)) {
    process.env[key] ??= value;
  }
}

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
