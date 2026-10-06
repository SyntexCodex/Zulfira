/**
 * ZULFIRA — central email sender (Resend) + event helpers.
 * ------------------------------------------------------------------
 * - All helpers are fire-and-forget safe: they NEVER throw. Callers can
 *   invoke without awaiting, or `notifyX(...).catch(() => {})`.
 * - Every send attempt is logged to EmailLog (sent | skipped | failed).
 * - Without RESEND_API_KEY everything logs as `skipped` — nothing real
 *   is sent until the user adds RESEND_API_KEY + a verified sending
 *   domain (e.g. zulfira.shop DNS) in Vercel env vars.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { CONTACT } from "@/lib/site";

export const SITE_URL = "https://zulfira.shop";
const RESEND_ENDPOINT = "https://api.resend.com/emails";

/* ------------------------------------------------------------------ */
/* Template rendering                                                  */
/* ------------------------------------------------------------------ */

export function renderTemplate(
  name: string,
  vars: Record<string, string>
): string {
  const file = path.join(process.cwd(), "email-templates", name);
  let html = "";
  try {
    html = fs.readFileSync(file, "utf-8");
  } catch {
    return "";
  }
  // Mustache-style loop: {{#items}}...{{/items}} → pre-rendered items_html.
  html = html.replace(/{{#items}}[\s\S]*?{{\/items}}/g, vars["items_html"] ?? "");
  // Plain {{key}} placeholders; unknown keys become "".
  html = html.replace(/{{([a-zA-Z0-9_]+)}}/g, (_m, key: string) => vars[key] ?? "");
  return html;
}

/* ------------------------------------------------------------------ */
/* Core sender                                                         */
/* ------------------------------------------------------------------ */

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  template?: string;
}): Promise<{ sent: boolean; skipped?: boolean }> {
  const { to, subject, html, template } = opts;
  const log = async (status: "sent" | "skipped" | "failed", error?: string) => {
    try {
      const db = getDb();
      if (!db) return;
      await db.emailLog.create({
        data: { to, subject, template: template ?? null, status, error: error ?? null },
      });
    } catch {
      /* logging must never break a send */
    }
  };

  if (!to || !to.includes("@")) {
    await log("skipped", "no recipient address");
    return { sent: false, skipped: true };
  }
  if (!process.env.RESEND_API_KEY) {
    await log("skipped", "RESEND_API_KEY not configured");
    return { sent: false, skipped: true };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Zulfira <noreply@zulfira.shop>",
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      await log("failed", `resend ${res.status}: ${body.slice(0, 500)}`);
      return { sent: false };
    }
    await log("sent");
    return { sent: true };
  } catch (e) {
    await log("failed", String(e).slice(0, 500));
    return { sent: false };
  }
}

/* ------------------------------------------------------------------ */
/* Unsubscribe                                                         */
/* ------------------------------------------------------------------ */

export async function isUnsubscribed(db: any, email: string): Promise<boolean> {
  try {
    if (!db || !email) return false;
    const row = await db.emailPreference.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { unsubscribed: true },
    });
    return row?.unsubscribed === true;
  } catch {
    return false;
  }
}

/** HMAC-SHA256 of the lowercased email, keyed with AUTH_SECRET. */
export function unsubscribeToken(email: string): string {
  const secret = process.env.AUTH_SECRET ?? "zulfira";
  return crypto
    .createHmac("sha256", secret)
    .update(email.trim().toLowerCase())
    .digest("hex");
}

export function unsubscribeLink(email: string): string {
  return `${SITE_URL}/api/email/unsubscribe?email=${encodeURIComponent(
    email
  )}&token=${unsubscribeToken(email)}`;
}

/* ------------------------------------------------------------------ */
/* Shared formatting                                                   */
/* ------------------------------------------------------------------ */

export function firstName(name: string | null | undefined): string {
  const n = String(name ?? "").trim();
  return n ? n.split(/\s+/)[0] : "Friend";
}

export function fmtPkt(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Karachi",
  }).format(date);
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function fmtNum(v: unknown): string {
  return Math.round(num(v)).toLocaleString("en-PK");
}

