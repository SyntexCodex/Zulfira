"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    image: "/banners/hero-gold-soft.webp",
    eyebrow: "Pakistan's Botanical Hair Ritual",
    title: "Strong Roots.",
    title2: "Silk Shine.",
    box: "From hair fall to healthy growth — powered by Zulfira",
    cta: "Order Now",
    href: "/shop",
  },
  {
    image: "/banners/lifestyle-pink.webp",
    eyebrow: "Bestseller · Revitalizing Hair Oil",
    title: "Nourish First.",
    title2: "Shine Always.",
    box: "Argan, coconut & castor — the pre-wash ritual your hair deserves",
    cta: "Shop the Oil",
    href: "/product/revitalizing-hair-oil",
  },
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 7000);
    return () => clearInterval(t);
  }, []);

  const s = SLIDES[index];

  return (
    <section className="relative overflow-hidden bg-gold-soft">
      <div className="relative h-[540px] sm:h-[600px] lg:h-[660px]">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <Image
              src={s.image}
              alt="Zulfira hero"
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gold-soft via-gold-soft/70 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.5 }}
              >
                <p className="eyebrow-red">{s.eyebrow}</p>
                <h1 className="mt-4 text-[44px] font-extrabold uppercase leading-[1.02] tracking-tight text-coal sm:text-6xl lg:text-7xl">
                  {s.title}
                  <br />
                  {s.title2}
                </h1>
                <div className="dashed-box mt-6 inline-block px-7 py-4">
                  <p className="text-center text-lg font-semibold text-coal sm:text-2xl">
                    {s.box}
                  </p>
                </div>
                <div className="mt-7">
                  <Link
                    href={s.href}
                    className="btn-dark inline-block rounded-full px-12 py-4 text-[15px] font-bold uppercase tracking-widest"
                  >
                    {s.cta}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 z-10">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 px-4">
            <button
              onClick={() => setIndex((index - 1 + SLIDES.length) % SLIDES.length)}
              aria-label="Previous slide"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 bg-white/70 backdrop-blur transition hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${i === index ? "bg-ink" : "bg-ink/25 hover:bg-ink/45"}`}
                />
              ))}
            </div>
            <button
              onClick={() => setIndex((index + 1) % SLIDES.length)}
              aria-label="Next slide"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 bg-white/70 backdrop-blur transition hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
