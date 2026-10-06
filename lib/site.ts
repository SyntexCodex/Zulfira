/**
 * ZULFIRA — central site configuration.
 * ------------------------------------------------------------------
 * Business WhatsApp: +92 302 8487658 (country code + number, no "+").
 * After changing WHATSAPP_NUMBER, run `npm run qr` to regenerate the
 * QR code, then rebuild.
 */

export const SITE_URL = "https://zulfira.shop";

export const WHATSAPP_NUMBER = "923028487658";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
export function whatsappOrderLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const CONTACT = {
  email: "hello@zulfira.pk",
  phoneDisplay: "0302-8487658",
  phoneIntl: "+92 302 8487658",
  hours: "Mon–Sat · 9am–9pm PKT",
  address: "Lahore, Pakistan",
};

/**
 * Official social profiles. Update these URLs if the handles differ.
 */
export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/profile.php?id=61593966274766",
  instagram: "https://www.instagram.com/zulfira_0/",
  tiktok: "https://www.tiktok.com/@zulfira.pk",
};

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  size: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviewCount: number;
  /** Prisma Product id, set only for products served from the live DB. */
  dbId?: string;
  badge?: string;
  categories: string[];
  short: string;
  description: string[];
  benefits: string[];
  howToUse: string[];
  ingredients: { name: string; note: string }[];
  gallery: string[];
}