/** Footer placeholders shared by all five file templates. */
export function footerVars(emailForUnsub?: string): Record<string, string> {
  return {
    site_url: SITE_URL,
    contact_email: CONTACT.email,
    instagram_url: "https://instagram.com/zulfira_0",
    facebook_url: "https://www.facebook.com/profile.php?id=61593966274766",
    unsubscribe_url: emailForUnsub ? unsubscribeLink(emailForUnsub) : "",
    year: String(new Date().getFullYear()),
  };
}

function trackUrl(orderNo: string): string {
  return `${SITE_URL}/track-order?order=${encodeURIComponent(orderNo)}`;
}

const paymentLabels: Record<string, string> = {
  COD: "Cash on Delivery",
  BANK_TRANSFER: "Bank Transfer",
  CARD: "Debit / Credit Card",
  JAZZCASH: "JazzCash",
  EASYPAISA: "Easypaisa",
};

/* ------------------------------------------------------------------ */
/* Minimal inline gold/black template for loyalty events               */
/* ------------------------------------------------------------------ */

function miniEmail(opts: {
  customerName: string;
  title: string;
  bodyHtml: string;
  ctaUrl?: string;
  ctaLabel?: string;
  unsubscribeUrl?: string;
}): string {
  const unsub = opts.unsubscribeUrl
    ? `<div style="margin-top:16px;font-size:12px;line-height:1.7;color:#9C9077;"><a href="${opts.unsubscribeUrl}" style="color:#9C9077;text-decoration:underline;">Unsubscribe</a> from marketing emails</div>`
    : "";
  const cta =
    opts.ctaUrl && opts.ctaLabel
      ? `<tr><td align="center" style="padding:8px 40px 24px 40px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color:#C9A227;border-radius:30px;"><a href="${opts.ctaUrl}" style="display:inline-block;padding:15px 44px;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:bold;letter-spacing:1px;color:#0B0B0B;text-decoration:none;">${opts.ctaLabel}</a></td></tr></table></td></tr>`
      : "";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F7EFDC;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#F7EFDC;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background-color:#FFFFFF;border:1px solid #E8DCC0;border-radius:12px;overflow:hidden;">
<tr><td align="center" style="padding:30px 40px;background-color:#FFFFFF;">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;letter-spacing:6px;color:#C9A227;">ZULFIRA</div>
<div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#6F6F6F;text-transform:uppercase;margin-top:8px;">Pakistan's Botanical Hair Ritual</div></td></tr>
<tr><td align="center" style="background-color:#0B0B0B;padding:40px 40px;">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.3;color:#C9A227;">${opts.title}</div>
<div style="width:64px;height:2px;background-color:#C9A227;margin:18px auto 0 auto;"></div></td></tr>
<tr><td style="padding:36px 40px 16px 40px;font-family:Helvetica,Arial,sans-serif;color:#1A1A1A;">
<p style="font-family:Georgia,'Times New Roman',serif;font-size:20px;margin:0 0 16px 0;">Hi ${opts.customerName},</p>
${opts.bodyHtml}</td></tr>
${cta}
<tr><td align="center" style="background-color:#0B0B0B;padding:28px 40px;font-family:Helvetica,Arial,sans-serif;">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;letter-spacing:5px;color:#C9A227;">ZULFIRA</div>
<div style="margin-top:12px;font-size:12px;line-height:1.7;color:#9C9077;">${CONTACT.email}${unsub}</div>
<div style="margin-top:8px;font-size:11px;color:#7A6F58;">© ${new Date().getFullYear()} Zulfira. Strong Roots. Silk Shine.</div></td></tr>
</table></td></tr></table></body></html>`;
}

function codeChip(code: string): string {
  return `<div style="display:inline-block;margin:14px 0;padding:14px 28px;background-color:#FBF7EC;border:2px dashed #C9A227;border-radius:10px;font-family:'Courier New',monospace;font-size:22px;font-weight:bold;letter-spacing:3px;color:#A8821C;">${code}</div>`;
}

/* ------------------------------------------------------------------ */
/* ORDER EVENTS (transactional — no unsubscribe gate)                   */
/* ------------------------------------------------------------------ */

export async function notifyOrderPlaced(
  db: any,
  order: {
    email?: string | null;
    customerName: string;
    orderNo: string;
    createdAt: Date | string;
    items: { name: string; qty: number; unitPrice: number | string }[];
    subtotal: number | string;
    deliveryCharge: number | string;
    total: number | string;
    payment: string;
    address: string;
    city: string;
  }
): Promise<{ sent: boolean; skipped?: boolean }> {
  try {
    if (!order.email) return { sent: false, skipped: true };
    const rows = order.items
      .map(
        (i) =>
          `<tr><td style="padding:12px 0;border-bottom:1px solid #E8DCC0;"><div style="font-size:15px;font-weight:bold;color:#1A1A1A;">${escapeHtml(i.name)}</div><div style="font-size:13px;color:#6F6F6F;margin-top:4px;">Qty: ${i.qty}</div></td><td align="right" valign="top" style="padding:12px 0;border-bottom:1px solid #E8DCC0;font-size:15px;font-weight:bold;color:#1A1A1A;white-space:nowrap;">Rs ${fmtNum(num(i.unitPrice) * i.qty)}</td></tr>`
      )
      .join("");
    const shippingFree = num(order.deliveryCharge) === 0;
    const html = renderTemplate("order-confirmation.html", {
      customer_name: firstName(order.customerName),
      order_number: order.orderNo,
      order_date: fmtPkt(order.createdAt),
      items_html: rows,
      subtotal: fmtNum(order.subtotal),
      shipping: shippingFree ? "FREE" : `Rs ${fmtNum(order.deliveryCharge)}`,
      total: fmtNum(order.total),
      payment_method: paymentLabels[order.payment] ?? order.payment,
      payment_note:
        order.payment === "COD"
          ? `Pay Rs ${fmtNum(order.total)} in cash when your order arrives.`
          : "Paid online — no action needed.",
      address: `${escapeHtml(order.address)}<br>${escapeHtml(order.city)}`,
      track_url: trackUrl(order.orderNo),
      ...footerVars(order.email),
    });
    if (!html) return { sent: false };
    return await sendEmail({
      to: order.email,
      subject: `Thank you for your order #${order.orderNo} — Zulfira`,
      html,
      template: "order-confirmation",
    });
  } catch {
    return { sent: false };
  }
}

