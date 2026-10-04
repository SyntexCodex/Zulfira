import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dynamic app: storefront + API routes + admin panel, hosted on Vercel.
  images: {
    // next/image optimization needs a server; Vercel provides it, but keep
    // unoptimized:true for zero-risk deploys (originals served as-is).
    unoptimized: true,
  },
};

export default nextConfig;
