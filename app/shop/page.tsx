import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shop All Products — Zulfira",
  description: "Shop Zulfira's complete range: Revitalizing Hair Oil, Sulphate-Free Shampoo and the Complete Ritual Bundle.",
};

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="text-center">
        <p className="eyebrow-red">The Collection</p>
        <h1 className="section-title mt-3 text-4xl sm:text-5xl">Shop All</h1>
        <p className="mx-auto mt-3 max-w-xl text-[14.5px] text-muted">
          Two signature formulas and one complete ritual — no endless shelves, no confusion.
        </p>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3">
        {PRODUCTS.map((p, i) => (
          <ProductCard key={p.slug} product={p} index={i} />
        ))}
      </div>
    </div>
  );
}
