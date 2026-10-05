"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Metadata } from "next";
import Reveal, { SectionHeading } from "@/components/Reveal";
import { FAQS } from "@/lib/site";

function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="card-soft divide-y divide-line overflow-hidden">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="text-[15px] font-bold">{f.q}</span>
              <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="text-xl font-light leading-none">
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-6 text-[14.5px] leading-relaxed text-ink/75">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        eyebrow="Help Center"
        title={<>Frequently asked questions.</>}
        copy="Everything about ordering, delivery, payments and using the products."
      />
      <Reveal delay={0.1} className="mt-10">
        <FaqAccordion items={FAQS} />
      </Reveal>
      <Reveal delay={0.15} className="mt-10">
        <div className="card-soft bg-gold-soft p-8 text-center">
          <p className="section-title text-xl">Still have a question?</p>
          <p className="mt-2 text-sm text-muted">Message us on WhatsApp — we reply fast.</p>
          <a href="/contact" className="btn-coal mt-5 inline-block rounded-full px-8 py-3 text-sm font-bold">
            Contact Us
          </a>
        </div>
      </Reveal>
    </div>
  );
}