export async function notifyOrderStatus(
  db: any,
  order: {
    email?: string | null;
    customerName: string;
    orderNo: string;
    status: string;
    courierName?: string | null;
    trackingNumber?: string | null;
    city: string;
  },
  statusMessage: string,
  timelineHtml: string
): Promise<{ sent: boolean; skipped?: boolean }> {
  try {
    if (!order.email) return { sent: false, skipped: true };
    const html = renderTemplate("order-status-update.html", {
      customer_name: firstName(order.customerName),
      order_number: order.orderNo,
      status: order.status.replace(/_/g, " "),
      status_message: escapeHtml(statusMessage),
      status_timeline_html: timelineHtml,
      courier_name: order.courierName ? escapeHtml(order.courierName) : "—",
      tracking_number: order.trackingNumber ? escapeHtml(order.trackingNumber) : "—",
      city: escapeHtml(order.city),
      track_url: trackUrl(order.orderNo),
      ...footerVars(order.email),
    });
    if (!html) return { sent: false };
    return await sendEmail({
      to: order.email,
      subject: `Order #${order.orderNo}: ${order.status.replace(/_/g, " ")} — Zulfira`,
      html,
      template: "order-status-update",
    });
  } catch {
    return { sent: false };
  }
}

export async function notifyDelivered(
  db: any,
  order: {
    email?: string | null;
    customerName: string;
    orderNo: string;
    items?: { name: string; qty: number }[];
  }
): Promise<{ sent: boolean; skipped?: boolean }> {
  try {
    if (!order.email) return { sent: false, skipped: true };
    const rows = (order.items ?? [])
      .map(
        (i) =>
          `<div style="padding:10px 0;border-bottom:1px solid #E8DCC0;font-size:15px;color:#1A1A1A;">${escapeHtml(i.name)} <span style="color:#6F6F6F;font-size:13px;">· Qty ${i.qty}</span></div>`
      )
      .join("");
    const html = renderTemplate("delivered-review-request.html", {
      customer_name: firstName(order.customerName),
      order_number: order.orderNo,
      delivery_date: fmtPkt(new Date()),
      review_url: `${trackUrl(order.orderNo)}#review`,
      review_incentive: "Share your review and get 10% off your next ritual.",
      items_html: rows,
      ...footerVars(order.email),
    });
    if (!html) return { sent: false };
    return await sendEmail({
      to: order.email,
      subject: `Delivered — how did we do? (Order #${order.orderNo})`,
      html,
      template: "delivered-review-request",
    });
  } catch {
    return { sent: false };
  }
}

