"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Minus, Plus, ShoppingBag, MessageCircle, X, ChevronLeft, ChevronRight,
  Truck, ShieldCheck, RotateCcw, Expand, Check, BadgeCheck,
} from "lucide-react";
import { type Product, formatPKR, discountPct, WHATSAPP_LINK, REVIEWS } from "@/lib/site";
import { useCart } from "@/lib/cart";
import { Stars } from "@/components/ProductCard";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

function Gallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      <div className="lg:sticky lg:top-28">
        <div
          className="relative aspect-[4/4.3] cursor-zoom-in overflow-hidden rounded-[1.5rem] bg-cream"
          onClick={() => setLightbox(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={product.gallery[active]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-pine px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              {product.badge}
            </span>
          )}
          <span className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-2 text-xs font-semibold text-ink backdrop-blur">
            <Expand className="h-3.5 w-3.5" /> Click to expand
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {product.gallery.map((g, i) => (
            <button
              key={g}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded-xl bg-cream transition-all ${i === active ? "ring-2 ring-pine ring-offset-2" : "opacity-70 hover:opacity-100"}`}
            >
              <Image src={g} alt={`${product.name} view ${i + 1}`} fill sizes="200px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* fullscreen lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/92 p-4 backdrop-blur-sm"
            onClick={() => setLightbox(false)}
          >
            <button
              aria-label="Close"
              className="absolute right-5 top-5 rounded-full bg-white/12 p-3 text-white hover:bg-white/25"
              onClick={() => setLightbox(false)}
            >
              <X className="h-6 w-6" />
            </button>
            <button
              aria-label="Previous image"
              onClick={(e) => { e.stopPropagation(); setActive((active - 1 + product.gallery.length) % product.gallery.length); }}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/12 p-3 text-white hover:bg-white/25"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative h-[86vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={product.gallery[active]} alt={product.name} fill sizes="90vw" className="object-contain" />
            </motion.div>
            <button
              aria-label="Next image"
              onClick={(e) => { e.stopPropagation(); setActive((active + 1) % product.gallery.length); }}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/12 p-3 text-white hover:bg-white/25"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
              {product.gallery.map((_, i) => (
                <span key={i} className={`h-2 w-2 rounded-full ${i === active ? "bg-white" : "bg-white/35"}`} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Tabs({ product }: { product: Product }) {
  const [tab, setTab] = useState(0);
  const tabs = ["Description", "How to Use", "Ingredients"];
  return (
    <div className="mt-12">
      <div className="flex gap-1 border-b border-ink/10">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`relative px-5 py-3.5 text-[14.5px] font-semibold transition-colors ${tab === i ? "text-pine" : "text-muted hover:text-ink"}`}
          >
            {t}
            {tab === i && <motion.span layoutId="tab-underline" className="absolute inset-x-3 -bottom-px h-[2.5px] rounded-full bg-pine" />}
          </button>
        ))}
      </div>
      <div className="py-7">
        {tab === 0 && (
          <div className="max-w-3xl space-y-4">
            {product.description.map((d, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-ink/80">{d}</p>
            ))}
            <ul className="grid gap-2.5 pt-2 sm:grid-cols-2">
              {product.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-[14.5px]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pine/10">
                    <Check className="h-3 w-3 text-pine" strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}
        {tab === 1 && (
          <ol className="max-w-3xl space-y-4">
            {product.howToUse.map((s, i) => (
              <li key={i} className="flex gap-4">
                <span className="font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pine text-[15px] font-bold text-white">
                  {i + 1}
                </span>
                <p className="pt-1.5 text-[15px] leading-relaxed text-ink/80">{s}</p>
              </li>
            ))}
          </ol>
        )}
        {tab === 2 && (
          <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
            {product.ingredients.map((ing) => (
              <div key={ing.name} className="card p-5">
                <p className="font-display text-[17px] font-semibold">{ing.name}</p>
                <p className="mt-1 text-sm text-muted">{ing.note}</p>
              </div>
            ))}
            <p className="text-xs text-muted sm:col-span-2">Full INCI list available on request via WhatsApp.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductView({ product, related }: { product: Product; related: Product[] }) {
  const { add, setOpen } = useCart();
  const [qty, setQty] = useState(1);
  const pct = discountPct(product);
  const productReviews = REVIEWS.filter((r) =>
    product.slug === "complete-ritual-bundle" ? r.product === "Ritual Bundle" : true
  ).slice(0, 3);

  const buyNow = () => {
    add(product.slug, qty);
    window.location.href = "/checkout";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {/* breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-[13px] text-muted">
        <Link href="/" className="hover:text-pine">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-pine">Shop</Link>
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Gallery product={product} />

        <div>
          <p className="eyebrow">{product.tagline}</p>
          <h1 className="font-display mt-3 text-3xl font-semibold leading-tight sm:text-[2.6rem]">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-2.5">
            <Stars rating={product.rating} className="h-4 w-4" />
            <span className="text-sm text-muted">{product.rating} · {product.reviewCount} reviews</span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="font-display text-4xl font-bold text-pine">{formatPKR(product.price)}</span>
            {product.compareAt && (
              <>
                <span className="text-lg text-muted line-through">{formatPKR(product.compareAt)}</span>
                <span className="rounded-full bg-gold/25 px-3 py-1 text-xs font-bold text-ink">SAVE {pct}%</span>
              </>
            )}
          </div>
          <p className="mt-1.5 text-sm text-muted">{product.size} · Inclusive of all taxes</p>

          <p className="mt-6 text-[15px] leading-relaxed text-ink/80">{product.short}</p>

          {/* qty + actions */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border-[1.5px] border-ink/15">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity" className="p-3 px-4 hover:text-pine">
                <Minus className="h-4 w-4" />
              </button>
              <span className="font-display w-8 text-center text-lg font-bold">{qty}</span>
              <button onClick={() => setQty(Math.min(99, qty + 1))} aria-label="Increase quantity" className="p-3 px-4 hover:text-pine">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => { add(product.slug, qty); setOpen(true); }}
              className="btn-primary flex flex-1 items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-bold sm:flex-none sm:px-10"
            >
              <ShoppingBag className="h-4.5 w-4.5" /> Add to Cart
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
            <button onClick={buyNow} className="btn-gold flex-1 rounded-full py-3.5 text-[15px] font-bold">
              Buy Now — Cash on Delivery
            </button>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-[15px] font-bold text-white"
            >
              <MessageCircle className="h-4.5 w-4.5" /> Order on WhatsApp
            </a>
          </div>

          {/* trust points */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: Truck, t: "Nationwide", s: "2–4 day delivery" },
              { icon: ShieldCheck, t: "CoD Available", s: "Pay at your door" },
              { icon: RotateCcw, t: "Easy Returns", s: "7-day replacement" },
            ].map((it) => (
              <div key={it.t} className="rounded-2xl bg-cream p-3.5 text-center">
                <it.icon className="mx-auto h-5 w-5 text-pine" />
                <p className="mt-1.5 text-[12.5px] font-bold">{it.t}</p>
                <p className="text-[11.5px] text-muted">{it.s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Tabs product={product} />

      {/* reviews */}
      <section className="mt-6 border-t border-ink/8 pt-12">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">What customers say</h2>
        </Reveal>
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {productReviews.map((r, i) => (
            <Reveal key={r.name} delay={i * 0.08}>
              <article className="card h-full p-6">
                <Stars rating={5} />
                <p className="mt-3.5 text-[14.5px] leading-relaxed text-ink/85">“{r.text}”</p>
                <p className="mt-4 flex items-center gap-1.5 text-sm font-bold">
                  {r.name} <BadgeCheck className="h-4 w-4 text-pine" />
                </p>
                <p className="text-xs text-muted">{r.city} · Verified buyer</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* related */}
      <section className="mt-16">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Complete your ritual</h2>
        </Reveal>
        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          {related.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
