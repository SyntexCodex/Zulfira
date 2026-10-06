export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { generateCode, createDiscountCode, programEnabled } from "@/lib/discounts";
import { sendTelegram, tgEscape } from "@/lib/telegram";
import { notifyReorderReminder } from "@/lib/email";

const SITE_URL = "https://zulfira.vercel.app";
const OIL_SLUG = "revitalizing-hair-oil";

const normPhone = (p: string) => {
  let d = String(p || "").replace(/\D/g, "");
  if (d.startsWith("0")) d = "92" + d.slice(1);
  if (!d.startsWith("92")) d = "92" + d;
  return d;
};

// CRON — reorder reminders for the hair oil.
// First nudge: delivered exactly daysAfter ago. Final nudge: delivered
// daysAfter+finalNudgeDays ago. One code per customer per refill cycle
// (deduped on DiscountCode phone+program). Sends a Telegram digest to the
// admin with tap-to-send WhatsApp links — customer WhatsApp is never
// automatic.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) return err("Unauthorized", 401);
  }
  const db = getDb();
  if (!db) return dbRequired();

  const { enabled, config } = await programEnabled(db, "reorder_reminders");
  if (!enabled) return ok({ skipped: true });

  const daysAfter = Number(config.daysAfter ?? 35);
  const discountPct = Number(config.discountPct ?? 10);
  const codeExpiryDays = Number(config.codeExpiryDays ?? 7);
  const finalNudgeDays = Number(config.finalNudgeDays ?? 7);

  const DAY = 24 * 3_600_000;
  const now = Date.now();
  const inWindow = (deliveredAt: Date, lowDays: number, highDays: number) => {
    const t = deliveredAt.getTime();
    return t <= now - highDays * DAY && t >= now - lowDays * DAY;
  };

  // Delivered orders of the hair oil within either nudge window.
  const outerLow = new Date(now - (daysAfter + finalNudgeDays + 1) * DAY);
  const outerHigh = new Date(now - daysAfter * DAY);
  const candidates = await db.order.findMany({
    where: {
      status: "DELIVERED",
      deliveredAt: { gte: outerLow, lte: outerHigh },
      items: { some: { product: { slug: OIL_SLUG } } },
    },
    include: { items: { select: { productId: true } } },
  });

  const entries: string[] = [];
  let codesIssued = 0;
  let skippedRepeat = 0;
  let skippedDuplicate = 0;

  for (const order of candidates) {
    if (!order.deliveredAt) continue;
    const isFirst = inWindow(order.deliveredAt, daysAfter + 1, daysAfter);
    const isFinal = inWindow(order.deliveredAt, daysAfter + finalNudgeDays + 1, daysAfter + finalNudgeDays);
    if (!isFirst && !isFinal) continue;

    const phone = normPhone(order.phone);

    // Skip repeat buyers — anyone who ordered after this delivery doesn't
    // need a refill nudge.
    const laterOrders = await db.order.count({
      where: { phone: order.phone, createdAt: { gt: order.deliveredAt } },
    });
    if (laterOrders > 0) {
      skippedRepeat++;
      continue;
    }

    // Dedupe: one reminder code per customer per refill cycle.
    const existingCode = await db.discountCode.findFirst({
      where: { programKey: "reorder_reminders", phone },
      select: { id: true },
    });
    if (existingCode) {
      skippedDuplicate++;
      continue;
    }

    const { code } = await createDiscountCode(db, {
      code: generateCode("REFILL"),
      kind: "percent",
      value: discountPct,
      maxUses: 1,
      programKey: "reorder_reminders",
      phone: order.phone,
      expiresAt: new Date(now + codeExpiryDays * DAY),
    });
    codesIssued++;

    const firstName = order.customerName.trim().split(/\s+/)[0];
    const productLink = `${SITE_URL}/product/${OIL_SLUG}?code=${code}`;
    const msg = isFirst
      ? `Hi ${firstName}! Your Zulfira Hair Oil is probably running low. Reorder in the next 7 days with ${discountPct}% off — just for you: ${productLink}`
      : `Hi ${firstName}! Your Zulfira Hair Oil is probably running low. Your ${discountPct}% refill code ${code} expires in 3 days — reorder here: ${productLink}`;
    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

    entries.push(
      `• ${tgEscape(order.customerName)} (${tgEscape(phone)})\n` +
        `  ${isFinal ? "FINAL nudge" : "1st nudge"} · code ${tgEscape(code)} · ${discountPct}% off\n` +
        `  ${waLink}`
    );

    // Email version of the nudge on the first reminder (marketing-gated inside the helper).
    if (isFirst) {
      notifyReorderReminder(db, {
        email: order.email ?? undefined,
        name: firstName,
        code,
        pct: discountPct,
        expiryDate: new Date(now + codeExpiryDays * DAY).toLocaleDateString("en-PK", { day: "numeric", month: "short" }),
      }).catch(() => {});
    }
  }

  // Telegram digest, chunked under ~3500 chars. Admin taps the wa.me links
  // to send the WhatsApp messages manually.
  let messagesSent = 0;
  if (entries.length > 0) {
    const chunks: string[] = [];
    let current = `<b>Refill reminders — ${entries.length} customer${entries.length > 1 ? "s" : ""}</b>\n` +
      `Send each WhatsApp by tapping the link:\n\n`;
    for (const entry of entries) {
      if ((current + entry).length > 3500) {
        chunks.push(current);
        current = "";
      }
      current += entry + "\n\n";
    }
    if (current.trim()) chunks.push(current);
    for (const chunk of chunks) {
      if (await sendTelegram(chunk.trim())) messagesSent++;
    }
  }

  return ok({
    candidates: candidates.length,
    codesIssued,
    skippedRepeat,
    skippedDuplicate,
    digestMessagesSent: messagesSent,
  });
}
