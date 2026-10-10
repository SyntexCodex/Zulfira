import type { Metadata } from "next";
import { RewardShell, RewardHero, Steps, DealProducts, CtaBand } from "@/components/rewards/reward-ui";
import WelcomeCodeForm from "./WelcomeCodeForm";

export const metadata: Metadata = {
  title: "Welcome Gift — Personal 20% Off Code | Zulfira",
  description:
    "Get your personal one-time 20% welcome code by email. Unique to you, 20% off your entire ritual at checkout.",
};

export default function WelcomeGiftPage() {
  return (
    <RewardShell>
      <RewardHero
        kicker="Zulfira Loyalty · Welcome Gift"
        title={<>Your first ritual, <span className="text-gold">20% off</span></>}
        subtitle="No generic codes, no fine print. Enter your email and we'll send you a personal one-time 20% code — unique to you, made for your first ritual."
        badge="First-order gift · 20% off everything"
        ctaLabel="Claim my gift"
        ctaHref="/shop"
        image="/products/bundle-ritual.webp"
        imageAlt="Zulfira Complete Ritual Bundle"
      />

      <section className="mx-auto max-w-3xl px-4 pb-14">
        <WelcomeCodeForm />
      </section>

      <Steps
        title="How your welcome gift works"
        steps={[
          {
            title: "Enter your email",
            text: "One tap above — we generate a code that's yours alone.",
          },
          {
            title: "Check your inbox",
            text: "Your personal 20% code arrives by email within a minute.",
          },
          {
            title: "Use it at checkout",
            text: "Type the code at checkout — 20% melts off everything in your cart.",
          },
          {
            title: "Save on your ritual",
            text: "One code, one big saving. Your first ritual costs a fifth less.",
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
        note="Personal one-time code · 20% off · applies to all products · free delivery still included."
      />

      <CtaBand
        title="Don't let 20% sit unclaimed"
        text="Your personal code is one email away. Your hair is waiting. Everybody wins."
        ctaLabel="Shop now"
        ctaHref="/shop"
      />
    </RewardShell>
  );
}
