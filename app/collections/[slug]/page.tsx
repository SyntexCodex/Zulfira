import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES, categoryBySlug, productsInCategory } from "@/lib/site";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = categoryBySlug(slug);
  return c ? { title: `${c.name} — Zulfira`, description: c.tagline } : {};
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) notFound();
  const products = productsInCategory(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="text-center">
        <p className="eyebrow-red">Collection</p>
        <h1 className="section-title mt-3 text-4xl sm:text-5xl">{category.name}</h1>
        <p className="mx-auto mt-3 max-w-xl text-[14.5px] text-muted">{category.tagline}</p>
      </div>
      {products.length === 0 ? (
        <p className="py-16 text-center text-muted">No products in this collection yet.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3">
          {products.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
