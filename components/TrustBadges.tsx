"use client";

import { Leaf, FlaskConical, Rabbit, Sparkles, BadgeCheck, Truck } from "lucide-react";
import { TRUST_BADGES } from "@/lib/site";
import Reveal from "./Reveal";

const ICONS = [FlaskConical, Leaf, Leaf, Rabbit, BadgeCheck, Truck];

export default function TrustBadges() {
  return (
    <section className="border-y border-ink/8 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
          {TRUST_BADGES.map((b, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Reveal key={b} delay={i * 0.05}>
                <div className="flex flex-col items-center gap-2.5 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pine/8">
                    <Icon className="h-5 w-5 text-pine" />
                  </span>
                  <span className="text-[13px] font-semibold text-ink/80">{b}</span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
