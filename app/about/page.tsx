import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Leaf, Eye, HeartHandshake } from "lucide-react";
import Reveal, { SectionHeading } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Our Story — Zulfira",
  description: "The Zulfira story: honest, botanical hair care crafted in Pakistan.",
};

const VALUES = [
  { icon: Leaf, title: "Nature first", copy: "Every formula starts with botanicals we can name — argan, coconut, aloe, moringa — never mystery fillers." },
  { icon: Eye, title: "Radical honesty", copy: "We say exactly what's inside and what each ingredient does. No miracle claims, no fine print." },
  { icon: HeartHandshake, title: "Made for Pakistan", copy: "Formulated for Pakistani hair and weather, priced fairly, and delivered with Cash on Delivery nationwide." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-blush">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2">
          <div>
            <Reveal><p className="eyebrow-red">Our Story</p></Reveal>
            <Reveal delay={0.08}>
              <h1 className="section-title mt-4 text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
                Hair care worth <span className="text-maroon">trusting.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-ink/70">
                Zulfira began with a simple frustration: shelves full of harsh, over-promising
                hair products. We set out to make the opposite — two honest formulas, built on
                botanicals, that actually work for Pakistani hair.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div className="relative aspect-[4/3.2] overflow-hidden rounded-3xl">
              <Image src="/brand/about-brand.webp" alt="Zulfira craftsmanship" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="Brand Vision"
          title={<>Simple formulas. Honest promises.</>}
          copy="We believe fewer, better products beat endless shelves. That's why Zulfira makes just two signature formulas — a Revitalizing Hair Oil and a Sulphate-Free Shampoo — perfected to work as one complete ritual."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <div className="card-soft h-full p-8 transition-transform hover:-translate-y-1">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blush">
                  <v.icon className="h-6 w-6 text-maroon" />
                </span>
                <h3 className="section-title mt-5 text-xl">{v.title}</h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">{v.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <div className="relative aspect-[4/3.4] overflow-hidden rounded-3xl">
              <Image src="/brand/ingredients-flatlay.webp" alt="Natural ingredients" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </Reveal>
          <div>
            <SectionHeading
              align="left"
              eyebrow="Inside the bottle"
              title={<>Ingredients we can pronounce.</>}
              copy="Argan for repair. Coconut for moisture. Castor for growth. Keratin and silk protein for strength and shine. Aloe and moringa to calm the scalp. That's the Zulfira pantry — no sulphates, no parabens, no silicones, no mineral oil."
            />
            <Reveal delay={0.15}>
              <Link href="/shop" className="btn-maroon mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold">
                Shop the Collection <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-ink py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 text-center sm:px-6 md:grid-cols-4">
          {[
            ["2", "Signature formulas"],
            ["10k+", "Happy customers"],
            ["4.9", "Average rating"],
            ["0", "Sulphates or parabens"],
          ].map(([n, l], i) => (
            <Reveal key={l} delay={i * 0.07}>
              <p className="section-title text-4xl text-white sm:text-5xl">{n}</p>
              <p className="mt-2 text-sm text-white/60">{l}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
