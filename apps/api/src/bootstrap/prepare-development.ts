import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadLocalEnvironment } from "apps/api/src/bootstrap/local-environment";

loadLocalEnvironment();
process.env.NODE_ENV ??= "development";

if (process.env.DATABASE_URL) {
  const repositoryRoot = fileURLToPath(
    new URL("../../../../", import.meta.url),
  );
  const migration = spawnSync("pnpm", ["db:migrate:deploy"], {
    cwd: repositoryRoot,
    env: process.env,
    stdio: "inherit",
  });
  if (migration.error) throw migration.error;
  if (migration.status !== 0) {
    throw new Error("Pending database migrations could not be applied.");
  }
} else {
  console.log("DATABASE_URL is not configured; starting with in-memory persistence.");
}
