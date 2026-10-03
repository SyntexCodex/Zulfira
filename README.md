# ZULFIRA — Natural Hair Care (v2)

A light-mode, professional e-commerce website for **Zulfira Hair Care**, inspired
by leading D2C beauty stores. Built with **Next.js 16 + TypeScript + Tailwind CSS 4
+ Framer Motion**, fully responsive (mobile → large screens).

Live site: **https://zulfira.vercel.app/**

## Brand

- **Logo**: new minimalist mark — a gold "Z" drawn as a flowing hair strand ending
  in a green leaf (`public/brand/logo.webp`). Simple, stylish, defines the brand vision.
- **Palette**: ivory `#fdfbf6` · cream · deep pine `#1e5b3e` · gold `#c9a24b`
- **Type**: Fraunces (display serif) + Inter (body)

## Products

| Product | Size | Price (PKR) |
|---|---|---|
| Zulfira Revitalizing Hair Oil | 200 ml | 1,899 |
| Zulfira Sulphate-Free Shampoo | 250 ml | 1,499 |
| Zulfira Complete Ritual Bundle | Oil + Shampoo | 2,999 |

> Prices are placeholders — edit them in `lib/site.ts` (`PRODUCTS`).

## Pages

| Route | Page |
|---|---|
| `/` | Home — hero slider, trust badges, bestsellers, benefit marquee, marketing banners, brand philosophy, why-us, reviews, FAQ, newsletter |
| `/shop` | Full product catalogue |
| `/product/[slug]` | Product detail — image gallery with **fullscreen lightbox**, qty, Add to Cart / Buy Now / WhatsApp order, tabs (Description, How to Use, Ingredients), reviews, related products |
| `/about` | Brand story, vision, values, stats |
| `/contact` | WhatsApp chat, QR code, contact details, message form → WhatsApp |
| `/faq` | Full FAQ accordion |
| `/checkout` | Contact + delivery form, Cash on Delivery / Online Payment, order summary, places order via WhatsApp deep link |

## Ordering flow

Cart (persistent via localStorage) → cart drawer → checkout (details + CoD/online
payment, free delivery over Rs 2,500) → order sent to the business WhatsApp as a
pre-filled message — the standard CoD flow for Pakistan e-commerce.

## Before launch — 3 things to replace

1. **WhatsApp number** — `WHATSAPP_NUMBER` in `lib/site.ts` is a placeholder
   (`923001234567`). Set the real number, then regenerate the QR code:
   ```bash
   npm run qr
   ```
   (or `ZULFIRA_WHATSAPP=923001234567 npm run qr`). The QR is saved to
   `public/images/qr-whatsapp.png` and shown on the Contact page.
2. **Online payment accounts** — `ONLINE_PAYMENT_DETAILS` in `lib/site.ts`
   contains placeholder JazzCash / EasyPaisa / IBAN values.
3. **Prices & claims** — confirm final prices and review all marketing copy.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export → ./out
```

## Deployment

The site is a **static export** (`output: "export"` in `next.config.ts`) hosted at
the root domain on **Vercel** — no base path. Every push to `main` redeploys.

## Tech

- Next.js 16 (App Router, static export), React 19, TypeScript
- Tailwind CSS 4 (`@theme` tokens in `app/globals.css`)
- Framer Motion — hero slider, scroll reveals, cart drawer, lightbox, marquees
- Lucide icons, `next/font` (Fraunces + Inter)