/* ------------------------------------------------------------------ */
/* LOYALTY EVENTS (marketing ones gate on isUnsubscribed)               */
/* ------------------------------------------------------------------ */

/** Reorder reminder — reuses discount-announcement.html (marketing). */
export async function notifyReorderReminder(
  db: any,
  args: { email?: string; name: string; code: string; pct: number; expiryDate: string }
): Promise<{ sent: boolean; skipped?: boolean }> {
  try {
    if (!args.email) return { sent: false, skipped: true };
    if (await isUnsubscribed(db, args.email)) return { sent: false, skipped: true };
    const html = renderTemplate("discount-announcement.html", {
      customer_name: firstName(args.name),
      promo_title: "Your hair oil is running low",
      discount_percent: `${args.pct}%`,
      promo_description: `Your personal ${args.pct}% reorder gift on the Zulfira Revitalizing Hair Oil — restock your ritual before you run dry.`,
      discount_code: args.code,
      expiry_date: args.expiryDate,
      promo_terms: "One use per customer. Not combinable with other offers.",
      shop_url: `${SITE_URL}/shop`,
      ...footerVars(args.email),
    });
    if (!html) return { sent: false };
    return await sendEmail({
      to: args.email,
      subject: `Your ${args.pct}% reorder gift is waiting — Zulfira`,
      html,
      template: "discount-announcement",
    });
  } catch {
    return { sent: false };
  }
}

/** Review reward — earned reward, transactional-ish (no unsubscribe gate). */
export async function notifyReviewReward(
  db: any,
  args: { email?: string; name: string; code: string; value: number }
): Promise<{ sent: boolean; skipped?: boolean }> {
  try {
    if (!args.email) return { sent: false, skipped: true };
    const html = miniEmail({
      customerName: firstName(args.name),
      title: "Your review earned a reward",
      bodyHtml: `<p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0 0 12px 0;">Thank you for sharing your honest feedback — it helps other customers choose with confidence.</p>
<p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0 0 4px 0;">Here is your reward: <strong style="color:#A8821C;">Rs ${fmtNum(args.value)} off</strong> your next order.</p>
${codeChip(args.code)}
<p style="font-size:13px;line-height:1.7;color:#6F6F6F;margin:8px 0 0 0;">Apply the code at checkout. One use per customer.</p>`,
      ctaUrl: `${SITE_URL}/shop`,
      ctaLabel: "SHOP NOW",
    });
    return await sendEmail({
      to: args.email,
      subject: "Your review reward is here — Zulfira",
      html,
      template: "review-reward",
    });
  } catch {
    return { sent: false };
  }
}

export async function notifySubscription(
  db: any,
  args: {
    email?: string;
    name: string;
    kind: "upcoming" | "paused" | "cancelled";
    productName?: string;
    shipDate?: string;
  }
): Promise<{ sent: boolean; skipped?: boolean }> {
  try {
    if (!args.email) return { sent: false, skipped: true };
    const copy =
      args.kind === "upcoming"
        ? {
            title: "Your ritual refill is on its way",
            body: `<p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0;">Your next <strong>${escapeHtml(args.productName ?? "subscription box")}</strong> ships on <strong>${escapeHtml(args.shipDate ?? "")}</strong>. Payment will be collected on delivery — no action needed from you.</p>`,
          }
        : args.kind === "paused"
          ? {
              title: "Your subscription is paused",
              body: `<p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0;">Your Zulfira subscription is paused. No shipments or charges will happen until you resume it from the shop.</p>`,
            }
          : {
              title: "Your subscription is cancelled",
              body: `<p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0;">Your Zulfira subscription has been cancelled. You can restart it any time from the shop — your ritual will be waiting.</p>`,
            };
    const html = miniEmail({
      customerName: firstName(args.name),
      title: copy.title,
      bodyHtml: copy.body,
      ctaUrl: `${SITE_URL}/shop`,
      ctaLabel: "VISIT SHOP",
    });
    return await sendEmail({
      to: args.email,
      subject: `${copy.title} — Zulfira`,
      html,
      template: "subscription",
    });
  } catch {
    return { sent: false };
  }
}

