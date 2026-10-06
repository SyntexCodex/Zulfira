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
| `/product/[slug]` | Product detail — image gallery with **fullscreen lightbox**, qty, Add to Cart / Buy Now, tabs (Description, How to Use, Ingredients), reviews, related products |
| `/about` | Brand story, vision, values, stats |
| `/contact` | Contact details (phone, email, address, hours), message form → email |
| `/faq` | Full FAQ accordion |
| `/checkout` | Contact + delivery form, Cash on Delivery / Online Payment, order summary, places order via `/api/orders` |

## Ordering flow

Cart (persistent via localStorage) → cart drawer → checkout (details + CoD/online
payment, free delivery over Rs 2,500) → order saved to the database and shown in
the admin panel.

## Before launch — 3 things to replace

2. **Online payment accounts** — `ONLINE_PAYMENT_DETAILS` in `lib/site.ts`
   contains placeholder JazzCash / EasyPaisa / IBAN values.
3. **Prices & claims** — confirm final prices and review all marketing copy.

## Development

```bash
npm install
npx prisma db push   # create tables (needs DATABASE_URL)
npm run db:seed      # demo products, investor, expenses, admin login
npm run dev          # http://localhost:3000
npm run build
```

## Deploy on Vercel

The app is a **dynamic Next.js app** (storefront + API + admin panel, one project).

1. Push this repo to GitHub (`main` branch).
2. In Vercel: **Add New → Project → Import** the repo. Framework preset: Next.js.
   No build-command changes needed (`postinstall` runs `prisma generate`).
3. Add **Environment Variables** (Project → Settings → Environment Variables):
   - `DATABASE_URL` — Neon Postgres connection string (**required** for orders,
     admin, and all DB features; the site still builds and serves the storefront
     without it)
   - `AUTH_SECRET` — long random string for admin sessions
     (`openssl rand -base64 32`). **Required** for `/admin` login.
   - `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` — optional; alerts silently skip
     when absent.
   - `CRON_SECRET` — optional; protects the daily-summary cron endpoint.
4. Deploy. Then run once against the live DB:
   `DATABASE_URL="..." npx prisma db push && DATABASE_URL="..." npm run db:seed`
5. Log in at `/admin/login` (seed: `admin@zulfira.pk` / `zulfira123`) and **change
   the password immediately** in Settings → Staff.

The daily Telegram business summary runs via Vercel Cron (`vercel.json`,
19:00 PKT). Custom domain: Vercel → Project → Settings → Domains (when ready).

## Deployment notes (v3 platform)

- Storefront (Naturalis design), `/api/*`, and `/admin/*` ship in one deploy.
- Public pages read products from the DB with automatic fallback to the static
  catalogue in `lib/site.ts`, so the site renders before the DB is provisioned.
- Checkout posts orders to `/api/orders`.
- See `dynamic-plan/PLAN.md` for the full architecture and P&L rules.

## Tech

- Next.js 16 (App Router, dynamic), React 19, TypeScript
- Tailwind CSS 4 (`@theme` tokens in `app/globals.css`)
- Prisma 6 + Neon Postgres, Auth.js-style JWT sessions (jose), bcryptjs
- Recharts (admin dashboard), Telegram Bot API (alerts)
- Framer Motion — hero slider, scroll reveals, cart drawer, lightbox, marquees
- Lucide icons, `next/font` (Fraunces + Inter)
