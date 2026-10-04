"use client";

import Link from "next/link";
import Reveal from "../Reveal";
import ProductCard from "../ProductCard";
import { PRODUCTS } from "@/lib/site";

export default function Bestsellers() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <Reveal>
        <div className="text-center">
          <h2 className="section-title text-3xl sm:text-4xl">Zulfira Bestsellers</h2>
          <p className="mx-auto mt-3 max-w-xl text-[14.5px] text-muted">
            The formulas our customers reorder again and again.
          </p>
        </div>
      </Reveal>
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3">
        {PRODUCTS.map((p, i) => (
          <ProductCard key={p.slug} product={p} index={i} />
        ))}
      </div>
      <Reveal className="mt-12 text-center">
        <Link
          href="/shop"
          className="btn-outline-dark inline-block rounded-full px-12 py-3.5 text-sm font-bold uppercase tracking-widest"
        >
          View all
        </Link>
      </Reveal>
    </section>
  );
}