export const PRODUCTS: Product[] = [
  {
    slug: "revitalizing-hair-oil",
    name: "Zulfira Revitalizing Hair Oil",
    tagline: "Deep nourishment, weightless shine",
    size: "200 ml",
    price: 999,
    compareAt: 1500,
    rating: 4.9,
    reviewCount: 212,
    badge: "Bestseller",
    categories: ["hair-oils", "bestsellers"],
    short:
      "A luxurious pre-wash elixir of cold-pressed argan, coconut and castor oils that repairs damage, calms frizz and wakes up healthy growth.",
    description: [
      "Zulfira Revitalizing Hair Oil is our signature pre-wash treatment, blended from cold-pressed argan, coconut and castor oils and infused with botanical actives. It absorbs quickly, penetrates deep to the follicle, and rinses clean — no heavy, greasy residue.",
      "Use it 2–3 times a week as part of the Zulfira ritual and expect visibly stronger, shinier, more manageable hair within weeks.",
    ],
    benefits: [
      "Visibly reduces hair fall and breakage",
      "Repairs split ends and heat damage",
      "Calms frizz for silky, manageable hair",
      "Lightweight — absorbs fast, rinses clean",
      "Pleasant, natural botanical fragrance",
    ],
    howToUse: [
      "Warm 5–8 drops between your palms.",
      "Massage into scalp and hair for 5–7 minutes, focusing on the roots.",
      "Leave for 30–60 minutes (or overnight for a deep treatment).",
      "Wash out with Zulfira Sulphate-Free Shampoo.",
    ],
    ingredients: [
      { name: "Argan Oil", note: "Vitamin-E rich repair" },
      { name: "Coconut Oil", note: "Deep moisture penetration" },
      { name: "Castor Oil", note: "Supports thicker-looking growth" },
      { name: "Aloe Vera Extract", note: "Soothes the scalp" },
    ],
    gallery: ["/products/oil-front.webp", "/products/oil-detail.webp", "/banners/banner-oil.webp"],
  },
  {
    slug: "sulphate-free-shampoo",
    name: "Zulfira Sulphate-Free Shampoo",
    tagline: "Gentle cleanse, healthy scalp",
    size: "400 ml",
    price: 999,
    compareAt: 1500,
    rating: 4.8,
    reviewCount: 167,
    badge: "New",
    categories: ["shampoos", "bestsellers", "new-arrivals"],
    short:
      "A sulphate-free, paraben-free cleanser with keratin, aloe vera and silk proteins — lifts buildup without stripping, for a balanced scalp and soft, shiny hair.",
    description: [
      "Zulfira Sulphate-Free Shampoo cleanses with a gentle, sulphate-free foam that respects your hair's natural oils. Keratin and silk proteins smooth every strand while aloe vera keeps the scalp calm and hydrated.",
      "Safe for daily use and for all hair types, including color-treated hair.",
    ],
    benefits: [
      "Sulphate-free & paraben-free formula",
      "Keratin + silk protein for strength and shine",
      "Soothes scalp, helps control dandruff",
      "Won't strip color-treated hair",
      "Fresh, clean fragrance",
    ],
    howToUse: [
      "Wet hair and scalp thoroughly with water.",
      "Apply a coin-sized amount and massage for about a minute.",
      "Let sit 1–2 minutes, add water for extra lather.",
      "Rinse thoroughly. Repeat if needed.",
    ],
    ingredients: [
      { name: "Keratin", note: "Rebuilds strength" },
      { name: "Silk Protein", note: "Glass-like shine" },
      { name: "Aloe Vera Gel", note: "Scalp-soothing hydration" },
      { name: "Moringa Extract", note: "Scalp treatment" },
    ],
    gallery: ["/products/shampoo-front.webp", "/products/shampoo-detail.webp", "/banners/banner-shampoo.webp"],
  },
  {
    slug: "complete-ritual-bundle",
    name: "Zulfira Complete Ritual Bundle",
    tagline: "Oil + Shampoo — the full routine",
    size: "200 ml + 400 ml",
    price: 1700,
    compareAt: 3000,
    rating: 5.0,
    reviewCount: 98,
    badge: "Save Rs 1,300",
    categories: ["bundles", "bestsellers", "gift-sets", "new-arrivals"],
    short:
      "The complete Zulfira ritual in one box: Revitalizing Hair Oil for deep nourishment plus Sulphate-Free Shampoo for a gentle cleanse. Everything your hair needs, nothing it doesn't.",
    description: [
      "The Complete Ritual Bundle pairs our two signature formulas the way they were designed to be used: nourish first with the Revitalizing Hair Oil, then cleanse with the Sulphate-Free Shampoo.",
      "Buying the bundle saves Rs 399 versus purchasing separately — and it makes a beautiful gift.",
    ],
    benefits: [
      "Both signature formulas in one box",
      "Save Rs 399 vs. buying separately",
      "The complete 2-step weekly ritual",
      "Beautiful gift-ready packaging",
    ],
    howToUse: [
      "Step 1 — Nourish: massage the oil into scalp and hair, leave 30–60 minutes.",
      "Step 2 — Cleanse: wash out with the Sulphate-Free Shampoo.",
      "Repeat 2–3 times a week for best results.",
    ],
    ingredients: [
      { name: "Argan Oil", note: "Vitamin-E rich repair" },
      { name: "Keratin", note: "Rebuilds strength" },
      { name: "Aloe Vera", note: "Soothes scalp" },
      { name: "Silk Protein", note: "Glass-like shine" },
    ],
    gallery: ["/products/bundle-ritual.webp", "/products/oil-front.webp", "/products/shampoo-front.webp"],
  },
];

export const productBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

export const formatPKR = (n: number) => `Rs ${n.toLocaleString("en-PK")}`;

export const discountPct = (p: Product) =>
  p.compareAt ? Math.round(((p.compareAt - p.price) / p.compareAt) * 100) : 0;

export const PAYMENT_METHODS = {
  cod: {
    id: "cod",
    label: "Cash on Delivery",
    note: "Pay in cash when your order arrives. Available nationwide across Pakistan.",
  },
  online: {
    id: "online",
    label: "Online Payment",
    note: "Pay via JazzCash, EasyPaisa or bank transfer, then share the receipt screenshot on WhatsApp.",
  },
} as const;

// Placeholder merchant accounts — replace with real details before launch.
export const ONLINE_PAYMENT_DETAILS = [
  { label: "JazzCash", value: "0300-1234567", title: "Zulfira (placeholder)" },
  { label: "EasyPaisa", value: "0300-1234567", title: "Zulfira (placeholder)" },
  { label: "Bank transfer", value: "PK00 XXXX 0000 0000 0000 0000", title: "Zulfira (placeholder)" },
];

