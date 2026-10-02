"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, MessageCircle, ChevronDown, Truck, ShieldCheck, Leaf } from "lucide-react";
import { img, WHATSAPP_LINK } from "@/lib/site";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
};

const item = {
  hidden: { opacity: 0, y: 46 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const } },
};

const stats = [
  { icon: Leaf, value: "100%", label: "Botanical actives" },
  { icon: Truck, value: "CoD", label: "Cash on delivery" },
  { icon: ShieldCheck, value: "2", label: "Signature formulas" },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} id="top" className="grain relative flex min-h-screen items-center overflow-hidden">
      {/* parallax background */}
      <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0">
        <Image
          src={img("/images/hero-bg.webp")}
          alt="Flowing hair and liquid gold"
          fill
          priority
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/55 to-void" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,8,0.55)_75%)]" />
      </motion.div>

      {/* floating orbs */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-gold/15 blur-[130px] animate-float" />
      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-mint/10 blur-[120px] animate-float" style={{ animationDelay: "2.4s" }} />
      <div className="grid-lines absolute inset-0 opacity-60" />

      <motion.div style={{ opacity: fade }} className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 pt-36 sm:px-8">
        <motion.div variants={container} initial="hidden" animate="visible" className="max-w-4xl">
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse-glow" />
              Next-gen hair science · Pakistan
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display mt-7 text-[13vw] font-extrabold leading-[0.95] tracking-tight sm:text-7xl lg:text-[6.5rem]"
          >
            HAIR FROM
            <br />
            <span className="text-gold-gradient">THE FUTURE</span>
          </motion.h1>

          <motion.p variants={item} className="mt-7 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            Two precision formulas. One ritual. Zulfira fuses botanical intelligence
            with futuristic care — for hair that defies gravity, time and frizz.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#order"
              className="btn-gold group inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold"
            >
              Order Now
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold backdrop-blur"
            >
              <MessageCircle className="h-5 w-5 text-[#25D366]" />
              WhatsApp Us
            </a>
          </motion.div>

          <motion.div variants={item} className="mt-14 grid max-w-lg grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4">
                <s.icon className="h-5 w-5 text-gold" />
                <div className="font-display mt-2 text-2xl font-extrabold">{s.value}</div>
                <div className="mt-1 text-xs tracking-wide text-muted">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.a
        href="#products"
        aria-label="Scroll to products"
        style={{ opacity: fade }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-muted"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="h-8 w-8" />
      </motion.a>
    </section>
  );
}
