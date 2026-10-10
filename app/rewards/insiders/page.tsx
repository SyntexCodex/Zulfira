import type { Metadata } from "next";
import { RewardShell, RewardHero, Steps, DealProducts, CtaBand } from "@/components/rewards/reward-ui";

export const metadata: Metadata = {
  title: "Zulfira Insiders — Members Save 15% | Zulfira",
  description:
    "Join Zulfira Insiders for members-only pricing (15% off everything), early access to launches, birthday gifts, and a direct line to the founders.",
};

const PERKS = [
  { t: "15% off everything", d: "Personal one-time member codes — 15% off, unique to you, on every order." },
  { t: "Early access", d: "Shop new launches 48 hours before anyone else, with insider-only bundle deals." },
  { t: "Birthday gift", d: "A free 100ml trial bottle lands on your doorstep every year on your birthday." },
  { t: "Founder's circle", d: "Vote on new scents, shades and products. Insiders shape what Zulfira becomes." },
  { t: "Priority support", d: "Jump the queue — insider messages get answered first, every time." },
  { t: "Secret sales", d: "Flash insider-only sales up to 30% off, announced only inside the circle." },
];

export default function InsidersPage() {
  return (
    <RewardShell>
      <RewardHero
        kicker="Zulfira Loyalty · Insiders Circle"
        title={<>Welcome to the <span className="text-gold">inner circle</span></>}
        subtitle="Zulfira Insiders is our members' club for the obsessed — the ones who never miss wash day. Members unlock 15% off everything, early access to launches, birthday gifts and a direct line to us."
        badge="Members save 15% · Personal codes"
        ctaLabel="Join the circle"
        ctaHref="/contact"
        image="/products/shampoo-front.webp"
        imageAlt="Zulfira Sulphate-Free Shampoo"
      />

      <Steps
        title="How to become an Insider"
        steps={[
          {
            title: "Say hello",
            text: "Send us a message with the word INSIDER — by email or through the contact form.",
          },
          {
            title: "Get your member code",
            text: "We reply within 24 hours with your personal insider code and welcome pack details.",
          },
          {
            title: "Unlock member prices",
            text: "Your personal code takes 15% off your order — unique, one-time use, made just for you. It stacks with free delivery.",
          },
          {
            title: "Enjoy the perks",
            text: "Early access, birthday gifts, secret sales — the circle takes care of its own.",
          },
        ]}
      />

      <DealProducts
        title="Insider prices"
        subtitle="What members pay — every day, on every product, no sale required."
        discount={0.15}
        discountLabel="Insider price · 15% off"
        ctaHref="/contact"
        ctaLabel="Become an Insider"
        note="Your personal one-time member code applies 15% off at checkout."
      />

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-center font-display text-2xl md:text-4xl">The full insider treatment</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PERKS.map((p) => (
            <div key={p.t} className="rounded-2xl border border-gold/25 bg-white/[0.03] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
                </svg>
              </div>
              <p className="mt-4 font-bold text-gold">{p.t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/65">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBand
        title="The circle is open"
        text="Membership is free — all it takes is one message. Join Zulfira Insiders today and unlock your personal 15% code."
        ctaLabel="Join the circle"
        ctaHref="/contact"
      />
    </RewardShell>
  );
}
