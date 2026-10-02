"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import Reveal from "./Reveal";
import { img } from "@/lib/site";

const ACTIVES = [
  { name: "Argan Oil", note: "Liquid gold · vitamin E repair", pct: "96%" },
  { name: "Keratin", note: "Rebuilds broken bonds", pct: "92%" },
  { name: "Aloe Vera", note: "Scalp-soothing hydration", pct: "89%" },
  { name: "Silk Protein", note: "Weightless glass shine", pct: "94%" },
];

export default function Ingredients() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section ref={ref} className="relative overflow-hidden py-28 sm:py-36">
      <motion.div style={{ y }} className="absolute inset-0 -top-[15%] h-[130%]">
        <Image src={img("/images/ingredients.webp")} alt="Botanical actives" fill className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-void via-void/60 to-void" />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-mint">
                <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse-glow" />
                Inside the formula
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="font-display mt-6 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
                Nature, upgraded by <span className="text-gold-gradient">science</span>
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
                Every drop is calibrated in the lab and blessed by nature. No parabens,
                no silicones, no mineral oil — only actives your follicles will thank you for.
              </p>
            </Reveal>
          </div>

          <div className="space-y-5">
            {ACTIVES.map((a, i) => (
              <Reveal key={a.name} delay={i * 0.08}>
                <div className="glass rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-display text-xl font-bold">{a.name}</div>
                      <div className="mt-1 text-sm text-muted">{a.note}</div>
                    </div>
                    <div className="font-display text-2xl font-extrabold text-gold-gradient">{a.pct}</div>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: a.pct }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 1.2, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-soft"
                    />
                  </div>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.35}>
              <p className="text-xs text-muted/70">*Purity grade of key actives in formula. Illustrative.</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
