"use client";

import Reveal from "../Reveal";

export default function Mission() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-16">
      <Reveal>
        <h2 className="text-sm font-extrabold uppercase tracking-[0.24em]">-Zulfira-</h2>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-5 text-[15px] leading-[1.9] text-ink/75">
          At <strong className="text-ink">Zulfira</strong>, our mission is to empower you with premium,
          natural, and science-backed hair care that enhances beauty and confidence. We are committed
          to clean, effective formulas made with carefully sourced botanicals — ensuring purity in
          every drop. Through honesty and craftsmanship, we help you embrace healthier,
          more radiant hair — naturally.
        </p>
      </Reveal>
    </section>
  );
}
