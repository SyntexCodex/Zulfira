"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { type Product, formatPKR, discountPct } from "@/lib/site";
import { useCart } from "@/lib/cart";
import Reveal from "./Reveal";

export function Stars({ rating, className = "h-3.5 w-3.5" }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${className} ${i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-line text-line"}`}
        />
      ))}
    </span>
  );
}

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add, setOpen } = useCart();
  const pct = discountPct(product);

  return (
    <Reveal delay={(index % 4) * 0.07} className="h-full">
      <article className="flex h-full flex-col">
        <Link
          href={`/product/${product.slug}`}
          className="card-soft relative block overflow-hidden !rounded-2xl"
        >
          <div className="relative aspect-[4/4.5] bg-blush">
            <Image
              src={product.gallery[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 25vw"
              className="object-cover"
            />
          </div>
          {pct > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              Sale
            </span>
          )}
        </Link>
        <div className="flex flex-1 flex-col items-center px-2 pt-4 text-center">
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-[15px] font-semibold leading-snug hover:underline">{product.name}</h3>
          </Link>
          <div className="mt-1.5 flex items-center gap-1.5">
            <Stars rating={product.rating} />
            <span className="text-xs text-muted">({product.reviewCount})</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[17px] font-extrabold">{formatPKR(product.price)}</span>
            {product.compareAt && (
              <span className="text-[13px] text-muted line-through">{formatPKR(product.compareAt)}</span>
            )}
          </div>
          <button
            onClick={() => { add(product.slug); setOpen(true); }}
            className="btn-outline-dark mt-3.5 w-full max-w-[220px] rounded-full py-2.5 text-[13px] font-bold uppercase tracking-wider"
          >
            Add to cart
          </button>
        </div>
      </article>
    </Reveal>
  );
}
