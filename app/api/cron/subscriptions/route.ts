export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { programEnabled } from "@/lib/discounts";
import { generateOrderNo, adjustStock, checkLowStock } from "@/lib/orders";
import { sendTelegram, tgEscape } from "@/lib/telegram";
import { notifySubscription } from "@/lib/email";

const normPhone = (p: string) => {
  let d = String(p || "").replace(/\D/g, "");
  if (d.startsWith("0")) d = "92" + d.slice(1);
  if (!d.startsWith("92")) d = "92" + d;
  return d;
};

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });

function chunked(entries: string[], header: string): string[] {
  const chunks: string[] = [];
  let current = header;
  for (const entry of entries) {
    if ((current + entry).length > 3500) {
      chunks.push(current);
      current = "";
    }
    current += entry + "\n\n";
  }
  if (current.trim()) chunks.push(current);
  return chunks;
}

// CRON — Subscribe & Save lifecycle.
// (a) Warnings: active subscriptions shipping within warnDays → Telegram digest
//     with tap-to-send WhatsApp links for the admin.
// (b) Due: nextShipDate <= now → auto-create a PENDING COD refill order,
//     decrement stock like a normal sale, advance nextShipDate by intervalDays.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) return err("Unauthorized", 401);
  }
  const db = getDb();
  if (!db) return dbRequired();

  const { enabled, config } = await programEnabled(db, "subscribe_save");
  if (!enabled) return ok({ skipped: true });

  const warnDays = Number(config.warnDays ?? 3);
  const intervalDays = Number(config.intervalDays ?? 45);
  const DAY = 24 * 3_600_000;
  const now = Date.now();

  // ── (a) warnings ──────────────────────────────────────────────────
  const warnings = await db.subscription.findMany({
    where: {
      status: "active",
      nextShipDate: { gt: new Date(now), lte: new Date(now + warnDays * DAY) },
    },
    include: { product: { select: { name: true } } },
  });

  const warnEntries: string[] = [];
  for (const s of warnings) {
    const phone = normPhone(s.phone);
    const firstName = s.customerName.trim().split(/\s+/)[0];
    const msg =
      `Hi ${firstName}! Your Zulfira ${s.product.name} ` +
      `refill ships in ${warnDays} days. Reply SKIP to skip, STOP to cancel.`;
    warnEntries.push(
      `• ${tgEscape(s.customerName)} (${tgEscape(phone)})\n` +
        `  ${tgEscape(s.product.name)} · ships ${fmtDate(new Date(s.nextShipDate))}\n` +
        `  https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    );
    // Email version of the warning (look up latest order email by phone).
    const lastOrder = await db.order.findFirst({
      where: { phone: s.phone },
      orderBy: { createdAt: "desc" },
      select: { email: true },
    });
    notifySubscription(db, {
      email: lastOrder?.email ?? undefined,
      name: firstName,
      kind: "upcoming",
      productName: s.product.name,
      shipDate: fmtDate(new Date(s.nextShipDate)),
    }).catch(() => {});
  }

  let warnMessagesSent = 0;
  for (const chunk of chunked(
    warnEntries,
    `<b>Subscribe &amp; Save — ${warnings.length} refill${warnings.length === 1 ? "" : "s"} shipping soon</b>\n` +
      `Tap a link to send the WhatsApp warning:\n\n`
  )) {
    if (await sendTelegram(chunk.trim())) warnMessagesSent++;
  }

  // ── (b) due refills → auto-orders ─────────────────────────────────
  const due = await db.subscription.findMany({
    where: { status: "active", nextShipDate: { lte: new Date(now) } },
    include: { product: { select: { name: true, salePrice: true } } },
  });

  const orderEntries: string[] = [];
  let ordersCreated = 0;

  for (const sub of due) {
    const unitPrice = Math.round(Number(sub.product.salePrice) * 100) / 100;
    const cycleDays = sub.intervalDays || intervalDays;
    let created: { orderNo: string } | null = null;

    // Mirror the checkout order shape: retry on order-number collision.
    for (let attempt = 0; attempt < 5 && !created; attempt++) {
      const orderNo = generateOrderNo();
      try {
        created = await db.$transaction(async (tx) => {
          const order = await tx.order.create({
            data: {
              orderNo,
              customerName: sub.customerName,
              phone: sub.phone,
              address: sub.address,
              city: sub.city,
              notes: "Subscription refill (auto-created)",
              payment: "COD",
              subtotal: unitPrice,
              deliveryCharge: 0,
              discount: 0,
              total: unitPrice,
              items: {
                create: [{ productId: sub.productId, qty: 1, unitPrice }],
              },
            },
            select: { id: true, orderNo: true },
          });
          // Stock moves like a normal sale.
          const updated = await adjustStock(
            tx,
            sub.productId,
            -1,
            "SALE",
            `Subscription refill ${orderNo}`,
            order.id
          );
          await checkLowStock(tx, updated, updated.stockQty + 1);
          // Advance this subscription to its next cycle.
          await tx.subscription.update({
            where: { id: sub.id },
            data: { nextShipDate: new Date(new Date(sub.nextShipDate).getTime() + cycleDays * DAY) },
          });
          return order;
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          continue; // orderNo collision — regenerate
        }
        throw e;
      }
    }
    if (!created) continue;
    ordersCreated++;
    orderEntries.push(
      `• ${tgEscape(created.orderNo)} — ${tgEscape(sub.customerName)} (${tgEscape(normPhone(sub.phone))})\n` +
        `  ${tgEscape(sub.product.name)} ×1 · next refill in ${cycleDays} days`
    );
  }

  let orderMessagesSent = 0;
  for (const chunk of chunked(
    orderEntries,
    `<b>Subscribe &amp; Save — ${ordersCreated} auto refill order${ordersCreated === 1 ? "" : "s"} created</b>\n\n`
  )) {
    if (await sendTelegram(chunk.trim())) orderMessagesSent++;
  }

  return ok({
    warnings: warnings.length,
    warnMessagesSent,
    due: due.length,
    ordersCreated,
    orderMessagesSent,
  });
}
