import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [
      ...configDefaults.exclude,
      "packages/products/src/socratic-draft/testing/**/*.spec.ts",
    ],
  },
  resolve: {
    alias: {
      apps: fileURLToPath(new URL("apps", import.meta.url)),
      packages: fileURLToPath(new URL("packages", import.meta.url)),
    },
  },
});
