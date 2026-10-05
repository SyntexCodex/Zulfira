"use client";

import Reveal from "../Reveal";

export default function CustomerStories() {
  return (
    <section className="bg-coal py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-gold">
              Customer Stories
            </p>
            <h2 className="section-title mt-3 text-3xl text-white sm:text-5xl">
              Real People. <span className="text-gold">Real Hair.</span>
            </h2>
            <div className="mx-auto mt-5 h-px w-16 bg-gold/60" />
            <p className="mx-auto mt-4 max-w-xl text-[14.5px] leading-relaxed text-white/60">
              No scripts, no studio lights — just honest results from the
              Zulfira community.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mx-auto mt-10 max-w-[300px] sm:max-w-[320px]">
            {/* phone-style frame */}
            <div className="overflow-hidden rounded-[2rem] border-2 border-gold/70 bg-black shadow-[0_30px_60px_-20px_rgba(201,162,39,0.35)]">
              <div className="relative aspect-[9/16] w-full">
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  src="/videos/customer-review-1.mp4"
                  controls
                  playsInline
                  preload="metadata"
                  aria-label="Customer video testimonial for Zulfira"
                />
              </div>
            </div>
            <p className="mt-5 text-center text-sm leading-relaxed text-white/60">
              Watch a real customer share their{" "}
              <span className="font-semibold text-gold">Zulfira ritual</span>
            </p>
            <div className="mt-3 flex items-center justify-center gap-1.5" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  viewBox="0 0 20 20"
                  className="h-4 w-4 fill-gold"
                >
                  <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                </svg>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
