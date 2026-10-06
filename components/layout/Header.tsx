"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Search, User, ShoppingBag, ChevronRight } from "lucide-react";
import { FacebookIcon, InstagramIcon, TiktokIcon } from "@/components/SocialIcons";
import { NAV_LINKS, DRAWER_GROUPS, PRODUCTS, SOCIAL_LINKS } from "@/lib/site";
import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/site";

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const results = q.trim()
    ? PRODUCTS.filter((p) => (p.name + " " + p.tagline).toLowerCase().includes(q.toLowerCase()))
    : [];
  useEffect(() => {
    if (open) setQ("");
  }, [open ]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -32, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto mt-20 w-[92%] max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <Search className="h-5 w-5 text-ink/50" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products…"
                className="w-full bg-transparent text-lg outline-none placeholder:text-ink/35"
              />
              <button onClick={onClose} aria-label="Close search" className="rounded-full p-2 hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto pt-2">
              {q.trim() && results.length === 0 && (
                <p className="py-8 text-center text-sm text-muted">No products found for “{q}”.</p>
              )}
              {results.map((p) => (
                <Link
                  key={p.slug}
                  href={`/product/${p.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 rounded-xl p-3 hover:bg-black/[0.03]"
                >
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gold-soft">
                    <Image src={p.gallery[0]} alt={p.name} fill className="object-cover" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[14.5px] font-semibold">{p.name}</span>
                    <span className="text-sm font-bold">{formatPKR(p.price)}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-ink/40" />
                </Link>
              ))}
              {!q.trim() && (
                <div className="py-4">
                  <p className="px-3 text-xs font-bold uppercase tracking-widest text-muted">Popular</p>
                  {PRODUCTS.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/product/${p.slug}`}
                      onClick={onClose}
                      className="block rounded-xl px-3 py-2.5 text-[14.5px] hover:bg-black/[0.03]"
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Header() {
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const { count, setOpen } = useCart();

  return (
    <>
      <header className="sticky top-0 z-40 bg-ink text-white shadow-[0_2px_20px_rgba(0,0,0,0.25)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-[68px] items-center justify-between">
            <div className="flex flex-1 items-center gap-1">
              <button
                onClick={() => setDrawer(true)}
                aria-label="Open menu"
                className="rounded-full p-2.5 transition hover:bg-white/10 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSearch(true)}
                aria-label="Search"
                className="rounded-full p-2.5 transition hover:bg-white/10"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

            <Link href="/" className="flex items-center gap-2.5">
              <span className="relative h-10 w-10 overflow-hidden rounded-full bg-white">
                <Image src="/brand/logo.webp" alt="Zulfira logo" fill className="object-cover" />
              </span>
              <span className="leading-none">
                <span className="font-display block text-[22px] font-semibold tracking-[0.18em]">
                  ZULFIRA
                </span>
                <span className="block text-center text-[9px] font-medium uppercase tracking-[0.42em] text-white/60">
                  Hair Care
                </span>
              </span>
            </Link>

            <div className="flex flex-1 items-center justify-end gap-0.5">
              <Link href="/contact" aria-label="Account" className="hidden rounded-full p-2.5 transition hover:bg-white/10 sm:block">
                <User className="h-5 w-5" />
              </Link>
              <button
                onClick={() => setOpen(true)}
                aria-label="Open cart"
                className="relative rounded-full p-2.5 transition hover:bg-white/10"
              >
                <ShoppingBag className="h-5 w-5" />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      key={count}
                      initial={{ scale: 0.4 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coal px-1 text-[11px] font-bold text-white"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          <nav className="hidden items-center justify-center gap-8 pb-3.5 lg:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-[13.5px] font-medium tracking-wide text-white/85 transition hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
              className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-[61] flex w-[320px] flex-col bg-white shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-line bg-ink px-5 py-4 text-white">
                <span className="font-display text-lg font-semibold tracking-[0.18em]">ZULFIRA</span>
                <button onClick={() => setDrawer(false)} aria-label="Close menu" className="rounded-full p-2 hover:bg-white/10">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <button
                  onClick={() => { setDrawer(false); setSearch(true); }}
                  className="flex w-full items-center gap-3 rounded-full border border-line px-5 py-3 text-sm text-ink/50"
                >
                  <Search className="h-4 w-4" /> Search products…
                </button>
                <Link
                  href="/"
                  onClick={() => setDrawer(false)}
                  className="mt-4 block rounded-xl px-3 py-3 text-[15px] font-bold hover:bg-black/[0.04]"
                >
                  Home
                </Link>
                {DRAWER_GROUPS.map((g) => (
                  <div key={g.title} className="mt-5">
                    <p className="px-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink/45">
                      {g.title}
                    </p>
                    <div className="mt-1.5">
                      {g.links.map((l) => (
                        <Link
                          key={l.label}
                          href={l.href}
                          onClick={() => setDrawer(false)}
                          className="block rounded-xl px-3 py-2.5 text-[14.5px] text-ink/80 hover:bg-black/[0.04]"
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="mt-6 space-y-1 border-t border-line pt-4">
                  {[
                    { label: "Track Your Order", href: "/track-order" },
                    { label: "Contact Us", href: "/contact" },
                    { label: "FAQs", href: "/faq" },
                  ].map((l) => (
                    <Link
                      key={l.label}
                      href={l.href}
                      onClick={() => setDrawer(false)}
                      className="block rounded-xl px-3 py-2.5 text-[14.5px] font-medium hover:bg-black/[0.04]"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-line p-5">
                {[
                  { icon: FacebookIcon, label: "Facebook", href: SOCIAL_LINKS.facebook },
                  { icon: InstagramIcon, label: "Instagram", href: SOCIAL_LINKS.instagram },
                  { icon: TiktokIcon, label: "TikTok", href: SOCIAL_LINKS.tiktok },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay open={search} onClose={() => setSearch(false)} />
    </>
  );
}
