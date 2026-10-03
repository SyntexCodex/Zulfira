import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import Reveal, { SectionHeading } from "@/components/Reveal";
import { PRODUCTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shop All Products — Zulfira",
  description: "Shop Zulfira's complete range: Revitalizing Hair Oil, Sulphate-Free Shampoo and the Complete Ritual Bundle.",
};

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        eyebrow="The Collection"
        title={<>Everything your hair needs.</>}
        copy="Two signature formulas and one complete ritual — no endless shelves, no confusion."
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((p, i) => (
          <ProductCard key={p.slug} product={p} index={i} />
        ))}
      </div>

      <Reveal className="mt-14">
        <div className="card flex flex-col items-center gap-4 bg-cream p-8 text-center sm:p-10">
          <p className="eyebrow">Not sure where to start?</p>
          <p className="font-display max-w-xl text-2xl font-semibold leading-snug">
            Take the Complete Ritual Bundle — oil + shampoo, designed to work as one.
          </p>
          <a href="/product/complete-ritual-bundle" className="btn-primary rounded-full px-8 py-3.5 text-sm font-semibold">
            Shop the Bundle
          </a>
        </div>
      </Reveal>
    </div>
  );
}
