import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export so the site can be hosted anywhere (GitHub Pages, Vercel, …)
  output: "export",
  images: {
    // next/image optimization needs a server; serve originals instead
    unoptimized: true,
  },
};

export default nextConfig;
