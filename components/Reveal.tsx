"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 42 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Reveal({
  children,
  delay = 0,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  kicker,
  title,
  copy,
  align = "center",
}: {
  kicker: string;
  title: ReactNode;
  copy?: string;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-3xl ${alignCls}`}>
      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse-glow" />
          {kicker}
        </span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="font-display mt-6 text-4xl font-800 leading-[1.05] sm:text-5xl lg:text-6xl font-extrabold">
          {title}
        </h2>
      </Reveal>
      {copy && (
        <Reveal delay={0.16}>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{copy}</p>
        </Reveal>
      )}
    </div>
  );
}
