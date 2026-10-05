"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Truck } from "lucide-react";
import Reveal from "../Reveal";
import { Stars } from "../ProductCard";
import { useCart } from "@/lib/cart";
import { PRODUCTS, formatPKR, discountPct } from "@/lib/site";

const FEATURED = PRODUCTS[0];

export default function Spotlight() {
  const { add, setOpen } = useCart();
  const [qty, setQty] = useState(1);
  const pct = discountPct(FEATURED);

  const buyNow = () => {
    add(FEATURED.slug, qty);
    window.location.href = "/checkout";
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal>
          <div className="relative">
            <div className="relative aspect-[4/4.4] overflow-hidden rounded-3xl bg-gold-soft">
              <Image
                src={FEATURED.gallery[0]}
                alt={FEATURED.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -right-3 top-6 flex h-24 w-24 rotate-12 flex-col items-center justify-center rounded-full bg-coal text-center text-white shadow-xl sm:-right-5 sm:h-28 sm:w-28">
              <span className="text-[10px] font-bold uppercase leading-tight tracking-wide">Flat</span>
              <span className="text-xl font-extrabold leading-none sm:text-2xl">{pct}%</span>
              <span className="text-[10px] font-bold uppercase leading-tight tracking-wide">Off</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image src="/results/before-hair.webp" alt="Before using Zulfira" fill sizes="300px" className="object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-gold/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-coal">Before</span>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image src="/results/after-hair.webp" alt="After using Zulfira" fill sizes="300px" className="object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-coal px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">After</span>
              </div>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="text-[12px] font-extrabold uppercase tracking-[0.24em] text-coal">
              Featured · {FEATURED.tagline}
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="section-title mt-3 text-3xl leading-tight sm:text-[2.6rem]">{FEATURED.name}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-3 flex items-center gap-2">
              <Stars rating={FEATURED.rating} className="h-4 w-4" />
              <span className="text-sm text-muted">{FEATURED.rating} · {FEATURED.reviewCount} reviews</span>
            </div>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl font-extrabold">{formatPKR(FEATURED.price)}</span>
              {FEATURED.compareAt && (
                <>
                  <span className="text-lg text-muted line-through">{formatPKR(FEATURED.compareAt)}</span>
                  <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">Sale</span>
                </>
              )}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted">
              <Truck className="h-4 w-4" /> Free delivery on orders above Rs 1,900 · Cash on Delivery available
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink/75">{FEATURED.short}</p>
          </Reveal>
          <Reveal delay={0.22}>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-none border border-ink/25">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease" className="px-4 py-3 hover:bg-black/5">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-bold tabular-nums">{qty}</span>
                <button onClick={() => setQty(Math.min(99, qty + 1))} aria-label="Increase" className="px-4 py-3 hover:bg-black/5">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => { add(FEATURED.slug, qty); setOpen(true); }}
                className="btn-outline-dark flex-1 rounded-full py-3.5 text-sm font-bold uppercase tracking-widest"
              >
                Add to cart
              </button>
              <button
                onClick={buyNow}
                className="btn-dark flex-1 rounded-full py-3.5 text-sm font-bold uppercase tracking-widest"
              >
                Buy it now
              </button>
            </div>
            <Link
              href={`/product/${FEATURED.slug}`}
              className="mt-5 inline-block text-sm font-semibold underline underline-offset-4 hover:text-coal"
            >
              View full details
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
