"use client";

import { Star } from "lucide-react";
import { SectionHeading } from "./Reveal";

const REVIEWS = [
  { name: "Areeba K.", city: "Lahore", text: "My hair fall visibly reduced in three weeks. The oil smells divine and doesn't leave my pillow greasy.", product: "Hair Oil" },
  { name: "Danish R.", city: "Karachi", text: "Finally a shampoo that cleans without that straw-like dryness. My curls have never looked this defined.", product: "Shampoo" },
  { name: "Mahnoor S.", city: "Islamabad", text: "Ordered on WhatsApp, paid cash on delivery. Arrived in 2 days. The packaging feels like a gift to myself.", product: "Ritual Bundle" },
  { name: "Hassan J.", city: "Faisalabad", text: "I was skeptical about 'futuristic' marketing, but the shine is unreal. Colleagues keep asking what I use.", product: "Hair Oil" },
  { name: "Iqra M.", city: "Multan", text: "Dandruff gone, scalp calm, hair soft. The bundle is worth every rupee — CoD made it so easy to try.", product: "Ritual Bundle" },
  { name: "Bilal A.", city: "Rawalpindi", text: "Two washes with the shampoo and my frizz surrendered. Ordering through WhatsApp took literally one minute.", product: "Shampoo" },
];

function Card({ r }: { r: (typeof REVIEWS)[number] }) {
  return (
    <div className="glass w-[320px] shrink-0 rounded-[22px] p-6 sm:w-[380px]">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-gold text-gold" />
        ))}
      </div>
      <p className="mt-4 text-[15px] leading-relaxed text-cream/90">“{r.text}”</p>
      <div className="mt-5 flex items-center justify-between">
        <div>
          <div className="font-display font-bold">{r.name}</div>
          <div className="text-xs text-muted">{r.city}</div>
        </div>
        <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-gold">
          {r.product}
        </span>
      </div>
    </div>
  );
}

export default function Reviews() {
  return (
    <section id="reviews" className="relative overflow-hidden py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          kicker="Transmissions"
          title={
            <>
              Loved across <span className="text-gold-gradient">the nation</span>
            </>
          }
          copy="Real words from early adopters of the Zulfira ritual."
        />
      </div>

      <div className="mt-16 space-y-6">
        <div className="mask-fade-x overflow-hidden">
          <div className="flex w-max gap-6 animate-marquee-slow px-3">
            {[...REVIEWS.slice(0, 3), ...REVIEWS.slice(0, 3)].map((r, i) => (
              <Card key={i} r={r} />
            ))}
          </div>
        </div>
        <div className="mask-fade-x overflow-hidden">
          <div className="flex w-max gap-6 animate-marquee-reverse px-3">
            {[...REVIEWS.slice(3), ...REVIEWS.slice(3)].map((r, i) => (
              <Card key={i} r={r} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
