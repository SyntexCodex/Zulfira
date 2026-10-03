"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import Reveal, { SectionHeading } from "../Reveal";
import { Stars } from "../ProductCard";
import { REVIEWS } from "@/lib/site";

export default function Reviews() {
  const track = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    track.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  return (
    <section id="reviews" className="bg-cream py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading
            align="left"
            eyebrow="Customer Love"
            title={<>Real hair, real results.</>}
            copy="Thousands of customers across Pakistan trust the Zulfira ritual."
          />
          <div className="hidden gap-2 sm:flex">
            <button onClick={() => scroll(-1)} aria-label="Previous reviews" className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/12 bg-white hover:border-pine">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => scroll(1)} aria-label="Next reviews" className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/12 bg-white hover:border-pine">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <Reveal delay={0.1}>
          <div
            ref={track}
            className="mask-fade-x -mx-4 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6"
            style={{ scrollbarWidth: "none" }}
          >
            {REVIEWS.map((r) => (
              <article key={r.name} className="card w-[300px] shrink-0 snap-start p-6 sm:w-[340px]">
                <Stars rating={5} />
                <p className="mt-4 text-[14.5px] leading-relaxed text-ink/85">“{r.text}”</p>
                <div className="mt-5 flex items-center justify-between border-t border-ink/8 pt-4">
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-bold">
                      {r.name}
                      <BadgeCheck className="h-4 w-4 text-pine" />
                    </p>
                    <p className="text-xs text-muted">{r.city} · Verified buyer</p>
                  </div>
                  <span className="rounded-full bg-pine/8 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-pine">
                    {r.product}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
