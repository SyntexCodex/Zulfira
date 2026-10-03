"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import Reveal, { SectionHeading } from "../Reveal";
import { FAQS } from "@/lib/site";

export function FaqAccordion({ items, limit }: { items: typeof FAQS; limit?: number }) {
  const [open, setOpen] = useState<number | null>(0);
  const list = limit ? items.slice(0, limit) : items;

  return (
    <div className="space-y-3.5">
      {list.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={`card overflow-hidden !rounded-2xl transition-colors ${isOpen ? "!border-pine/35" : ""}`}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-display text-[16.5px] font-semibold">{f.q}</span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isOpen ? "bg-pine text-white" : "bg-ink/6 text-ink"}`}
              >
                <Plus className="h-4 w-4" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-6 text-[14.5px] leading-relaxed text-muted">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default function FaqSection() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading
        eyebrow="Good to know"
        title={<>Frequently asked questions.</>}
      />
      <Reveal delay={0.1} className="mt-10">
        <FaqAccordion items={FAQS} limit={5} />
      </Reveal>
      <Reveal delay={0.15} className="mt-8 text-center">
        <a href="/faq" className="font-semibold text-pine underline-offset-4 hover:underline">
          View all FAQs
        </a>
      </Reveal>
    </section>
  );
}
