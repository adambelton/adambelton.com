import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const apiUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:8788";
const repoRoot = fileURLToPath(new URL("../../../../../..", import.meta.url));
const clientRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: clientRoot,
  plugins: [react()],
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
        target: apiUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
