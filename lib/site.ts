/**
 * ZULFIRA — central site configuration.
 * ------------------------------------------------------------------
 * IMPORTANT: Replace WHATSAPP_NUMBER with the real business WhatsApp
 * number (country code + number, no "+", no spaces, e.g. 923001234567),
 * then run `npm run qr` to regenerate the QR code and rebuild.
 */

export const WHATSAPP_NUMBER = "923001234567"; // <-- TODO: real number
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
export function whatsappOrderLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const CONTACT = {
  email: "hello@zulfira.pk",
  phoneDisplay: "0300-1234567",
  hours: "Mon–Sat · 9am–9pm PKT",
  address: "Lahore, Pakistan",
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
  badge?: string;
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
    price: 1899,
    compareAt: 2499,
    rating: 4.9,
    reviewCount: 212,
    badge: "Bestseller",
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
    size: "250 ml",
    price: 1499,
    compareAt: 1899,
    rating: 4.8,
    reviewCount: 167,
    badge: "New",
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
    size: "200 ml + 250 ml",
    price: 2999,
    compareAt: 3398,
    rating: 5.0,
    reviewCount: 98,
    badge: "Save Rs 399",
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

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Reviews", href: "/#reviews" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const TRUST_BADGES = [
  "Sulfate Free",
  "Paraben Free",
  "Natural Ingredients",
  "Cruelty Free",
  "Dermatologist Tested",
  "Cash on Delivery",
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
