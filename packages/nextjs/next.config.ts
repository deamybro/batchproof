import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@hashgraph/sdk"],
  reactStrictMode: true,
};

export default nextConfig;