export async function notifyChallenge(
  db: any,
  args: {
    email?: string;
    name: string;
    kind: "signup" | "day7" | "day14" | "day21" | "completed";
  }
): Promise<{ sent: boolean; skipped?: boolean }> {
  try {
    if (!args.email) return { sent: false, skipped: true };
    const copy: Record<string, { title: string; body: string }> = {
      signup: {
        title: "You're in the 30-Day Challenge",
        body: `<p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0 0 12px 0;">Welcome to the Zulfira 30-Day Hair Challenge. Post your daily ritual, tag us, and check in each week — the best transformation wins a full 1-year supply.</p><p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0;">Take your Day 1 photo today so you can see how far you come.</p>`,
      },
      day7: {
        title: "Day 7 — first check-in",
        body: `<p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0;">One week down. Keep up your daily ritual and post your Day 7 progress — consistency is what transforms hair.</p>`,
      },
      day14: {
        title: "Day 14 — halfway there",
        body: `<p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0;">You're halfway through the challenge. Your roots are thanking you — keep going, and share your mid-point glow.</p>`,
      },
      day21: {
        title: "Day 21 — final stretch",
        body: `<p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0;">Nine days to go. Finish strong — the best transformation wins a 1-year supply of Zulfira.</p>`,
      },
      completed: {
        title: "Challenge complete",
        body: `<p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0;">You did it — 30 days of ritual complete. Winners will be announced soon. Strong Roots. Silk Shine.</p>`,
      },
    };
    const c = copy[args.kind];
    const html = miniEmail({
      customerName: firstName(args.name),
      title: c.title,
      bodyHtml: c.body,
    });
    return await sendEmail({
      to: args.email,
      subject: `${c.title} — Zulfira`,
      html,
      template: "challenge",
    });
  } catch {
    return { sent: false };
  }
}

export async function notifyGiftTrial(
  db: any,
  args: {
    email?: string;
    name: string;
    kind: "sender_credit" | "friend_welcome";
    code?: string;
    amount?: number;
  }
): Promise<{ sent: boolean; skipped?: boolean }> {
  try {
    if (!args.email) return { sent: false, skipped: true };
    // friend_welcome is marketing → gate on unsubscribe.
    if (args.kind === "friend_welcome" && (await isUnsubscribed(db, args.email))) {
      return { sent: false, skipped: true };
    }
    const c =
      args.kind === "sender_credit"
        ? {
            title: "Your wallet credit is here",
            body: `<p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0 0 12px 0;">Thanks for gifting a trial bottle — your friend just placed their first order, so here is your reward:</p><p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0;"><strong style="color:#A8821C;">Rs ${fmtNum(args.amount ?? 200)}</strong> wallet credit, ready to use at checkout.</p>`,
            unsub: undefined as string | undefined,
          }
        : {
            title: "A friend gifted you Zulfira",
            body: `<p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0 0 12px 0;">Someone who cares about your hair sent you a free trial bottle of Zulfira Revitalizing Hair Oil. Welcome to the ritual.</p><p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0 0 4px 0;">Use this code for <strong>15% off</strong> your first full-size order:</p>${codeChip(escapeHtml(args.code ?? "FRIEND15"))}`,
            unsub: unsubscribeLink(args.email),
          };
    const html = miniEmail({
      customerName: firstName(args.name),
      title: c.title,
      bodyHtml: c.body,
      ctaUrl: `${SITE_URL}/shop`,
      ctaLabel: "START MY RITUAL",
      unsubscribeUrl: c.unsub,
    });
    return await sendEmail({
      to: args.email,
      subject: `${c.title} — Zulfira`,
      html,
      template: "gift-trial",
    });
  } catch {
    return { sent: false };
  }
}

