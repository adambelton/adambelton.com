import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8787";
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const contentRoot = fileURLToPath(new URL("./src/content", import.meta.url));

export default defineConfig(async () => {
  const { contentVitePlugin } = await import(
    new URL(
      "./src/website/content/build/content-vite-plugin.ts",
      import.meta.url,
    ).href
  );
  return {
    plugins: [contentVitePlugin(contentRoot), react(), tailwindcss()],
    resolve: {
      alias: {
        apps: `${repoRoot}/apps`,
        packages: `${repoRoot}/packages`,
      },
    },
    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        "/api": {
          target: apiBaseUrl,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ""),
        },
        "/auth": {
          target: apiBaseUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
