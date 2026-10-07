/**
 * ZULFIRA — loyalty program promotions.
 * ------------------------------------------------------------------
 * When a program is enabled in the admin panel (/admin/loyalty), its
 * promo entry here is shown site-wide in the ProgramBanner (all pages).
 * To change what customers see, edit the copy below — no DB change needed.
 */

export interface ProgramPromo {
  key: string;
  name: string;
  headline: string;
  subtext: string;
  cta: string;
  href: string;
}

export const PROGRAM_PROMOS: Record<string, ProgramPromo> = {
  reorder_reminders: {
    key: "reorder_reminders",
    name: "Reorder Rewards",
    headline: "Running low? Reorder & save 10%",
    subtext: "Your personal reorder discount is waiting.",
    cta: "Reorder Now",
    href: "/rewards/reorder",
  },
  subscribe_save: {
    key: "subscribe_save",
    name: "Subscribe & Save",
    headline: "Subscribe & Save 10%",
    subtext: "Automatic delivery every 45 days — never run out.",
    cta: "Subscribe Now",
    href: "/rewards/subscribe",
  },
  review_rewards: {
    key: "review_rewards",
    name: "Review Rewards",
    headline: "Get rewarded for your reviews",
    subtext: "Earn Rs 75 for a photo review, Rs 150 for a video review.",
    cta: "Shop Now",
    href: "/rewards/reviews",
  },
  inbox_upsell: {
    key: "inbox_upsell",
    name: "Welcome Gift",
    headline: "20% off your next order",
    subtext: "First-time buyer? Your in-box card unlocks 20% off.",
    cta: "Shop Now",
    href: "/rewards/welcome",
  },
  challenge_30: {
    key: "challenge_30",
    name: "30-Day Hair Challenge",
    headline: "Join the 30-Day Hair Challenge",
    subtext: "Daily check-ins. Real transformations. Best results win.",
    cta: "Join Now",
    href: "/challenge",
  },
  gift_trial: {
    key: "gift_trial",
    name: "Gift a Trial",
    headline: "Gift a free trial bottle",
    subtext: "Send a friend a free 100ml bottle — earn Rs 200 credit.",
    cta: "Gift Now",
    href: "/gift-trial",
  },
  insiders: {
    key: "insiders",
    name: "Zulfira Insiders",
    headline: "Zulfira Insiders is live",
    subtext: "Exclusive perks, early access and members-only prices.",
    cta: "Join the Circle",
    href: "/rewards/insiders",
  },
  equity_1pct: {
    key: "equity_1pct",
    name: "1% Equity Program",
    headline: "Own 1% of Zulfira",
    subtext: "Profit-share program with monthly payouts.",
    cta: "Learn More",
    href: "/equity",
  },
};

/** All program keys, in banner rotation order. */
export const PROGRAM_KEYS = Object.keys(PROGRAM_PROMOS);

/**
 * Website promo text fields editable from /admin/loyalty.
 * Stored in LoyaltyProgram.config; empty/missing falls back to the
 * hardcoded defaults above.
 */
export const PROMO_CONFIG_KEYS = {
  headline: "promo_headline",
  subtext: "promo_subtext",
  cta: "promo_cta",
  href: "promo_href",
} as const;

/** Overlay admin-edited promo copy (from DB config) over the defaults. */
export function promoWithOverrides(
  key: string,
  config: Record<string, unknown> | null | undefined
): ProgramPromo | null {
  const base = PROGRAM_PROMOS[key];
  if (!base) return null;
  const c = config ?? {};
  const str = (k: string, fallback: string) => {
    const v = c[k];
    return typeof v === "string" && v.trim() ? v.trim() : fallback;
  };
  return {
    ...base,
    headline: str(PROMO_CONFIG_KEYS.headline, base.headline),
    subtext: str(PROMO_CONFIG_KEYS.subtext, base.subtext),
    cta: str(PROMO_CONFIG_KEYS.cta, base.cta),
    href: str(PROMO_CONFIG_KEYS.href, base.href),
  };
}
