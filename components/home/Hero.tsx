"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    image: "/banners/hero-main.webp",
    eyebrow: "Natural Hair Care · Pakistan",
    title: "Healthy hair,",
    accent: "the honest way.",
    copy: "Botanical formulas with no sulphates, no parabens and no shortcuts — crafted for Pakistani hair, delivered to your doorstep.",
    cta: "Shop the Ritual",
    href: "/shop",
  },
  {
    image: "/banners/hair-lifestyle.webp",
    eyebrow: "Bestseller · Revitalizing Hair Oil",
    title: "Shine that speaks",
    accent: "before you do.",
    copy: "Our signature oil blend of argan, coconut and castor — loved by thousands for visibly stronger, silkier hair.",
    cta: "Discover the Oil",
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
    <section className="relative overflow-hidden bg-cream">
      <div className="relative h-[560px] sm:h-[620px] lg:h-[680px]">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={s.image}
              alt="Zulfira hero"
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ivory via-ivory/72 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-ivory/60 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6">
          <div className="max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="eyebrow">{s.eyebrow}</p>
                <h1 className="font-display mt-4 text-[42px] font-semibold leading-[1.04] text-ink sm:text-6xl lg:text-[4.4rem]">
                  {s.title}
                  <br />
                  <span className="italic text-pine">{s.accent}</span>
                </h1>
                <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-ink/70 sm:text-base">
                  {s.copy}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={s.href}
                    className="btn-primary inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold"
                  >
                    {s.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/about"
                    className="btn-outline inline-flex items-center rounded-full px-8 py-3.5 text-[15px] font-semibold"
                  >
                    Our Story
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* slider controls */}
        <div className="absolute bottom-6 left-0 right-0 z-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
            <div className="flex gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-10 bg-pine" : "w-4 bg-ink/20 hover:bg-ink/35"}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIndex((index - 1 + SLIDES.length) % SLIDES.length)}
                aria-label="Previous slide"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-ink shadow backdrop-blur transition hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIndex((index + 1) % SLIDES.length)}
                aria-label="Next slide"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-ink shadow backdrop-blur transition hover:bg-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
