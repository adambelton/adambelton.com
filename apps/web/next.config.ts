import type { NextConfig } from "next";
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

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8787";

    return [
      {
        source: "/auth/:path*",
        destination: `${apiBaseUrl}/auth/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },
  transpilePackages: ["@adambelton/auth", "@adambelton/db", "@adambelton/shared"],
};

export default nextConfig;
