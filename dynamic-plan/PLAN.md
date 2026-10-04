# Zulfira Dynamic Platform — Build Plan

**Goal:** Convert the Zulfira static site into a fully dynamic business platform on Vercel:
public storefront + backend API + admin panel, one deploy, real domain later.

**Stack decisions**
- Next.js 16 (dynamic — remove `output: "export"`), hosted on Vercel
- Database: **PostgreSQL via Neon** (serverless-friendly, stable, relational — right for
  money math: orders, expenses, investments). ORM: **Prisma**.
- Admin auth: **Auth.js** (credentials login, session-protected `/admin` + private APIs)
- Charts: **Recharts**. Styling stays Tailwind (matches current site).
- Visitor tracking: lightweight first-party page-view logging (no third-party dependency).
- Alerts: **Telegram Bot API** (server-side only — token never touches the browser).

---

## Data model (Postgres)

| Table | Purpose |
|---|---|
| `Product` | id, name, slug, sku, salePrice, unitCost, stockQty, lowStockLevel, image, isActive |
| `Investor` | id, name, phone, email, notes |
| `ProductInvestment` | product ↔ investor link: `amountInvested`, `profitSharePct` (**must total 100% per product** — enforced) |
| `Expense` | category (`RAW_MATERIAL`, `PACKAGING`, `DELIVERY`, `MARKETING`, `SALARY`, `UTILITIES`, `OTHER`), optional product link, amount, date, note, receipt |
| `Order` | orderNo, customer (name/phone/address/city), status (`PENDING → CONFIRMED → SHIPPED → DELIVERED`, plus `RETURNED`, `CANCELLED`), payment (`COD`/`ONLINE`), subtotal, deliveryCharge, discount, total, timestamps |
| `OrderItem` | order ↔ product, qty, unitPrice |
| `StockMovement` | every inventory change: `PURCHASE`, `SALE`, `RETURN`, `ADJUSTMENT`, `WASTE` — keeps stock honest |
| `PageView` | path, session, referrer, device, createdAt — visitor stats |
| `AdminUser` | name, email, passwordHash, role (`OWNER`, `STAFF`) |

## P&L engine (per product — the heart of the system)

Tracked **from zero**: every rupee invested and every expense is logged against a product
(or as a general expense, auto-allocated across products by revenue share — one clear rule,
shown in the UI).

Per product, the system computes:
- **Invested capital** = Σ investor amounts
- **Expenses** = Σ product expenses, broken down by category (raw, flyers/packaging,
  delivery, marketing, other)
- **Revenue** = Σ `DELIVERED` order items only (returned orders excluded from revenue,
  counted separately as return loss)
- **Pipeline** = `PENDING/CONFIRMED/SHIPPED` orders shown separately (not counted as profit yet)
- **Net profit/loss** = Revenue − Invested − Expenses − delivery costs − returns loss
- **Per-investor payout** = Net profit × their `profitSharePct` (loss shown too — full honesty)
- Margin %, ROI %, break-even units

Global dashboard aggregates the same across all products.

## Admin panel (`/admin`)

1. **Dashboard** — KPI cards (revenue, expenses, net P&L, orders, visitors, low-stock alerts),
   charts: revenue vs expenses over time, profit per product, order-status funnel, top products,
   visitor trend. Date-range + product filters everywhere.
2. **Orders** — list with full filters (status, date, product, payment), status workflow
   buttons, order detail, return/cancel handling (auto stock + P&L adjustment).
3. **Products** — CRUD, stock levels, low-stock alerts, unit cost / sale price.
4. **Investors** — per product: add any number of investors, set profit %, live validation
   that shares total 100%. Investment history per investor.
5. **Expenses** — CRUD by category, attach to product or mark general, receipt upload,
   filters by category/date/product.
6. **Reports / P&L** — per-product full statement (invested → expenses → revenue → profit →
   investor payouts), exportable. Global P&L across products.
7. **Visitors** — page views, top pages, trend chart.
8. **Settings** — business profile, order statuses, expense categories, staff accounts.

## Telegram alerts

Sent server-side from the API (bot token stays secret in Vercel env vars:
`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`):

- **New order** — instant message: order no, items, total, customer, city
- **Low stock** — when a product hits its alert level (checked on every stock movement)
- **Daily summary** — via Vercel Cron, every evening: today's revenue, orders by status,
  expenses, net P&L, visitor count
- **Returns / cancellations** — instant, with reason
- **Investor payout due** — when a product cycle closes with profit

Admin can toggle each alert type on/off in Settings.

## Public site changes (minimal, keeps the v3 Naturalis design)

- Checkout form **posts to `/api/orders`** (creates order, decrements reserved stock,
  logs movement) — WhatsApp stays as a fallback option, not the only path.
- **Track-order page** becomes live (queries real order status).
- Product/shop pages read from the database (prices/stock always current).
- Silent visitor ping for stats.

## API surface (`/api`)

- Public: `GET /api/products`, `POST /api/orders`, `GET /api/orders/track?orderNo=`,
  `POST /api/track` (visitor ping)
- Admin (auth required): full CRUD for products, orders, investors, expenses,
  `GET /api/dashboard/stats`, `GET /api/reports/pnl?product=&from=&to=`

## Build phases

1. **Foundation** — dynamic Next.js, Neon Postgres + Prisma schema, Auth.js admin login,
   deploy to Vercel (preview URL). *Milestone: admin login works on Vercel.*
2. **Core data** — products, orders, expenses, investors CRUD + public APIs; checkout
   writes real orders. *Milestone: a test order flows end-to-end on the live URL.*
3. **Dashboard** — KPIs, Recharts charts, visitor tracking, low-stock alerts.
4. **P&L engine** — per-product statements, investor payouts, filters, returns handling.
5. **Hardening** — seed demo data, role permissions, backups note, docs, handover.

## What you need to provide (domain comes later, per your call)

- Nothing for the build itself — Neon DB and Vercel deploy are on me.
- **For Telegram alerts:** a bot token + your chat ID. Two-minute setup: message
  @BotFather on Telegram → `/newbot` → copy the token; then message @userinfobot to
  get your chat ID. Send me both (I'll store them securely, never in chat/code).
- Later: the real domain + (optional) real WhatsApp/payment details already pending.

## Deliberately out of v1

Online payment gateway wiring, SMS notifications, multi-branch, barcode scanning —
noted as phase 2, not built now.