/** Zulfira Insiders invite (marketing → gate on unsubscribe). */
export async function notifyInsidersInvite(
  db: any,
  args: { email?: string; name: string }
): Promise<{ sent: boolean; skipped?: boolean }> {
  try {
    if (!args.email) return { sent: false, skipped: true };
    if (await isUnsubscribed(db, args.email)) return { sent: false, skipped: true };
    const html = miniEmail({
      customerName: firstName(args.name),
      title: "You're invited: Zulfira Insiders",
      bodyHtml: `<p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0 0 12px 0;">As one of our repeat customers, you're invited to <strong>Zulfira Insiders</strong> — our private members' circle with early access to new formulas, members-only prices, and hair-ritual tips from our studio.</p><p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0;">Reply to this email to join — we'll send your invite.</p>`,
      unsubscribeUrl: unsubscribeLink(args.email),
    });
    return await sendEmail({
      to: args.email,
      subject: "You're invited: Zulfira Insiders",
      html,
      template: "insiders",
    });
  } catch {
    return { sent: false };
  }
}

export async function notifyEquity(
  db: any,
  args: {
    email?: string;
    name: string;
    kind: "applied" | "approved" | "payout";
    slots?: number;
    payout?: number;
    quarter?: string;
  }
): Promise<{ sent: boolean; skipped?: boolean }> {
  try {
    if (!args.email) return { sent: false, skipped: true };
    const copy =
      args.kind === "applied"
        ? {
            title: "Investment application received",
            body: `<p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0;">Thank you for applying for the Zulfira 1% equity / profit-share program. Our team will review your application and respond within 3 business days.</p>`,
          }
        : args.kind === "approved"
          ? {
              title: "Welcome, co-owner",
              body: `<p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0 0 12px 0;">Your application for <strong>${args.slots ?? 1}% equity</strong> in Zulfira has been approved.</p><p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0 0 12px 0;">Before any funds move, a lawyer-drafted agreement must be signed by both parties. We will share the agreement document and payment details separately.</p><p style="font-size:13px;line-height:1.7;color:#6F6F6F;margin:0;">Do not transfer any funds until you have the signed agreement in hand.</p>`,
            }
          : {
              title: "Your profit-share payout",
              body: `<p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0 0 12px 0;">Your profit-share for <strong>${escapeHtml(args.quarter ?? "")}</strong> is ready: <strong style="color:#A8821C;">Rs ${fmtNum(args.payout ?? 0)}</strong>.</p><p style="font-size:15px;line-height:1.7;color:#3a3a3a;margin:0;">Payout details are in your owner dashboard. Thank you for growing Zulfira with us.</p>`,
            };
    const html = miniEmail({
      customerName: firstName(args.name),
      title: copy.title,
      bodyHtml: copy.body,
    });
    return await sendEmail({
      to: args.email,
      subject: `${copy.title} — Zulfira`,
      html,
      template: "equity",
    });
  } catch {
    return { sent: false };
  }
}

/** 7-day post-delivery follow-up (marketing → gate on unsubscribe). */
export async function notifyFollowup7Day(
  db: any,
  args: { email?: string; name: string; orderNo?: string; deliveryDate?: Date | string }
): Promise<{ sent: boolean; skipped?: boolean }> {
  try {
    if (!args.email) return { sent: false, skipped: true };
    if (await isUnsubscribed(db, args.email)) return { sent: false, skipped: true };
    const orderNo = args.orderNo ?? "";
    const html = renderTemplate("followup-7-day.html", {
      customer_name: firstName(args.name),
      delivery_date: args.deliveryDate ? fmtPkt(args.deliveryDate) : "",
      review_url: orderNo ? `${trackUrl(orderNo)}#review` : `${SITE_URL}/track-order`,
      shop_url: `${SITE_URL}/shop`,
      ...footerVars(args.email),
    });
    if (!html) return { sent: false };
    return await sendEmail({
      to: args.email,
      subject: orderNo
        ? `One week in — how's your hair feeling? (Order #${orderNo})`
        : "One week in — how's your hair feeling?",
      html,
      template: "followup-7-day",
    });
  } catch {
    return { sent: false };
  }
}

/* ------------------------------------------------------------------ */
/* HTML escaping for interpolated user content                         */
/* ------------------------------------------------------------------ */

export function escapeHtml(s: string | null | undefined): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
