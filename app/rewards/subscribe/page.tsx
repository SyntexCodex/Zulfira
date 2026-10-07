import type { Metadata } from "next";
import { RewardShell, RewardHero, Steps, DealProducts, CtaBand } from "@/components/rewards/reward-ui";

export const metadata: Metadata = {
  title: "Reorder Rewards — Save 10% Every Time | Zulfira",
  description:
    "Loyal customers never pay full price twice. Get a personal 10% reorder discount with every Zulfira delivery and save on every bottle, forever.",
};

export default function ReorderRewardsPage() {
  return (
    <RewardShell>
      <RewardHero
        kicker="Zulfira Loyalty · Reorder Rewards"
        title={<>Never pay <span className="text-gold">full price</span> twice</>}
        subtitle="Your hair ritual is a habit — your discount should be too. Every Zulfira delivery comes with a personal reorder code worth 10% off your next order. No points, no cards, no fine print."
        badge="10% OFF · Every reorder · Forever"
        ctaLabel="Shop now"
        ctaHref="/shop"
        image="/products/oil-front.webp"
        imageAlt="Zulfira Revitalizing Hair Oil"
      />

      <Steps
        title="How your reorder reward works"
        steps={[
          {
            title: "Finish your bottle",
            text: "Use your oil and shampoo like normal — great hair takes about 6–8 weeks a bottle.",
          },
          {
            title: "Get your code",
            text: "A personal 10% code arrives with every delivery, plus a friendly reminder when you're likely running low.",
          },
          {
            title: "Reorder & save",
            text: "Enter your code at checkout and watch 10% melt off every product in your cart.",
          },
          {
            title: "Repeat forever",
            text: "Every reorder earns the next code. Loyal rituals get rewarded on autopilot.",
          },
        ]}
      />

      <DealProducts
        title="What 10% off looks like"
        subtitle="Your reorder price on every product — automatically, every time you come back."
        discount={0.1}
        discountLabel="Reorder reward · 10% off"
        ctaHref="/shop"
        ctaLabel="Start my ritual"
        note="Reorder codes are personal, single-use, and stack with free delivery on all orders."
      />

      <CtaBand
        title="Your next bottle costs less"
        text="Order today and your 10% reorder code ships inside the box. Your future self says thank you."
        ctaLabel="Shop now"
        ctaHref="/shop"
      />
    </RewardShell>
  );
}
