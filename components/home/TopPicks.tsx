"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "../Reveal";
import ProductCard from "../ProductCard";
import { PRODUCTS } from "@/lib/site";

export default function TopPicks() {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => track.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <section className="bg-gold-faint py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="flex items-end justify-between">
            <h2 className="section-title text-3xl sm:text-4xl">Top Picks For You</h2>
            <div className="flex items-center gap-2">
              <Link
                href="/shop"
                className="mr-2 hidden items-center gap-1.5 text-sm font-semibold text-ink/70 hover:text-ink sm:inline-flex"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
              <button onClick={() => scroll(-1)} aria-label="Scroll left" className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-white transition hover:bg-ink hover:text-white">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => scroll(1)} aria-label="Scroll right" className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-white transition hover:bg-ink hover:text-white">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div
            ref={track}
            className="no-scrollbar mask-fade-x -mx-4 mt-8 flex snap-x gap-5 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6"
          >
            {PRODUCTS.map((p, i) => (
              <div key={p.slug} className="w-[260px] shrink-0 snap-start sm:w-[300px]">
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
