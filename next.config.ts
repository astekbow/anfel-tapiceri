import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: ["sharp"],
  devIndicators: false,
};

export default nextConfig;
