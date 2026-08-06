import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

const contentRoot = fileURLToPath(
  new URL("apps/client/src/content", import.meta.url),
);

export default defineConfig(async () => {
  const { contentVitePlugin } = await import(
    new URL(
      "apps/client/src/website/content/build/content-vite-plugin.ts",
      import.meta.url,
    ).href
  );
  return {
    plugins: [contentVitePlugin(contentRoot)],
    test: {
      exclude: [
        ...configDefaults.exclude,
        "packages/products/src/thoughtform/testing/**/*.spec.ts",
      ],
    },
    resolve: {
      alias: {
        apps: fileURLToPath(new URL("apps", import.meta.url)),
        packages: fileURLToPath(new URL("packages", import.meta.url)),
      },
    },
  };
});
