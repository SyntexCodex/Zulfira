import Image from "next/image";
import Link from "next/link";
import { PRODUCTS, formatPKR, type Product } from "@/lib/site";

/* ------------------------------------------------------------------ */
/*  Shared building blocks for the Zulfira Rewards landing pages.      */
/*  Dark + gold brand system, matching /challenge and /equity.         */
/* ------------------------------------------------------------------ */

export function RewardHero({
  kicker,
  title,
  subtitle,
  badge,
  ctaLabel,
  ctaHref,
  image,
  imageAlt,
}: {
  kicker: string;
  title: React.ReactNode;
  subtitle: string;
  badge?: string;
  ctaLabel: string;
  ctaHref: string;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(700px 380px at 50% -80px, rgba(232,193,90,0.14), transparent 70%)" }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-14 md:grid-cols-[1.2fr_1fr] md:pt-20">
        <div className="text-center md:text-left">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-gold">{kicker}</p>
          <h1 className="font-display mt-4 text-4xl leading-tight md:text-6xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70 md:mx-0">{subtitle}</p>
          {badge && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2.5">
              <span className="h-2 w-2 rounded-full bg-gold" />
              <span className="text-sm font-bold text-gold">{badge}</span>
            </div>
          )}
          <div className="mt-8">
            <Link
              href={ctaHref}
              className="inline-block rounded-full bg-gold px-9 py-3.5 text-sm font-extrabold text-black transition hover:bg-gold-deep"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
        {image && (
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border border-gold/25 shadow-[0_20px_60px_-20px_rgba(232,193,90,0.35)]">
            <Image src={image} alt={imageAlt ?? ""} fill className="object-cover" sizes="400px" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        )}
      </div>
    </section>
  );
}

export function Steps({
  title,
  steps,
}: {
  title: string;
  steps: { title: string; text: string }[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14">
      <h2 className="text-center font-display text-2xl md:text-4xl">{title}</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.title} className="rounded-2xl border border-gold/25 bg-white/[0.03] p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-base font-extrabold text-black">
              {i + 1}
            </div>
            <p className="mt-4 font-bold text-gold">{s.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-white/65">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function dealPrice(p: Product, discount: number) {
  return Math.round(p.price * (1 - discount));
}

export function DealProducts({
  title,
  subtitle,
  discount,
  discountLabel,
  ctaHref = "/shop",
  ctaLabel = "Shop the deal",
  note,
}: {
  title: string;
  subtitle?: string;
  /** e.g. 0.1 for 10% off */
  discount: number;
  discountLabel: string;
  ctaHref?: string;
  ctaLabel?: string;
  note?: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-b from-gold/[0.08] to-transparent p-8 md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-gold">{discountLabel}</p>
            <h2 className="font-display mt-2 text-2xl md:text-4xl">{title}</h2>
            {subtitle && <p className="mt-2 max-w-xl text-sm text-white/60">{subtitle}</p>}
          </div>
          <Link
            href={ctaHref}
            className="rounded-full border border-gold px-7 py-3 text-sm font-bold text-gold transition hover:bg-gold hover:text-black"
          >
            {ctaLabel}
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {PRODUCTS.map((p) => {
            const deal = dealPrice(p, discount);
            const save = p.price - deal;
            return (
              <Link
                key={p.slug}
                href={`/product/${p.slug}`}
                className="group overflow-hidden rounded-2xl border border-gold/20 bg-black/40 transition hover:border-gold/50"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={p.gallery[0]}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="400px"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-[11px] font-extrabold text-black">
                    -{Math.round(discount * 100)}%
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/45">{p.size}</p>
                  <h3 className="mt-1 font-bold leading-snug">{p.name}</h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-2xl text-gold">{formatPKR(deal)}</span>
                    <span className="text-sm text-white/40 line-through">{formatPKR(p.price)}</span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-emerald-400">You save {formatPKR(save)}</p>
                </div>
              </Link>
            );
          })}
        </div>
        {note && <p className="mt-6 text-center text-xs text-white/45">{note}</p>}
      </div>
    </section>
  );
}

export function CtaBand({
  title,
  text,
  ctaLabel,
  ctaHref,
  secondaryCta,
}: {
  title: string;
  text: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCta?: { label: string; href: string };
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20">
      <div className="relative overflow-hidden rounded-3xl bg-gold px-8 py-12 text-center text-black md:py-14">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(500px 260px at 50% 0%, rgba(255,255,255,0.35), transparent 70%)" }}
        />
        <h2 className="font-display relative text-3xl md:text-4xl">{title}</h2>
        <p className="relative mx-auto mt-3 max-w-xl text-sm font-medium text-black/70">{text}</p>
        <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={ctaHref}
            className="inline-block rounded-full bg-black px-9 py-3.5 text-sm font-extrabold text-gold transition hover:bg-[#1a1a1a]"
          >
            {ctaLabel}
          </Link>
          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className="inline-block rounded-full border-2 border-black/70 px-9 py-3 text-sm font-extrabold text-black transition hover:bg-black hover:text-gold"
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>
        <p className="relative mt-5 text-[11px] font-bold uppercase tracking-[0.25em] text-black/50">
          Free delivery · Cash on delivery · zulfira.shop
        </p>
      </div>
    </section>
  );
}

export function RewardShell({ children }: { children: React.ReactNode }) {
  return <div className="bg-[#0B0B0B] text-white">{children}</div>;
}
