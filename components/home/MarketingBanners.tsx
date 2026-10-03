"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "../Reveal";

const BANNERS = [
  {
    image: "/banners/banner-oil.webp",
    eyebrow: "Step 01 · Nourish",
    title: "The Revitalizing Hair Oil",
    copy: "Argan, coconut & castor — a pre-wash ritual for stronger roots and mirror shine.",
    href: "/product/revitalizing-hair-oil",
    cta: "Shop Hair Oil",
  },
  {
    image: "/banners/banner-shampoo.webp",
    eyebrow: "Step 02 · Cleanse",
    title: "The Sulphate-Free Shampoo",
    copy: "Keratin, aloe & silk protein — a gentle cleanse that never strips.",
    href: "/product/sulphate-free-shampoo",
    cta: "Shop Shampoo",
  },
];

export default function MarketingBanners() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="grid gap-6 md:grid-cols-2">
        {BANNERS.map((b, i) => (
          <Reveal key={b.title} delay={i * 0.1}>
            <Link
              href={b.href}
              className="group relative block overflow-hidden rounded-[1.75rem] shadow-sm"
            >
              <div className="relative aspect-[16/10]">
                <Image
                  src={b.image}
                  alt={b.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/72 via-ink/18 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold-soft">{b.eyebrow}</p>
                <h3 className="font-display mt-2 text-2xl font-semibold text-white sm:text-[1.7rem]">{b.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/75">{b.copy}</p>
                <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink transition-transform group-hover:translate-x-1">
                  {b.cta} <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
