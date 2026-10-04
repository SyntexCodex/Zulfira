"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "../Reveal";
import { CATEGORIES } from "@/lib/site";

export default function Categories() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <Reveal>
        <div className="flex items-end justify-between">
          <h2 className="section-title text-3xl sm:text-4xl">Shop By Categories</h2>
          <Link
            href="/shop"
            className="hidden items-center gap-1.5 text-sm font-semibold text-ink/70 hover:text-ink sm:inline-flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((c, i) => (
          <Reveal key={c.slug} delay={(i % 6) * 0.06}>
            <Link
              href={`/collections/${c.slug}`}
              className="card-soft group block overflow-hidden"
            >
              <div className="relative aspect-[4/4.6] overflow-hidden bg-blush">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                  <p className="text-[15px] font-extrabold text-white drop-shadow">{c.name}</p>
                  <p className="mt-0.5 text-[11.5px] font-medium text-white/85">{c.tagline}</p>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
