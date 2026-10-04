/**
 * ZULFIRA — dynamic product data layer.
 * ------------------------------------------------------------------
 * Pulls the live catalog from /api/products when the backend is up.
 * Every fetch is wrapped in try/catch: if the DB/API is absent (or the
 * build runs without DATABASE_URL) we fall back to the static PRODUCTS
 * from @/lib/site, so the storefront never breaks.
 */

import { PRODUCTS, productBySlug, type Product as SiteProduct } from "@/lib/site";

export type { SiteProduct };

/** Absolute base URL for server-side self-fetch (relative fetch has no host on the server). */
function baseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/**
 * Map a DB-backed product row ({id,name,slug,sku,tagline,size,salePrice,
 * compareAt,unitCost,stockQty,image,gallery,isActive}) onto the site's
 * Product shape. Fields the admin API doesn't supply yet are filled with
 * safe defaults; the gallery always resolves to at least one image so
 * next/image and the gallery UI never receive an empty/undefined src.
 */
export function toSiteProduct(db: any): SiteProduct {
  const gallery: string[] =
    Array.isArray(db?.gallery) && db.gallery.length > 0
      ? db.gallery.filter(Boolean)
      : [db?.image].filter(Boolean);

  return {
    dbId: db?.id != null ? String(db.id) : undefined,
    slug: String(db?.slug ?? ""),
    name: String(db?.name ?? "Zulfira product"),
    tagline: db?.tagline ?? "",
    size: db?.size ?? "",
    price: Number(db?.salePrice ?? 0) || 0,
    compareAt: db?.compareAt != null ? Number(db.compareAt) || undefined : undefined,
    rating: 5.0,
    reviewCount: 0,
    badge: undefined,
    categories: ["all"],
    short: db?.tagline ?? "",
    description: [],
    benefits: [],
    howToUse: [],
    ingredients: [],
    gallery: gallery.length > 0 ? gallery : [...PRODUCTS[0].gallery],
  };
}

/** Live catalog from /api/products, falling back to the static list on any failure. */
export async function getPublicProducts(): Promise<SiteProduct[]> {
  try {
    const res = await fetch(`${baseUrl()}/api/products`, { cache: "no-store" });
    if (!res.ok) throw new Error(`products api responded ${res.status}`);
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: any[] } | null;
    const rows = Array.isArray(json?.data) ? json!.data : [];
    const mapped = rows
      .filter((p) => p && p.slug && p.isActive !== false)
      .map(toSiteProduct);
    if (mapped.length === 0) throw new Error("empty live catalog");
    return mapped;
  } catch {
    return PRODUCTS;
  }
}

/** Live single product: DB catalog first, static productBySlug as final fallback. */
export async function getPublicProduct(slug: string): Promise<SiteProduct | undefined> {
  try {
    const products = await getPublicProducts();
    return products.find((p) => p.slug === slug) ?? productBySlug(slug);
  } catch {
    return productBySlug(slug);
  }
}
