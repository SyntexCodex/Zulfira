import { Leaf, FlaskConical, HeartHandshake, BadgeCheck, Truck, Sparkles } from "lucide-react";
import Reveal, { SectionHeading } from "../Reveal";

const ITEMS = [
  { icon: Leaf, title: "Botanical First", copy: "Cold-pressed oils and plant extracts lead every formula — never fillers." },
  { icon: FlaskConical, title: "Science-Backed", copy: "Each blend is balanced for pH and performance, then tested for safety." },
  { icon: HeartHandshake, title: "Honest & Local", copy: "Proudly Pakistani. Fair prices, no exaggerated claims, no fine print." },
  { icon: BadgeCheck, title: "Clean Standards", copy: "No sulphates, parabens, silicones or mineral oil. Ever." },
  { icon: Truck, title: "Cash on Delivery", copy: "Pay at your doorstep. Easy ordering on WhatsApp, nationwide shipping." },
  { icon: Sparkles, title: "Visible Results", copy: "Stronger, shinier, calmer hair — or tell us and we'll make it right." },
];

export default function WhyUs() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading
        eyebrow="Why Zulfira"
        title={<>Chosen for a reason.</>}
        copy="We do a few things, and we do them properly."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((it, i) => (
          <Reveal key={it.title} delay={(i % 3) * 0.08}>
            <div className="card card-hover h-full p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pine/8">
                <it.icon className="h-6 w-6 text-pine" />
              </span>
              <h3 className="font-display mt-5 text-xl font-semibold">{it.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{it.copy}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
