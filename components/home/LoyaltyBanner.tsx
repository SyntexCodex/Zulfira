"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useActivePrograms } from "@/lib/useActivePrograms";

export default function LoyaltyBanner() {
  const programs = useActivePrograms();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (programs.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % programs.length), 5000);
    return () => clearInterval(t);
  }, [programs.length]);

  if (programs.length === 0) return null;
  const p = programs[index % programs.length];

  return (
    <section className="relative h-[200px] w-full overflow-hidden bg-coal text-white">
      {/* decorative gold glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 200px at 15% 50%, rgba(212,175,55,0.22), transparent 70%), radial-gradient(500px 200px at 85% 50%, rgba(212,175,55,0.12), transparent 70%)",
        }}
      />
      <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.25em] text-gold">
                <Sparkles className="h-3.5 w-3.5" />
                {p.name}
              </p>
              <h2 className="font-display mt-1.5 truncate text-2xl font-semibold sm:text-[32px] sm:leading-tight">
                {p.headline}
              </h2>
              <p className="mt-1 hidden text-sm text-white/65 sm:block">{p.subtext}</p>
            </motion.div>
          </AnimatePresence>
          {programs.length > 1 && (
            <div className="mt-2.5 flex gap-1.5">
              {programs.map((x, i) => (
                <button
                  key={x.key}
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${x.name}`}
                  className={`h-1.5 rounded-full transition-all ${i === index % programs.length ? "w-6 bg-gold" : "w-1.5 bg-white/30 hover:bg-white/50"}`}
                />
              ))}
            </div>
          )}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={p.key}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.35 }}
            className="shrink-0"
          >
            <Link
              href={p.href}
              className="group flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-coal transition hover:brightness-110"
            >
              {p.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