export const REVIEWS = [
  { name: "Sana K.", city: "Lahore", product: "Hair Oil", text: "I struggled with hair fall for months, but this oil really helped. My scalp feels nourished, shedding reduced noticeably within weeks." },
  { name: "Ahsan R.", city: "Karachi", product: "Shampoo", text: "Finally, a shampoo that doesn't strip my hair — gentle, nourishing, and leaves my hair soft, shiny and fall-free." },
  { name: "Mahnoor S.", city: "Islamabad", product: "Ritual Bundle", text: "Ordered on WhatsApp, paid cash on delivery. Arrived in 2 days. The packaging feels like a gift to myself." },
  { name: "Bilal A.", city: "Rawalpindi", product: "Hair Oil", text: "Such a lightweight and effective oil! Doesn't feel greasy at all, yet keeps my scalp hydrated and my hair much healthier." },
  { name: "Iqra M.", city: "Multan", product: "Ritual Bundle", text: "Dandruff gone, scalp calm, hair soft. The bundle is worth every rupee — CoD made it so easy to try." },
  { name: "Danish R.", city: "Faisalabad", product: "Shampoo", text: "My curls have never looked this defined. Two washes and the frizz surrendered completely." },
];

export const FAQS = [
  {
    q: "How do I pay? Is Cash on Delivery available?",
    a: "Yes — Cash on Delivery is available nationwide across Pakistan. Pay in cash when the rider hands you your parcel. Prefer paying upfront? Choose Online Payment at checkout and pay via JazzCash, EasyPaisa or bank transfer, then share the receipt screenshot on WhatsApp.",
  },
  {
    q: "How long does delivery take?",
    a: "Orders are dispatched within 24 hours. Delivery typically takes 2–4 working days anywhere in Pakistan. You'll get a confirmation message on WhatsApp as soon as your order ships.",
  },
  {
    q: "Are Zulfira products sulphate and paraben free?",
    a: "Yes. Our shampoo is 100% sulphate-free and paraben-free, and our oil contains no mineral oil or silicones. Both formulas are built on natural botanical actives.",
  },
  {
    q: "How do I use the oil and shampoo together?",
    a: "Massage 5–8 drops of oil into your scalp 30–60 minutes before washing (or overnight for a deep treatment), then cleanse with Zulfira Sulphate-Free Shampoo. Use 2–3 times a week.",
  },
  {
    q: "Is it suitable for my hair type?",
    a: "Yes — the formulas were designed for all hair types: straight, wavy, curly, coily, and color-treated hair. The oil is lightweight so fine hair won't feel weighed down.",
  },
  {
    q: "What is your return policy?",
    a: "If you receive a damaged or incorrect product, message us on WhatsApp with a photo within 7 days of delivery and we'll replace it free of charge.",
  },
];

/* ------------------------------------------------------------------ */
/* v3 — storefront structure                                            */
/* ------------------------------------------------------------------ */

export interface Category {
  slug: string;
  name: string;
  tagline: string;
  image: string;
}

