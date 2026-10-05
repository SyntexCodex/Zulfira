"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ANNOUNCEMENT_MESSAGES, FLASH_SALE } from "@/lib/site";

function useCountdown() {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const getEnd = () => {
      const stored = localStorage.getItem("zulfira-sale-end");
      const end = stored ? parseInt(stored, 10) : Date.now() + 36 * 3600 * 1000;
      if (!stored || end < Date.now()) {
        const fresh = Date.now() + 36 * 3600 * 1000;
        localStorage.setItem("zulfira-sale-end", String(fresh));
        return fresh;
      }
      return end;
    };
    const end = getEnd();
    const tick = () => {
      const ms = Math.max(0, end - Date.now());
      setLeft({
        d: Math.floor(ms / 86400000),
        h: Math.floor(ms / 3600000) % 24,
        m: Math.floor(ms / 60000) % 60,
        s: Math.floor(ms / 1000) % 60,
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return left;
}

export function FlashSaleBar() {
  const [hidden, setHidden] = useState(false);
  const { d, h, m, s } = useCountdown();
  if (hidden) return null;
  const cell = (v: number, l: string) => (
    <span className="flex flex-col items-center">
      <span className="text-xl font-extrabold tabular-nums leading-none text-gold sm:text-2xl">
        {String(v).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[9px] font-medium uppercase tracking-widest text-white/70">{l}</span>
    </span>
  );
  return (
    <div className="relative bg-coal px-4 py-2.5 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 sm:gap-8">
        <div className="text-center">
          <p className="text-sm font-extrabold uppercase tracking-wide sm:text-base">{FLASH_SALE.title}</p>
          <p className="text-[10px] text-white/75 sm:text-[11px]">{FLASH_SALE.subtitle}</p>
        </div>
        <div className="flex items-start gap-2 sm:gap-3">
          {cell(d, "Days")}
          <span className="pt-0.5 font-bold text-white/60">:</span>
          {cell(h, "Hours")}
          <span className="pt-0.5 font-bold text-white/60">:</span>
          {cell(m, "Minutes")}
          <span className="pt-0.5 font-bold text-white/60">:</span>
          {cell(s, "Seconds")}
        </div>
      </div>
      <button
        onClick={() => setHidden(true)}
        aria-label="Dismiss sale banner"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function AnnouncementBar() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % ANNOUNCEMENT_MESSAGES.length), 4000);
    return () => clearInterval(t);
  }, [paused ]);
  return (
    <div
      className="border-b border-line bg-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <button
          onClick={() => setI((i - 1 + ANNOUNCEMENT_MESSAGES.length) % ANNOUNCEMENT_MESSAGES.length)}
          aria-label="Previous message"
          className="rounded-full p-1.5 text-ink/60 hover:bg-black/5"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="relative h-5 flex-1 overflow-hidden text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-[12.5px] font-medium tracking-wide text-ink/80"
            >
              {ANNOUNCEMENT_MESSAGES[i]}
            </motion.p>
          </AnimatePresence>
        </div>
        <button
          onClick={() => setI((i + 1) % ANNOUNCEMENT_MESSAGES.length)}
          aria-label="Next message"
          className="rounded-full p-1.5 text-ink/60 hover:bg-black/5"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
