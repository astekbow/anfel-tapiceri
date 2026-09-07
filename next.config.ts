import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: ["sharp"],
  devIndicators: false,
  // Vercel/serverless: fut folderin uploads/ në bundle-in e rrugës që i shërben fotot
  outputFileTracingIncludes: {
    "/uploads/[...path]": ["./uploads/**/*"],
  },
  images: {
    remotePatterns: [
      // fotot e ngarkuara në Supabase Storage
      { protocol: "https", hostname: "*.supabase.co" },
      // fotot e ngarkuara në Vercel Blob
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
