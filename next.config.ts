import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export so the site can be hosted on GitHub Pages
  output: "export",
  // Project site lives at https://<user>.github.io/Zulfira/
  basePath: "/Zulfira",
  images: {
    // next/image optimization needs a server; serve originals instead
    unoptimized: true,
  },
};

export default nextConfig;
