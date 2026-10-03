"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ShoppingBag, MessageCircle, Search } from "lucide-react";
import { NAV_LINKS, WHATSAPP_LINK } from "@/lib/site";
import { useCart } from "@/lib/cart";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, setOpen } = useCart();

  return (
    <>
      {/* announcement bar */}
      <div className="bg-pine-deep text-center text-[12.5px] font-medium tracking-wide text-ivory">
        <p className="mx-auto max-w-7xl px-4 py-2.5">
          Free nationwide delivery on orders over Rs 2,500 &nbsp;·&nbsp; Cash on Delivery available
        </p>
      </div>

      <header className="sticky top-0 z-40 border-b border-ink/8 bg-ivory/90 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* mobile menu button */}
          <button
            className="rounded-lg p-2 -ml-2 text-ink lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="relative h-10 w-10 overflow-hidden rounded-full bg-white ring-1 ring-ink/10">
              <Image src="/brand/logo.webp" alt="Zulfira logo" fill className="object-cover" />
            </span>
            <span className="leading-none">
              <span className="font-display block text-[22px] font-bold tracking-[0.14em] text-ink">
                ZULFIRA
              </span>
              <span className="block text-[9.5px] font-semibold uppercase tracking-[0.32em] text-pine">
                Hair Care
              </span>
            </span>
          </Link>

          {/* desktop nav */}
          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href + l.label}
                href={l.href}
                className="text-[14.5px] font-medium text-ink/75 transition-colors hover:text-pine"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="hidden rounded-full p-2.5 text-pine transition-colors hover:bg-pine/8 sm:block"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            <button
              onClick={() => setOpen(true)}
              aria-label="Open cart"
              className="relative rounded-full p-2.5 text-ink transition-colors hover:bg-ink/5"
            >
              <ShoppingBag className="h-5 w-5" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-pine px-1 text-[11px] font-bold text-white"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <Link
              href="/shop"
              className="btn-primary ml-1 hidden rounded-full px-5 py-2.5 text-sm font-semibold sm:block"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-[300px] flex-col bg-ivory shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-ink/8 px-5 py-4">
                <span className="flex items-center gap-2">
                  <span className="relative h-9 w-9 overflow-hidden rounded-full bg-white ring-1 ring-ink/10">
                    <Image src="/brand/logo.webp" alt="Zulfira logo" fill className="object-cover" />
                  </span>
                  <span className="font-display text-lg font-bold tracking-[0.14em]">ZULFIRA</span>
                </span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="rounded-lg p-2">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col px-3 py-4">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.href + l.label}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-4 py-3.5 text-[16px] font-medium text-ink/85 hover:bg-pine/8"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto border-t border-ink/8 p-5">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp Us
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