export const CATEGORIES: Category[] = [
  { slug: "hair-oils", name: "Hair Oils", tagline: "Deep nourishment", image: "/products/oil-front.webp" },
  { slug: "shampoos", name: "Shampoos", tagline: "Gentle cleanse", image: "/products/shampoo-front.webp" },
  { slug: "bundles", name: "Bundles", tagline: "Complete rituals", image: "/products/bundle-ritual.webp" },
  { slug: "bestsellers", name: "Bestsellers", tagline: "Customer favourites", image: "/banners/banner-oil.webp" },
  { slug: "new-arrivals", name: "New Arrivals", tagline: "Fresh in store", image: "/banners/banner-shampoo.webp" },
  { slug: "gift-sets", name: "Gift Sets", tagline: "Ready to gift", image: "/categories/cat-gifts.webp" },
];

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const productsInCategory = (slug: string) => PRODUCTS.filter((p) => p.categories.includes(slug));

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Hair Oil", href: "/product/revitalizing-hair-oil" },
  { label: "Shampoo", href: "/product/sulphate-free-shampoo" },
  { label: "Bundles", href: "/collections/bundles" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const DRAWER_GROUPS = [
  {
    title: "Shop by Concern",
    links: [
      { label: "Hair Fall", href: "/collections/bestsellers" },
      { label: "Frizz & Damage", href: "/collections/hair-oils" },
      { label: "Dandruff & Scalp Care", href: "/collections/shampoos" },
    ],
  },
  {
    title: "Shop by Products",
    links: [
      { label: "Hair Oil", href: "/product/revitalizing-hair-oil" },
      { label: "Shampoo", href: "/product/sulphate-free-shampoo" },
      { label: "Ritual Bundle", href: "/product/complete-ritual-bundle" },
    ],
  },
  {
    title: "Shop by Categories",
    links: CATEGORIES.map((c) => ({ label: c.name, href: `/collections/${c.slug}` })),
  },
];

export const ANNOUNCEMENT_MESSAGES = [
  "Free home delivery on all orders",
  "Cash on Delivery available nationwide",
  "Flat 15% off bundles — this week only",
];

export const FLASH_SALE = {
  title: "Flash Sale",
  subtitle: "Up to 33% off — hurry, ends in:",
};

export const INSTAGRAM_POSTS = [
  { image: "/social/insta-oil.webp", label: "The oil ritual" },
  { image: "/social/insta-hair.webp", label: "Shine days" },
  { image: "/banners/lifestyle-pink.webp", label: "Behind the scenes" },
  { image: "/products/oil-detail.webp", label: "Golden drops" },
  { image: "/products/shampoo-detail.webp", label: "Fresh lather" },
];

export const POLICIES: Record<string, { title: string; updated: string; body: string[] }> = {
  "privacy-policy": {
    title: "Privacy Policy",
    updated: "Last updated October 2026",
    body: [
      "Zulfira Hair Care collects only the information needed to fulfil your order: your name, phone number, and delivery address. We never sell or share your personal data with third parties for marketing.",
      "Order details shared over WhatsApp are used solely to process, ship, and support your purchase. Payment receipts you share are used only to verify online payments.",
      "You may ask us at any time what data we hold about you, or ask us to delete it, by messaging us on WhatsApp or emailing hello@zulfira.pk.",
    ],
  },
  "refund-policy": {
    title: "Refund Policy",
    updated: "Last updated October 2026",
    body: [
      "If your order arrives damaged or incorrect, message us on WhatsApp with a photo within 7 days of delivery and we will replace it free of charge — no return shipping needed.",
      "For Cash on Delivery orders, replacements are shipped after we confirm the issue. For online payments, refunds are issued to the original payment method within 7 working days once the returned item reaches us.",
      "Change-of-mind returns are accepted within 7 days for unopened products in original packaging; delivery charges are non-refundable.",
    ],
  },
  "terms-and-conditions": {
    title: "Terms & Conditions",
    updated: "Last updated October 2026",
    body: [
      "By placing an order with Zulfira Hair Care you agree to provide accurate contact and delivery details. Orders are confirmed over WhatsApp before dispatch.",
      "Product results vary by hair type and routine; our descriptions reflect typical customer experience, not guaranteed outcomes. Always patch-test new products.",
      "Prices are in Pakistani Rupees and include all taxes. We may update prices and offers without notice; confirmed orders keep the price agreed at checkout.",
    ],
  },
  "shipping-policy": {
    title: "Shipping Policy",
    updated: "Last updated October 2026",
    body: [
      "Orders are dispatched within 24 hours, Monday to Saturday. Delivery takes 2–4 working days anywhere in Pakistan.",
      "Delivery is FREE on all orders across Pakistan. Cash on Delivery is available nationwide.",
      "You will receive a WhatsApp confirmation with tracking details as soon as your parcel ships. If your parcel is delayed beyond 5 working days, contact us and we will trace it for you.",
    ],
  },
};

export const policyBySlug = (slug: string) => POLICIES[slug];
