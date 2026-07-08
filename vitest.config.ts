import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      apps: fileURLToPath(new URL("apps", import.meta.url)),
      packages: fileURLToPath(new URL("packages", import.meta.url)),
    },
  },
});
