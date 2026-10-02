"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import Reveal, { SectionHeading } from "./Reveal";

const FAQS = [
  {
    q: "How do I pay? Is Cash on Delivery really available?",
    a: "Yes — Cash on Delivery is available nationwide across Pakistan. Pay in cash when the rider hands you your parcel. Prefer paying upfront? Choose Online Payment at checkout and pay via JazzCash, EasyPaisa or bank transfer, then share the receipt screenshot on WhatsApp.",
  },
  {
    q: "How long does delivery take?",
    a: "Orders are dispatched within 24 hours. Delivery typically takes 2–4 working days anywhere in Pakistan. You'll receive a confirmation message on WhatsApp as soon as your order ships.",
  },
  {
    q: "Is Zulfira suitable for my hair type?",
    a: "The formulas were designed for all hair types — straight, wavy, curly, coily, colored or chemically treated. The shampoo is sulfate-smart (gentle cleanse) and the oil is lightweight, so fine hair won't feel weighed down.",
  },
  {
    q: "How do I use the oil and shampoo together?",
    a: "Massage 5–8 drops of oil into your scalp 30 minutes before washing (or leave overnight for a deep treatment), then cleanse with Zulfira Shampoo. Use 2–3 times a week for the full ritual effect.",
  },
  {
    q: "What if I receive a damaged product?",
    a: "Message us on WhatsApp with a photo within 7 days of delivery and we'll replace it free of charge — no interrogation, no fine print.",
  },
  {
    q: "Are the products natural / chemical-free?",
    a: "Both formulas are built on botanical actives — argan, keratin, aloe vera and silk protein — with no parabens, silicones or mineral oil.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <SectionHeading
          kicker="Intel"
          title={
            <>
              Questions, <span className="text-gold-gradient">decoded</span>
            </>
          }
        />
        <div className="mt-14 space-y-4">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={i} delay={i * 0.05}>
                <div className={`glass overflow-hidden rounded-2xl transition-colors ${isOpen ? "border-gold/40" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-display text-base font-bold sm:text-lg">{f.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${isOpen ? "border-gold bg-gold/15 text-gold" : "border-white/15 text-muted"}`}
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
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-6 leading-relaxed text-muted">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
