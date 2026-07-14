import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_BASE_URL ?? "http://localhost:8787"}/:path*`,
      },
    ];
  },
  transpilePackages: ["@adambelton/shared"],
};

export default nextConfig;
