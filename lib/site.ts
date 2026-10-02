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

export const BASE_PATH = "";
export const img = (p: string) => `${BASE_PATH}${p}`;

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number; // PKR — placeholder prices, adjust freely
  oldPrice?: number;
  size: string;
  image: string;
  benefits: string[];
  accent: "gold" | "emerald";
}

export const PRODUCTS: Product[] = [
  {
    id: "oil",
    name: "Zulfira Hair Oil",
    tagline: "Liquid gold therapy",
    description:
      "A futuristic elixir of cold-pressed argan, coconut and castor oils infused with botanical actives. Repairs damage, tames frizz and wakes up dormant follicles — for hair that moves like liquid silk.",
    price: 1899,
    oldPrice: 2499,
    size: "200 ml",
    image: img("/images/oil.webp"),
    benefits: [
      "Reduces hair fall in 4 weeks*",
      "Deep-repairs split ends & damage",
      "Boosts shine with argan + vitamin E",
      "Lightweight — no greasy residue",
    ],
    accent: "gold",
  },
  {
    id: "shampoo",
    name: "Zulfira Shampoo",
    tagline: "Zero-gravity cleanse",
    description:
      "A sulfate-smart cleansing system with keratin, aloe vera and silk proteins. Lifts away buildup without stripping, leaving the scalp balanced and strands weightlessly smooth.",
    price: 1499,
    oldPrice: 1899,
    size: "250 ml",
    image: img("/images/shampoo.webp"),
    benefits: [
      "Sulfate-smart gentle cleanse",
      "Keratin + silk protein repair",
      "Balances scalp, fights dandruff",
      "Safe for all hair types",
    ],
    accent: "emerald",
  },
];

export const BUNDLE = {
  id: "bundle",
  name: "Zulfira Ritual Bundle",
  tagline: "Oil + Shampoo",
  price: 2999,
  oldPrice: 3398,
};

export const PAYMENT_METHODS = {
  cod: {
    id: "cod",
    label: "Cash on Delivery",
    short: "CoD",
    note: "Pay in cash when your order arrives at your doorstep. Available nationwide across Pakistan.",
  },
  online: {
    id: "online",
    label: "Online Payment",
    short: "Online",
    note: "Pay in advance via bank transfer, JazzCash or EasyPaisa, then share the receipt screenshot on WhatsApp to confirm your order.",
  },
} as const;

// Placeholder merchant accounts — replace with real details before launch.
export const ONLINE_PAYMENT_DETAILS = [
  { label: "JazzCash", value: "0300-1234567", title: "Zulfira (placeholder)" },
  { label: "EasyPaisa", value: "0300-1234567", title: "Zulfira (placeholder)" },
  { label: "Bank transfer", value: "PK00 XXXX 0000 0000 0000 0000", title: "Zulfira (placeholder)" },
];

export const formatPKR = (n: number) => `Rs ${n.toLocaleString("en-PK")}`;

export const NAV_LINKS = [
  { label: "Products", href: "#products" },
  { label: "Ritual", href: "#ritual" },
  { label: "Reviews", href: "#reviews" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];
