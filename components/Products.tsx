"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, ArrowRight, BadgePercent } from "lucide-react";
import Reveal, { SectionHeading } from "./Reveal";
import { PRODUCTS, formatPKR, type Product } from "@/lib/site";

function ProductCard({ product, index }: { product: Product; index: number }) {
  const isGold = product.accent === "gold";
  return (
    <Reveal delay={index * 0.12} className="h-full">
      <motion.article
        whileHover={{ y: -10 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="card-lift group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-panel"
      >
        {/* image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent" />
          <span
            className={`absolute left-5 top-5 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] backdrop-blur ${
              isGold ? "bg-gold/20 text-gold-soft border border-gold/40" : "bg-mint/15 text-mint border border-mint/40"
            }`}
          >
            {product.size}
          </span>
          {product.oldPrice && (
            <span className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full bg-void/70 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-cream backdrop-blur border border-white/15">
              <BadgePercent className="h-3.5 w-3.5 text-gold" />
              Save {formatPKR(product.oldPrice - product.price)}
            </span>
          )}
        </div>

        {/* body */}
        <div className="flex flex-1 flex-col p-7 sm:p-8">
          <p className={`text-xs font-bold uppercase tracking-[0.3em] ${isGold ? "text-gold" : "text-mint"}`}>
            {product.tagline}
          </p>
          <h3 className="font-display mt-3 text-3xl font-extrabold">{product.name}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">{product.description}</p>

          <ul className="mt-6 space-y-2.5">
            {product.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-cream/85">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${isGold ? "bg-gold/15" : "bg-mint/15"}`}>
                  <Check className={`h-3 w-3 ${isGold ? "text-gold" : "text-mint"}`} strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-end justify-between pt-8">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-extrabold text-gold-gradient">{formatPKR(product.price)}</span>
                {product.oldPrice && (
                  <span className="text-sm text-muted line-through">{formatPKR(product.oldPrice)}</span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted">Cash on Delivery available</p>
            </div>
            <a
              href={`#order?product=${product.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
                window.dispatchEvent(new CustomEvent("zulfira:select-product", { detail: product.id }));
              }}
              className="btn-gold inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
            >
              Order
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* glow edge */}
        <div
          className={`pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent ${
            isGold ? "via-gold/70" : "via-mint/70"
          } to-transparent`}
        />
      </motion.article>
    </Reveal>
  );
}

export default function Products() {
  return (
    <section id="products" className="relative py-28 sm:py-36">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-gold/8 blur-[140px]" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          kicker="The Collection"
          title={
            <>
              Two formulas. <span className="text-gold-gradient">Zero compromise.</span>
            </>
          }
          copy="Engineered like spacecraft, bottled like perfume. Meet the only two products your hair will ever need."
        />
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
