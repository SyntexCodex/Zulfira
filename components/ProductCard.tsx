"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingBag } from "lucide-react";
import { type Product, formatPKR, discountPct } from "@/lib/site";
import { useCart } from "@/lib/cart";
import Reveal from "./Reveal";

export function Stars({ rating, className = "h-3.5 w-3.5" }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${className} ${i < Math.round(rating) ? "fill-gold text-gold" : "fill-sand text-sand"}`}
        />
      ))}
    </span>
  );
}

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add, setOpen } = useCart();
  const pct = discountPct(product);

  return (
    <Reveal delay={(index % 3) * 0.08} className="h-full">
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="card card-hover group relative flex h-full flex-col overflow-hidden"
      >
        <Link href={`/product/${product.slug}`} className="relative block aspect-[4/4.4] overflow-hidden bg-cream">
          <Image
            src={product.gallery[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.badge && (
              <span className="rounded-full bg-pine px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                {product.badge}
              </span>
            )}
            {pct > 0 && (
              <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink">
                -{pct}%
              </span>
            )}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); add(product.slug); setOpen(true); }}
            aria-label={`Add ${product.name} to cart`}
            className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-pine opacity-0 shadow-lg transition-all duration-300 hover:bg-pine hover:text-white group-hover:opacity-100"
          >
            <ShoppingBag className="h-5 w-5" />
          </button>
        </Link>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-2">
            <Stars rating={product.rating} />
            <span className="text-xs text-muted">({product.reviewCount})</span>
          </div>
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-display mt-2 text-[19px] font-semibold leading-snug hover:text-pine">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 text-[13px] text-muted">{product.tagline} · {product.size}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-[22px] font-bold text-pine">{formatPKR(product.price)}</span>
            {product.compareAt && (
              <span className="text-sm text-muted line-through">{formatPKR(product.compareAt)}</span>
            )}
          </div>
          <button
            onClick={() => { add(product.slug); setOpen(true); }}
            className="btn-primary mt-4 rounded-full py-2.5 text-sm font-semibold"
          >
            Add to Cart
          </button>
        </div>
      </motion.article>
    </Reveal>
  );
}
