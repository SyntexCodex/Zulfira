"use client";

const ITEMS = [
  "Cash on Delivery",
  "100% Botanical Actives",
  "Sulfate-Smart Cleanse",
  "Nationwide Shipping",
  "Argan + Keratin",
  "WhatsApp Ordering",
];

function Row({ reverse = false }: { reverse?: boolean }) {
  const items = [...ITEMS, ...ITEMS];
  return (
    <div className="mask-fade-x overflow-hidden">
      <div className={`flex w-max gap-0 ${reverse ? "animate-marquee-reverse" : "animate-marquee-slow"}`}>
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-6 px-6">
            <span className="font-display text-sm font-bold uppercase tracking-[0.3em] text-gold/90">
              {t}
            </span>
            <span className="h-2 w-2 rotate-45 bg-mint/70" />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="relative border-y border-gold/15 bg-panel/60 py-5">
      <Row />
    </div>
  );
}
