"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useActivePrograms } from "@/lib/useActivePrograms";

const DISMISS_KEY = "zulfira-programs-dismissed";

function dismissedKeys(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function ProgramBanner() {
  const all = useActivePrograms();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDismissed(dismissedKeys());
    setReady(true);
  }, []);

  const programs = useMemo(
    () => (ready ? all.filter((p) => !dismissed.includes(p.key)) : []),
    [all, dismissed, ready]
  );

  useEffect(() => {
    if (programs.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % programs.length), 6000);
    return () => clearInterval(t);
  }, [programs.length]);

  if (programs.length === 0) return null;
  const p = programs[Math.min(index, programs.length - 1)];

  const dismiss = () => {
    try {
      const next = [...new Set([...dismissedKeys(), p.key])];
      localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
      setDismissed(next);
    } catch {}
    setIndex(0);
  };

  return (
    <div className="relative z-30 bg-coal text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-10 py-2.5 sm:gap-5">
        {programs.length > 1 && (
          <button
            onClick={() => setIndex((index - 1 + programs.length) % programs.length)}
            aria-label="Previous program"
            className="hidden rounded-full p-1 text-white/60 hover:text-gold sm:block"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        <div className="relative min-h-[44px] flex-1 overflow-hidden text-center sm:min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center gap-1 py-0.5 sm:flex-row sm:gap-3"
            >
              <span className="flex items-center gap-1.5 text-[13px] font-bold tracking-wide text-gold sm:text-sm">
                <Sparkles className="h-4 w-4 shrink-0" />
                {p.headline}
              </span>
              <span className="hidden text-[12.5px] text-white/65 md:inline">{p.subtext}</span>
              <Link
                href={p.href}
                className="rounded-full bg-gold px-4 py-1 text-[11.5px] font-extrabold uppercase tracking-wider text-coal transition hover:brightness-110"
              >
                {p.cta}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
        {programs.length > 1 && (
          <button
            onClick={() => setIndex((index + 1) % programs.length)}
            aria-label="Next program"
            className="hidden rounded-full p-1 text-white/60 hover:text-gold sm:block"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        {programs.length > 1 && (
          <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1.5">
            {programs.map((x, i) => (
              <button
                key={x.key}
                onClick={() => setIndex(i)}
                aria-label={`Show ${x.name}`}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-gold" : "w-1.5 bg-white/30 hover:bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
