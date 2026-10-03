import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal, { SectionHeading } from "../Reveal";

export default function Philosophy() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-[1.75rem]">
            <div className="relative aspect-[4/4.6] sm:aspect-[4/3.4] lg:aspect-[4/4.4]">
              <Image
                src="/brand/about-brand.webp"
                alt="Zulfira brand philosophy"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-5 left-5 rounded-2xl bg-white/92 px-5 py-4 shadow-lg backdrop-blur">
              <p className="font-display text-2xl font-bold text-pine">100%</p>
              <p className="text-xs font-medium text-muted">Botanical-first formulas</p>
            </div>
          </div>
        </Reveal>
        <div>
          <SectionHeading
            align="left"
            eyebrow="Brand Philosophy"
            title={<>Care, honesty & respect for nature.</>}
            copy="At Zulfira, we believe great hair shouldn't need harsh chemistry. We blend time-tested botanicals with modern cosmetic science — every formula is sulphate-free, paraben-free and cruelty-free, made with care in Pakistan."
          />
          <Reveal delay={0.2}>
            <div className="mt-7 grid grid-cols-2 gap-4">
              {[
                ["No Sulphates", "Gentle on scalp & color"],
                ["No Parabens", "Clean preservation"],
                ["Cruelty Free", "Never tested on animals"],
                ["Honest Pricing", "Premium, minus the markup"],
              ].map(([t, s]) => (
                <div key={t} className="rounded-2xl bg-ivory p-4">
                  <p className="text-[14.5px] font-bold text-ink">{t}</p>
                  <p className="mt-1 text-[13px] text-muted">{s}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.28}>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 font-semibold text-pine hover:gap-3 transition-all"
            >
              Read our story <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
