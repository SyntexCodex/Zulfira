import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dynamic app: storefront + API routes + admin panel, hosted on Vercel.
  images: {
    // Vercel provides the image optimization server: auto WebP/AVIF,
    // responsive sizes. Critical for low-bandwidth users.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  },
};

export default nextConfig;
