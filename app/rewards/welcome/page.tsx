import type { Metadata } from "next";
import { RewardShell, RewardHero, Steps, DealProducts, CtaBand } from "@/components/rewards/reward-ui";
import CopyCode from "@/components/rewards/CopyCode";

export const metadata: Metadata = {
  title: "Welcome Gift — 20% Off With Code INBOX20 | Zulfira",
  description:
    "Every first Zulfira box hides a gold welcome card worth 20% off your next order. Enter code INBOX20 at checkout and save on your entire ritual.",
};

export default function WelcomeGiftPage() {
  return (
    <RewardShell>
      <RewardHero
        kicker="Zulfira Loyalty · Welcome Gift"
        title={<>Your first box hides <span className="text-gold">20% off</span></>}
        subtitle="We don't do boring packing slips. Every first order ships with a gold welcome card — your key to 20% off your entire next order. Our way of saying: welcome to the ritual."
        badge="First-order gift · 20% off everything"
        ctaLabel="Claim my gift"
        ctaHref="/shop"
        image="/products/bundle-ritual.webp"
        imageAlt="Zulfira Complete Ritual Bundle"
      />

      <section className="mx-auto max-w-3xl px-4 pb-14 text-center">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-gold">Your welcome code</p>
        <h2 className="font-display mt-3 text-2xl md:text-3xl">Tap to copy, use at checkout</h2>
        <div className="mt-6 flex justify-center">
          <CopyCode code="INBOX20" />
        </div>
        <p className="mt-4 text-sm text-white/55">
          Found on the gold card inside your first delivery box — but you can use it right now.
        </p>
      </section>

      <Steps
        title="How your welcome gift works"
        steps={[
          {
            title: "Place your first order",
            text: "Any product counts — the oil, the shampoo, or the full ritual bundle.",
          },
          {
            title: "Find the gold card",
            text: "Inside your box: a gold-foil welcome card with your personal 20% code.",
          },
          {
            title: "Enter INBOX20",
            text: "Type the code at checkout on your next order — 20% melts off everything in your cart.",
          },
          {
            title: "Save on your ritual",
            text: "One code, one big saving. Your second ritual costs a fifth less than your first.",
          },
        ]}
      />

      <DealProducts
        title="What 20% off looks like"
        subtitle="Your welcome-gift price on the full range — the biggest single discount we offer."
        discount={0.2}
        discountLabel="Welcome gift · 20% off"
        ctaHref="/shop"
        ctaLabel="Shop with my gift"
        note="Code INBOX20 · one use per customer · applies to all products · free delivery still included."
      />

      <CtaBand
        title="Don't let 20% sit in a box"
        text="Your welcome code is waiting. Your hair is waiting. Everybody wins."
        ctaLabel="Shop now"
        ctaHref="/shop"
      />
    </RewardShell>
  );
}
