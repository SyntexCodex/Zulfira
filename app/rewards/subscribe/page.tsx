import type { Metadata } from "next";
import { CONTACT } from "@/lib/site";
import { RewardShell, RewardHero, Steps, DealProducts, CtaBand } from "@/components/rewards/reward-ui";

export const metadata: Metadata = {
  title: "Subscribe & Save 10% — Automatic Delivery | Zulfira",
  description:
    "Never run out of your ritual. Subscribe and get 10% off every delivery, automatic shipping every 45 days, free delivery, and pause or cancel anytime.",
};

const telHref = `tel:${CONTACT.phoneIntl.replace(/\s/g, "")}`;
const mailHref = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Subscribe & Save — please start my subscription")}`;

export default function SubscribeSavePage() {
  return (
    <RewardShell>
      <RewardHero
        kicker="Zulfira Loyalty · Subscribe & Save"
        title={<>Set it. Forget it. <span className="text-gold">Save 10%</span> forever.</>}
        subtitle="Your ritual, on autopilot. We ship your oil and shampoo every 45 days — 10% off every single delivery, free shipping, and you can pause or cancel anytime with one message."
        badge="10% OFF · Every 45 days · Free delivery"
        ctaLabel="Start my subscription"
        ctaHref={telHref}
        image="/products/bundle-ritual.webp"
        imageAlt="Zulfira Complete Ritual Bundle"
      />

      <Steps
        title="How Subscribe & Save works"
        steps={[
          {
            title: "Pick your ritual",
            text: "Choose the oil, the shampoo, or the Complete Ritual Bundle — whatever your hair needs.",
          },
          {
            title: "We ship every 45 days",
            text: "Your products arrive like clockwork, right when your last bottle starts running low.",
          },
          {
            title: "10% off, every time",
            text: "Subscriber pricing applies automatically to every recurring delivery. No codes to remember.",
          },
          {
            title: "Pause or cancel anytime",
            text: "Going on holiday? Stocked up? One call or email pauses everything — no lock-ins, ever.",
          },
        ]}
      />

      <DealProducts
        title="Subscriber prices"
        subtitle="What you pay every 45 days as a subscriber — locked in for as long as you stay subscribed."
        discount={0.1}
        discountLabel="Subscriber price · 10% off"
        ctaHref={telHref}
        ctaLabel="Subscribe now"
        note="Subscriptions are managed personally by our team — call or email and we'll set yours up in minutes."
      />

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="grid gap-4 rounded-3xl border border-gold/25 bg-white/[0.03] p-8 md:grid-cols-3 md:p-10">
          {[
            { t: "Never run out", d: "Timed to your usage — a 200ml oil and 400ml shampoo last roughly 45 days of regular ritual." },
            { t: "Priority dispatch", d: "Subscriber orders ship first, so your ritual never skips a beat." },
            { t: "Flexible by design", d: "Swap products, skip a cycle, or cancel — one message and it's done." },
          ].map((f) => (
            <div key={f.t}>
              <p className="font-bold text-gold">{f.t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/65">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBand
        title="Ready for hair care on autopilot?"
        text={`Call ${CONTACT.phoneDisplay} or email ${CONTACT.email} and tell us what you'd like delivered every 45 days — we'll handle the rest.`}
        ctaLabel={`Call ${CONTACT.phoneDisplay}`}
        ctaHref={telHref}
        secondaryCta={{ label: "Email us", href: mailHref }}
      />
    </RewardShell>
  );
}
