# ZULFIRA — Futuristic Hair Care

A futuristic, animation-rich brand website for **Zulfira Hair Care**, built with
**Next.js 16 + TypeScript + Tailwind CSS 4 + Framer Motion**.

Live site: **https://syntexcodex.github.io/Zulfira/**

## Products

| Product | Size | Price (PKR) |
|---|---|---|
| Zulfira Hair Oil | 200 ml | 1,899 |
| Zulfira Shampoo | 250 ml | 1,499 |
| Zulfira Ritual Bundle | Oil + Shampoo | 2,999 |

> Prices are placeholders — edit them in `lib/site.ts`.

## Ordering

The order portal (`#order`) collects the customer's details, lets them pick
**Cash on Delivery** or **Online Payment** (JazzCash / EasyPaisa / bank transfer),
then opens WhatsApp with a pre-filled order message — the standard CoD flow for
Pakistan e-commerce.

### Before launch — 3 things to replace

1. **WhatsApp number** — `WHATSAPP_NUMBER` in `lib/site.ts` is a placeholder
   (`923001234567`). Set the real number, then regenerate the QR code:
   ```bash
   npm run qr
   ```
   (or `ZULFIRA_WHATSAPP=923001234567 npm run qr`). The QR is saved to
   `public/images/qr-whatsapp.png` and shown in the Contact section.
2. **Online payment accounts** — `ONLINE_PAYMENT_DETAILS` in `lib/site.ts`
   contains placeholder JazzCash / EasyPaisa / IBAN values.
3. **Prices** — `PRODUCTS` / `BUNDLE` in `lib/site.ts`.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export → ./out
```

## Deployment

The site is a **static export** (`output: "export"` in `next.config.ts`) served
from the `/Zulfira` base path. Every push to `main` triggers
`.github/workflows/deploy.yml`, which builds and deploys to **GitHub Pages**
via the official `deploy-pages` action. No manual steps needed after the first
setup.

## Tech

- Next.js 16 (App Router, static export), React 19, TypeScript
- Tailwind CSS 4 (`@theme` tokens in `app/globals.css`)
- Framer Motion — scroll reveals, parallax hero, animated checkout, marquees
- Lucide icons, `next/font` (Syne + Space Grotesk)
