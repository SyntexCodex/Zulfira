import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PRODUCTS, productBySlug, formatPKR, SITE_URL } from "@/lib/site";
import { getPublicProduct, getPublicProducts } from "@/lib/products";
import ProductView from "./ProductView";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getPublicProduct(slug)) ?? productBySlug(slug);
  if (!p) return {};
  return {
    title: `${p.name} — Zulfira`,
    description: p.short,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: {
      title: `${p.name} — Zulfira`,
      description: p.short,
      url: `/product/${p.slug}`,
      type: "website",
      images: p.gallery.slice(0, 1).map((g) => ({ url: g, alt: p.name })),
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = (await getPublicProduct(slug)) ?? productBySlug(slug);
  if (!product) notFound();
  const related = (await getPublicProducts()).filter((p) => p.slug !== slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short,
    image: product.gallery.map((g) => `${SITE_URL}${g}`),
    brand: { "@type": "Brand", name: "Zulfira" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: "PKR",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${SITE_URL}/product/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductView product={product} related={related} />
    </>
  );
}
