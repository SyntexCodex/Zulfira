"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import type { ProgramPromo } from "@/lib/programs";

const DISMISS_KEY = "zulfira-programs-dismissed";
const CACHE_KEY = "zulfira-programs-cache";
const CACHE_TTL = 5 * 60 * 1000;

function dismissedKeys(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function ProgramBanner() {
  const [programs, setPrograms] = useState<ProgramPromo[]>([]);
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // Serve from cache first for instant paint, then refresh.
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null");
        if (cached && Date.now() - cached.at < CACHE_TTL && !cancelled) {
          setPrograms(filterDismissed(cached.programs));
        }
      } catch {}
      try {
        const res = await fetch("/api/programs/active", { cache: "no-store" });
        const json = await res.json();
        const list: ProgramPromo[] = json?.ok && Array.isArray(json.data?.programs)
          ? json.data.programs
          : [];
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), programs: list }));
        } catch {}
        if (!cancelled) setPrograms(filterDismissed(list));
      } catch {}
    };
    const filterDismissed = (list: ProgramPromo[]) => {
      const gone = new Set(dismissedKeys());
      return list.filter((p) => !gone.has(p.key));
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (programs.length < 2 || hidden) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % programs.length), 6000);
    return () => clearInterval(t);
  }, [programs.length, hidden ]);

  if (hidden || programs.length === 0) return null;
  const p = programs[Math.min(index, programs.length - 1)];

  const dismiss = () => {
    try {
      const gone = new Set(dismissedKeys());
      gone.add(p.key);
      localStorage.setItem(DISMISS_KEY, JSON.stringify([...gone]));
    } catch {}
    const rest = programs.filter((x) => x.key !== p.key);
    setPrograms(rest);
    setIndex(0);
    if (rest.length === 0) setHidden(true);
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
