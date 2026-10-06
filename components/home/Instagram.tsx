"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import Reveal from "../Reveal";
import { INSTAGRAM_POSTS, SOCIAL_LINKS } from "@/lib/site";

export default function Instagram() {
  return (
    <section className="bg-gold-faint py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <h2 className="section-title text-3xl sm:text-4xl">Follow @zulfira_0</h2>
            <p className="mx-auto mt-3 max-w-xl text-[14.5px] text-muted">
              Real routines, real results — join our community on Instagram.
            </p>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {INSTAGRAM_POSTS.map((p, i) => (
            <Reveal key={p.image} delay={i * 0.06}>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden rounded-2xl"
                aria-label={p.label}
              >
                <div className="relative aspect-[4/5] bg-gold-soft">
                  <Image
                    src={p.image}
                    alt={p.label}
                    fill
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                  <span className="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-white opacity-0 transition group-hover:scale-100 group-hover:opacity-100">
                    <Play className="ml-0.5 h-5 w-5 fill-ink text-ink" />
                  </span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-dark inline-block rounded-full px-12 py-3.5 text-sm font-bold uppercase tracking-widest"
          >
            Visit Instagram
          </a>
        </Reveal>
      </div>
    </section>
  );
}
