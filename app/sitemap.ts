import type { MetadataRoute } from "next";
import { SITE_URL, PRODUCTS, CATEGORIES, POLICIES } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/faq",
    "/challenge",
    "/gift-trial",
    "/equity",
    "/track-order",
  ];
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  for (const p of PRODUCTS) {
    entries.push({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }
  for (const c of CATEGORIES) {
    entries.push({
      url: `${SITE_URL}/collections/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }
  for (const slug of Object.keys(POLICIES)) {
    entries.push({
      url: `${SITE_URL}/policies/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    });
  }
  return entries;
}
