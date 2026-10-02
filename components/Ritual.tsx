"use client";

import { motion } from "framer-motion";
import { Droplets, Sparkles, Wand2 } from "lucide-react";
import Reveal, { SectionHeading } from "./Reveal";

const STEPS = [
  {
    n: "01",
    icon: Droplets,
    title: "Nourish",
    copy: "Warm 5–8 drops of Zulfira Hair Oil between your palms. Massage into the scalp for 3 minutes to activate follicles and melt away stress.",
    accent: "text-gold",
    ring: "border-gold/40",
    glow: "bg-gold/15",
  },
  {
    n: "02",
    icon: Sparkles,
    title: "Cleanse",
    copy: "Rinse and cleanse with Zulfira Shampoo. The sulfate-smart foam lifts buildup while keratin and silk proteins seal every strand.",
    accent: "text-mint",
    ring: "border-mint/40",
    glow: "bg-mint/15",
  },
  {
    n: "03",
    icon: Wand2,
    title: "Reveal",
    copy: "Step out with glass-like shine and weightless movement. Repeat 2–3 times a week and watch the future unfold — strand by strand.",
    accent: "text-gold-soft",
    ring: "border-gold-soft/40",
    glow: "bg-gold-soft/10",
  },
];

export default function Ritual() {
  return (
    <section id="ritual" className="relative overflow-hidden py-28 sm:py-36">
      <div className="grid-lines absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          kicker="The Ritual"
          title={
            <>
              Three steps to <span className="text-mint-gradient">otherworldly</span> hair
            </>
          }
          copy="A ritual so simple it feels like cheating — and so effective it feels like science fiction."
        />

        <div className="relative mt-20">
          {/* connector line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-gold/50 via-mint/40 to-gold/50 lg:block" />

          <div className="space-y-10 lg:space-y-0">
            {STEPS.map((s, i) => (
              <div key={s.n} className={`lg:grid lg:grid-cols-2 lg:gap-16 ${i % 2 ? "" : ""}`}>
                <Reveal
                  className={i % 2 ? "lg:col-start-2" : "lg:col-start-1 lg:text-right"}
                  delay={0.05}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`glass relative inline-block w-full rounded-[26px] p-8 text-left sm:p-10 ${i % 2 ? "" : "lg:text-left"}`}
                  >
                    <span className={`font-display text-7xl font-extrabold opacity-15 ${s.accent}`}>
                      {s.n}
                    </span>
                    <div className={`mt-2 inline-flex h-14 w-14 items-center justify-center rounded-2xl border ${s.ring} ${s.glow}`}>
                      <s.icon className={`h-7 w-7 ${s.accent}`} />
                    </div>
                    <h3 className="font-display mt-5 text-3xl font-extrabold">{s.title}</h3>
                    <p className="mt-3 leading-relaxed text-muted">{s.copy}</p>
                  </motion.div>
                </Reveal>
                {i < STEPS.length - 1 && <div className="hidden lg:block lg:h-14" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
