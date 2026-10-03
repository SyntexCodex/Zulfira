"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "center",
  dark = false,
}: {
  eyebrow: string;
  title: ReactNode;
  copy?: string;
  align?: "center" | "left";
  dark?: boolean;
}) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : "text-left"}`}>
      <Reveal>
        <p className="eyebrow" style={dark ? { color: "#e8d5a3" } : undefined}>{eyebrow}</p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className={`font-display mt-3 text-3xl font-semibold leading-[1.12] sm:text-4xl lg:text-[2.75rem] ${dark ? "text-white" : "text-ink"}`}>
          {title}
        </h2>
      </Reveal>
      {copy && (
        <Reveal delay={0.16}>
          <p className={`mt-4 text-[15.5px] leading-relaxed sm:text-base ${dark ? "text-ivory/70" : "text-muted"}`}>
            {copy}
          </p>
        </Reveal>
      )}
    </div>
  );
}
