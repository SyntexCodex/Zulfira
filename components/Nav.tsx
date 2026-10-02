"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { NAV_LINKS } from "@/lib/site";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)]" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl ring-conic p-[2px]">
            <span className="flex h-full w-full items-center justify-center rounded-[10px] bg-void">
              <Sparkles className="h-4 w-4 text-gold" />
            </span>
          </span>
          <span className="font-display text-xl font-extrabold tracking-[0.22em]">
            ZULF<span className="text-gold-gradient">IRA</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium tracking-wide text-muted transition-colors hover:text-gold"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#order"
            className="btn-gold rounded-full px-6 py-2.5 text-sm font-bold tracking-wide"
          >
            Order Now
          </a>
        </div>

        <button
          className="rounded-lg p-2 text-cream md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="glass overflow-hidden md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-cream hover:bg-white/5"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#order"
                onClick={() => setOpen(false)}
                className="btn-gold mt-2 rounded-full px-6 py-3 text-center text-sm font-bold"
              >
                Order Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
