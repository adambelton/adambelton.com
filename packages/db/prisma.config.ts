import { defineConfig } from "prisma/config";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

const localEnvPath = fileURLToPath(new URL("../../.env.local", import.meta.url));

if (existsSync(localEnvPath)) {
  const localEnv = parseEnv(readFileSync(localEnvPath, "utf8"));

  for (const [key, value] of Object.entries(localEnv)) {
    process.env[key] ??= value;
  }
}

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/adambelton_dev?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
