"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "../Reveal";

export default function LifestyleBanner() {
  return (
    <section className="relative overflow-hidden">
      <Reveal>
        <Link href="/shop" className="group relative block h-[380px] sm:h-[460px]">
          <Image
            src="/banners/lifestyle-ritual.webp"
            alt="Zulfira lifestyle"
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
              <p className="eyebrow-red !text-white/90">The Zulfira Ritual</p>
              <h2 className="section-title mt-3 max-w-xl text-3xl text-white sm:text-5xl">
                Two steps. Zero compromise.
              </h2>
              <span className="mt-6 inline-block rounded-full bg-white px-10 py-3.5 text-sm font-bold uppercase tracking-widest text-ink transition group-hover:bg-gold-soft">
                Shop Now
              </span>
            </div>
          </div>
        </Link>
      </Reveal>
    </section>
  );
}
