import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8787";
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      apps: `${repoRoot}/apps`,
      packages: `${repoRoot}/packages`,
    },
  },
  server: {
    proxy: {
      "/api": {
        target: apiBaseUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/auth": {
        target: apiBaseUrl,
        changeOrigin: true,
      },
    },
  },
});
