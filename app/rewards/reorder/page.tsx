import type { Metadata } from "next";
import Link from "next/link";
import { RewardShell } from "@/components/rewards/reward-ui";

export const metadata: Metadata = {
  title: "Rewards & Loyalty — 8 Ways Zulfira Pays You Back | Zulfira",
  description:
    "Reorder discounts, subscriptions, review credit, welcome gifts, the 30-day challenge, trial gifting, Insiders club and even profit-share. Explore all 8 Zulfira reward programs.",
};

const PROGRAMS = [
  {
    name: "Reorder Rewards",
    href: "/rewards/reorder",
    badge: "10% OFF",
    blurb: "Every delivery ships with a personal 10% code. Loyal rituals get rewarded on autopilot.",
  },
  {
    name: "Subscribe & Save",
    href: "/rewards/subscribe",
    badge: "10% OFF",
    blurb: "Automatic delivery every 45 days at subscriber prices. Pause or cancel anytime.",
  },
  {
    name: "Review Rewards",
    href: "/rewards/reviews",
    badge: "Rs 150",
    blurb: "Rs 75 for a photo review, Rs 150 for a video review — real store credit for real results.",
  },
  {
    name: "Welcome Gift",
    href: "/rewards/welcome",
    badge: "20% OFF",
    blurb: "Your first box hides a gold card worth 20% off your entire next order. Code INBOX20.",
  },
  {
    name: "30-Day Hair Challenge",
    href: "/challenge",
    badge: "WIN BIG",
    blurb: "Post your ritual for 30 days. Finishers win a free bundle — best transformation wins a year's supply.",
  },
  {
    name: "Gift a Trial",
    href: "/gift-trial",
    badge: "Rs 200",
    blurb: "Send a friend a free 100ml trial bottle and earn Rs 200 credit when they fall in love.",
  },
  {
    name: "Zulfira Insiders",
    href: "/rewards/insiders",
    badge: "15% OFF",
    blurb: "The members' club: 15% off everything, early access, birthday gifts and secret sales.",
  },
  {
    name: "1% Equity Program",
    href: "/equity",
    badge: "PROFIT SHARE",
    blurb: "Our boldest thank-you: own a slice of Zulfira and earn monthly profit-share payouts.",
  },
];

export default function RewardsHubPage() {
  return (
    <RewardShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(800px 420px at 50% -100px, rgba(232,193,90,0.16), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-4xl px-4 pb-12 pt-16 text-center md:pt-24">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-gold">Zulfira Loyalty</p>
          <h1 className="font-display mt-4 text-4xl leading-tight md:text-6xl">
            8 ways we <span className="text-gold">pay you back</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            Great hair shouldn't cost a fortune — and loyalty shouldn't go unnoticed. Pick the rewards
            that fit your ritual, stack them, and watch your hair care pay for itself.
          </p>
          <div className="mx-auto mt-6 h-px w-24 bg-gold/60" />
        </div>
      </section>

      {/* Program grid */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROGRAMS.map((p, i) => (
            <Link
              key={p.name}
              href={p.href}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-gold/25 bg-white/[0.03] p-7 transition hover:-translate-y-1 hover:border-gold/60 hover:bg-gold/[0.06]"
            >
              <span className="absolute right-5 top-5 rounded-full bg-gold px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-black">
                {p.badge}
              </span>
              <span className="font-display text-lg text-white/30">0{i + 1}</span>
              <h2 className="mt-2 text-xl font-bold text-gold">{p.name}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/65">{p.blurb}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white transition group-hover:text-gold">
                Explore
                <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Stacking note */}
      <section className="mx-auto max-w-4xl px-4 pb-20 text-center">
        <div className="rounded-3xl border border-gold/30 bg-gold/[0.06] p-8 md:p-10">
          <h2 className="font-display text-2xl md:text-3xl">
            Rewards <span className="text-gold">stack</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/65">
            Join Insiders for 15% off, pay with review credit, and toss in your reorder code where it fits —
            every program is designed to combine. The more loyal your ritual, the less it costs.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-block rounded-full bg-gold px-9 py-3.5 text-sm font-extrabold text-black transition hover:bg-gold-deep"
          >
            Start earning — shop now
          </Link>
        </div>
      </section>
    </RewardShell>
  );
}
