# SaaS ERP / Investment & Inventory OS — Master Build Prompt

> Copy everything below the line into your AI builder when you're ready to build the
> commercial product. It is written to be self-contained: no Zulfira branding, no prior
> context needed.

---

Build a multi-tenant SaaS web + mobile application: an **ERP / Investment & Inventory OS
for small product businesses** (cosmetics, food, clothing, resellers — any business that
buys/makes products and sells them). Sold as a **monthly subscription**. The killer
feature: a **one-click setup wizard** — a new user goes from signup to a live, configured
business dashboard in under 5 minutes with zero accounting knowledge.

## Target users

Non-technical small business owners in emerging markets. Mobile-first. They understand
"how much did I invest, what did I spend, what did I earn, who gets what" — the product
must speak that language, not accounting jargon. Support Urdu + English from day one
(future: Arabic).

## Core modules (v1)

1. **One-click setup wizard** — after signup, a guided flow: business name + currency +
   logo → add products (name, cost, price, opening stock) → add investors per product
   with profit-share % (must total 100%, validated live) → pick expense categories →
   done. Dashboard is live immediately with sample insights. "Set everything on single
   click" — sensible defaults everywhere, every step skippable with smart defaults.
2. **Dashboard** — KPI cards (revenue, expenses, net profit/loss, orders, visitors),
   charts (revenue vs expenses, profit per product, sales funnel), low-stock and
   low-cash alerts. Date-range and product filters on everything.
3. **Inventory** — products, variants/SKUs, stock levels, low-stock alerts, full stock
   movement ledger (purchase, sale, return, adjustment, waste). Barcode-ready data model
   (scanning is phase 2).
4. **Investors & profit split** — any number of investors per product; each has invested
   amount + profit-share %. Per-investor statements: invested, share of profit/loss,
   payouts, ROI. Handles investors joining/leaving mid-cycle (time-weighted splits are
   phase 2 — v1 uses simple per-cycle snapshots).
5. **Expense management** — categorized expenses (raw materials, packaging, delivery,
   marketing, salaries, utilities, other — user-customizable), attachable to a product
   or marked general (auto-allocated by revenue share, rule shown in UI), receipt photo
   upload.
6. **Orders** — manual + API-created orders, full status pipeline
   (pending → confirmed → shipped → delivered, plus returned/cancelled), COD and online
   payment tracking, returns automatically reverse stock and P&L.
7. **P&L engine** — per-product statement from zero: invested capital → expenses by
   category → delivered revenue → returns loss → net profit/loss → per-investor payout,
   margin % and ROI. Global P&L across products. Export to PDF/Excel.
8. **Team & roles** — Owner, Manager, Staff, Viewer. Row-level common sense: staff see
   operations, only owner/manager see money and investor splits.
9. **Billing (the SaaS itself)** — monthly subscriptions via Stripe (cards + local
   methods where Stripe is weak — design a pluggable provider interface). Tiers:
   Starter (1 business, 50 products), Pro (5 businesses, unlimited products, API
   access), Scale (multi-branch, priority support). 14-day trial, no card required.
   Usage-based guardrails with friendly upgrade prompts, never hard data loss.

## Mobile app

**Expo (React Native)** sharing the same backend API as the web app. v1 mobile =
owner's pocket dashboard + operational essentials: today's KPIs with charts, low-stock
alerts as push notifications, add expense with receipt photo, update order status,
investor snapshot view. Full admin configuration stays on web; mobile is
view + quick actions. Offline-tolerant: queue actions, sync on reconnect.

## Multi-tenancy & data isolation

Single codebase, single database, `tenantId` on every business row, enforced at the
ORM/query layer (not just in UI logic). Tenant onboarding provisions default categories,
roles, and settings. Per-tenant data export and full tenant deletion (GDPR-style) from
day one.

## Tech stack (recommended, justify deviations)

- Web: Next.js (App Router) + TypeScript + Tailwind
- Mobile: Expo (React Native) + TypeScript
- API: shared REST API (same codebase as web), authenticated with short-lived tokens
- Database: PostgreSQL (Neon or Supabase), Prisma ORM, tenant-scoped queries
- Auth: Auth.js (web) / secure token storage (mobile)
- Files: S3-compatible object storage (receipts, logos)
- Billing: Stripe (+ provider interface for regional gateways)
- Push: Expo Push Notifications
- Hosting: Vercel (web + API), updates over-the-air for mobile

## Non-functional requirements

- Every money field is `DECIMAL`, never float. All money math in integer minor units
  or decimal — zero rounding drift in investor payouts.
- Audit log: every create/update/delete on money or stock records who did it and when.
- Backups: daily automated DB backups, tested restore.
- Performance: dashboard loads < 2s on 4G with 10k orders.
- Security: rate-limited auth, encrypted secrets, no tenant data leakage (add automated
  tests that assert tenant isolation).

## Definition of done (acceptance criteria)

1. New user completes the setup wizard in < 5 minutes and sees a live dashboard.
2. Demo business seeded: 3 products, 2 investors with 60/40 split, 50 orders across
   statuses, 30 expenses — P&L per product and per-investor payouts are mathematically
   verifiable by hand.
3. A returned order correctly reverses stock and reduces delivered revenue.
4. Investor shares that don't total 100% are blocked with a clear message.
5. Subscriber can upgrade/downgrade tier; exceeding Starter limits triggers an upgrade
   prompt, never data loss.
6. Mobile app shows KPIs, alerts, expense capture, and order status updates against the
   same API as web.
7. Tenant isolation test suite passes: no query can return another tenant's rows.

## Explicitly out of v1

Payroll, tax filing, manufacturing/MRP, multi-currency accounting, POS hardware,
AI forecasting (roadmap teasers only). Build the boring core flawlessly first.
