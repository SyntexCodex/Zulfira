"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Minus, Plus, X, ChevronLeft, ChevronRight, Expand, Check,
  Truck, ShieldCheck, RotateCcw, BadgeCheck, MessageCircle,
} from "lucide-react";
import { type Product, formatPKR, discountPct, WHATSAPP_LINK, REVIEWS } from "@/lib/site";
import { useCart } from "@/lib/cart";
import { Stars } from "@/components/ProductCard";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

function Gallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const pct = discountPct(product);

  return (
    <>
      <div className="lg:sticky lg:top-40">
        <div
          className="relative aspect-[4/4.3] cursor-zoom-in overflow-hidden rounded-2xl bg-blush"
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
          {pct > 0 && (
            <span className="absolute left-4 top-4 rounded-full bg-ink px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
              Sale
            </span>
          )}
          <span className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-2 text-xs font-semibold backdrop-blur">
            <Expand className="h-3.5 w-3.5" /> Click to expand
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {product.gallery.map((g, i) => (
            <button
              key={g}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded-xl bg-blush transition-all ${i === active ? "ring-2 ring-ink ring-offset-2" : "opacity-70 hover:opacity-100"}`}
            >
              <Image src={g} alt={`${product.name} view ${i + 1}`} fill sizes="200px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightbox(false)}
          >
            <button aria-label="Close" className="absolute right-5 top-5 rounded-full bg-white/15 p-3 text-white hover:bg-white/30" onClick={() => setLightbox(false)}>
              <X className="h-6 w-6" />
            </button>
            <button
              aria-label="Previous image"
              onClick={(e) => { e.stopPropagation(); setActive((active - 1 + product.gallery.length) % product.gallery.length); }}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/30"
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
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/30"
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

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-4 text-left">
        <span className="text-[15px] font-bold">{title}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} className="text-xl font-light leading-none">
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-[14.5px] leading-relaxed text-ink/75">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductView({ product, related }: { product: Product; related: Product[] }) {
  const { add, setOpen } = useCart();
  const [qty, setQty] = useState(1);
  const pct = discountPct(product);
  // Live customer reviews from the DB (submitted after delivery), plus the
  // static testimonials as fallback while there are no real reviews yet.
  const [liveReviews, setLiveReviews] = useState<{ customerName: string; rating: number; title: string | null; comment: string; createdAt: string }[]>([]);
  const [liveStats, setLiveStats] = useState<{ average: number | null; count: number } | null>(null);
  useEffect(() => {
    if (!product.dbId) return;
    (async () => {
      try {
        const res = await fetch(`/api/reviews?productId=${encodeURIComponent(product.dbId!)}`);
        const json = await res.json().catch(() => null);
        if (res.ok && json?.ok) {
          setLiveReviews(Array.isArray(json.data.reviews) ? json.data.reviews : []);
          setLiveStats({ average: json.data.average, count: json.data.count });
        }
      } catch {
        // reviews stay as static fallback
      }
    })();
  }, [product.dbId]);

  const staticReviews = REVIEWS.slice(0, Math.max(0, 3 - liveReviews.length));
  const rating = liveStats?.average ?? product.rating;
  const reviewCount = (liveStats?.count ?? 0) + (product.reviewCount || 0);

  const buyNow = () => {
    add(product.slug, qty);
    window.location.href = "/checkout";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-8 flex items-center gap-2 text-[13px] text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-ink">Shop</Link>
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Gallery product={product} />

        <div>
          <p className="text-[12px] font-extrabold uppercase tracking-[0.24em] text-maroon">{product.tagline}</p>
          <h1 className="section-title mt-3 text-3xl leading-tight sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2">
            <Stars rating={rating} className="h-4 w-4" />
            <span className="text-sm text-muted">{rating} · {reviewCount} reviews</span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-[28px] font-extrabold">{formatPKR(product.price)}</span>
            {product.compareAt && (
              <>
                <span className="text-lg text-muted line-through">{formatPKR(product.compareAt)}</span>
                <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">Sale</span>
              </>
            )}
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted">
            <Truck className="h-4 w-4" /> Free delivery above Rs 1,900 · Cash on Delivery available
          </p>

          <p className="mt-5 text-[14.5px] leading-relaxed text-ink/75">{product.short}</p>

          <div className="mt-6">
            <p className="mb-2 text-[13px] font-bold">Quantity</p>
            <div className="inline-flex items-center border border-ink/25">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease" className="px-4 py-3 hover:bg-black/5">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-bold tabular-nums">{qty}</span>
              <button onClick={() => setQty(Math.min(99, qty + 1))} aria-label="Increase" className="px-4 py-3 hover:bg-black/5">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <button
              onClick={() => { add(product.slug, qty); setOpen(true); }}
              className="btn-outline-dark rounded-full py-3.5 text-sm font-bold uppercase tracking-widest"
            >
              Add to cart
            </button>
            <button
              onClick={buyNow}
              className="btn-dark rounded-full py-3.5 text-sm font-bold uppercase tracking-widest"
            >
              Buy it now
            </button>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-sm font-bold uppercase tracking-widest text-white"
            >
              <MessageCircle className="h-4 w-4" /> Order on WhatsApp
            </a>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: Truck, t: "Fast Delivery", s: "2–4 days" },
              { icon: ShieldCheck, t: "CoD Available", s: "Pay at door" },
              { icon: RotateCcw, t: "Easy Returns", s: "7-day policy" },
            ].map((it) => (
              <div key={it.t} className="rounded-2xl bg-ivory p-3.5 text-center">
                <it.icon className="mx-auto h-5 w-5" />
                <p className="mt-1.5 text-[12px] font-bold">{it.t}</p>
                <p className="text-[11px] text-muted">{it.s}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-line">
            <Accordion title="Description" defaultOpen>
              <div className="space-y-3">
                {product.description.map((d, i) => <p key={i}>{d}</p>)}
                <ul className="space-y-2 pt-1">
                  {product.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-maroon" strokeWidth={3} /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            </Accordion>
            <Accordion title="How to Use">
              <ol className="space-y-2.5">
                {product.howToUse.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-bold">{i + 1}.</span> {s}
                  </li>
                ))}
              </ol>
            </Accordion>
            <Accordion title="Ingredients">
              <ul className="space-y-2">
                {product.ingredients.map((ing) => (
                  <li key={ing.name}><strong>{ing.name}</strong> — {ing.note}</li>
                ))}
              </ul>
            </Accordion>
            <Accordion title="Shipping & Returns">
              <p>Dispatched within 24 hours. Delivery takes 2–4 working days across Pakistan. Free delivery above Rs 1,900. 7-day replacement for damaged or incorrect items.</p>
            </Accordion>
          </div>
        </div>
      </div>

      <section className="mt-16 border-t border-line pt-12">
        <Reveal>
          <h2 className="section-title text-2xl sm:text-3xl">What customers say</h2>
        </Reveal>
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {liveReviews.map((r, i) => (
            <Reveal key={`live-${i}`} delay={i * 0.08}>
              <article className="card-soft h-full !rounded-2xl p-6">
                <Stars rating={r.rating} />
                {r.title && <p className="mt-3 text-[15px] font-bold">{r.title}</p>}
                <p className="mt-2 text-[14px] leading-relaxed text-ink/85">“{r.comment}”</p>
                <p className="mt-4 flex items-center gap-1.5 text-sm font-bold">
                  {r.customerName} <BadgeCheck className="h-4 w-4 text-maroon" />
                </p>
                <p className="text-xs text-muted">
                  Verified buyer
                  {r.createdAt && ` · ${new Date(r.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}`}
                </p>
              </article>
            </Reveal>
          ))}
          {staticReviews.map((r, i) => (
            <Reveal key={r.name} delay={(liveReviews.length + i) * 0.08}>
              <article className="card-soft h-full !rounded-2xl p-6">
                <Stars rating={5} />
                <p className="mt-3.5 text-[14px] leading-relaxed text-ink/85">“{r.text}”</p>
                <p className="mt-4 flex items-center gap-1.5 text-sm font-bold">
                  {r.name} <BadgeCheck className="h-4 w-4 text-maroon" />
                </p>
                <p className="text-xs text-muted">{r.city} · Verified buyer</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <Reveal>
          <h2 className="section-title text-2xl sm:text-3xl">You may also like</h2>
        </Reveal>
        <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-10">
          {related.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
