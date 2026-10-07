import type { Metadata } from "next";
import Link from "next/link";
import { RewardShell, RewardHero, Steps, CtaBand } from "@/components/rewards/reward-ui";

export const metadata: Metadata = {
  title: "Review Rewards — Earn Rs 150 Per Video Review | Zulfira",
  description:
    "Your results are worth real money. Earn Rs 75 for every photo review and Rs 150 for every video review as Zulfira store credit.",
};

const TIERS = [
  {
    name: "Photo Review",
    credit: "Rs 75",
    text: "Snap your ritual or your results and write an honest review of the product you bought.",
    perks: ["Rs 75 store credit", "Counts from your first order", "Credit never expires"],
  },
  {
    name: "Video Review",
    credit: "Rs 150",
    text: "Film a 30-second clip showing your hair, your routine, or your transformation story.",
    perks: ["Rs 150 store credit", "Featured on our page", "Counts toward challenge entry"],
    featured: true,
  },
];

export default function ReviewRewardsPage() {
  return (
    <RewardShell>
      <RewardHero
        kicker="Zulfira Loyalty · Review Rewards"
        title={<>Your selfie <span className="text-gold">pays</span> for your next bottle</>}
        subtitle="Real results deserve real rewards. Review the Zulfira products you've used and earn store credit — Rs 75 for a photo review, Rs 150 for a video review. Spend it on anything."
        badge="Rs 75 photo · Rs 150 video · Real credit"
        ctaLabel="Review my order"
        ctaHref="/track-order"
        image="/products/oil-detail.webp"
        imageAlt="Golden Zulfira hair oil drops"
      />

      <Steps
        title="How to earn review credit"
        steps={[
          {
            title: "Get your order delivered",
            text: "Reviews unlock once your order shows as delivered — so every review is from a real customer.",
          },
          {
            title: "Post photo or video",
            text: "Open your tracking page and submit your review with a photo or a short video clip.",
          },
          {
            title: "We approve & credit you",
            text: "Our team reviews every submission within 48 hours and issues your credit code by SMS and email.",
          },
          {
            title: "Spend it on anything",
            text: "Credit works on oil, shampoo, bundles — and stacks with free delivery on all orders.",
          },
        ]}
      />

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-center font-display text-2xl md:text-4xl">Pick your reward tier</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-white/60">
          One review per product per order — but every new order is a new chance to earn.
        </p>
        <div className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-2">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`relative overflow-hidden rounded-3xl border p-8 ${
                t.featured ? "border-gold bg-gold/[0.08]" : "border-gold/25 bg-white/[0.03]"
              }`}
            >
              {t.featured && (
                <span className="absolute right-5 top-5 rounded-full bg-gold px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-black">
                  Best value
                </span>
              )}
              <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-gold">{t.name}</p>
              <p className="font-display mt-2 text-5xl text-gold">{t.credit}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/65">{t.text}</p>
              <ul className="mt-5 space-y-2">
                {t.perks.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-white/75">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-gold/25 bg-black/40 p-6 text-center">
          <p className="text-sm text-white/70">
            <span className="font-bold text-gold">Do the math:</span> two video reviews earn Rs 300 — that's
            nearly a third of your next bottle, just for showing your gorgeous hair.
          </p>
          <Link
            href="/track-order"
            className="mt-4 inline-block rounded-full border border-gold px-7 py-3 text-sm font-bold text-gold transition hover:bg-gold hover:text-black"
          >
            Find my delivered order
          </Link>
        </div>
      </section>

      <CtaBand
        title="Your results are currency"
        text="Delivered order in hand? Your review is 5 minutes away from real store credit."
        ctaLabel="Write my review"
        ctaHref="/track-order"
      />
    </RewardShell>
  );
}
