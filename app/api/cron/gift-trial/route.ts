export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { programEnabled, generateCode, createDiscountCode, normPhone } from "@/lib/discounts";
import { sendTelegram, tgEscape } from "@/lib/telegram";
import { notifyGiftTrial } from "@/lib/email";

// CRON — when a gifted friend places (and receives) their first order,
// credit the sender Rs 200 + a personal discount code. Daily.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) return err("Unauthorized", 401);
  }
  const db = getDb();
  if (!db) return dbRequired();
  const { enabled, config } = await programEnabled(db, "gift_trial");
  if (!enabled) return ok({ skipped: true });

  const senderCredit = Number(config.senderCredit ?? 200);
  const pending = await db.giftTrial.findMany({
    where: { creditIssued: false },
    orderBy: { createdAt: "asc" },
  });

  const issued: { senderName: string; senderPhone: string; friendName: string; code: string }[] = [];

  for (const gt of pending) {
    const friendPhone = normPhone(gt.friendPhone);
    // Friend's first DELIVERED order, placed after the gift nomination.
    const delivered = await db.order.findMany({
      where: { status: "DELIVERED", createdAt: { gt: gt.createdAt } },
      select: { phone: true },
    });
    const ordered = delivered.some((o) => normPhone(o.phone) === friendPhone);
    if (!ordered) continue;

    const senderPhone = normPhone(gt.senderPhone);
    const code = generateCode("CREDIT");
    await db.$transaction([
      db.giftTrial.update({
        where: { id: gt.id },
        data: { status: "ordered", creditIssued: true },
      }),
      db.walletCredit.create({
        data: {
          phone: senderPhone,
          amount: senderCredit,
          reason: "gift_trial",
          code,
        },
      }),
    ]);
    // Personal one-time code mirroring the wallet credit.
    await createDiscountCode(db, {
      code,
      kind: "fixed",
      value: senderCredit,
      maxUses: 1,
      programKey: "gift_trial",
      phone: senderPhone,
    });

    // Sender credit email (fire-and-forget).
    notifyGiftTrial(db, {
      email: gt.senderEmail ?? undefined,
      name: gt.senderName.trim().split(/\s+/)[0],
      kind: "sender_credit",
      code,
      amount: senderCredit,
    }).catch(() => {});

    issued.push({
      senderName: gt.senderName,
      senderPhone,
      friendName: gt.friendName,
      code,
    });
  }

  if (issued.length) {
    const lines = issued.map((r) => {
      const msg =
        `Hi ${r.senderName}! Great news — ${r.friendName} placed their first Zulfira order from your trial gift. ` +
        `We've credited Rs ${senderCredit} to your wallet. Use code ${r.code} on your next order. Thank you for spreading the glow! ✨`;
      const link = `https://wa.me/${r.senderPhone}?text=${encodeURIComponent(msg)}`;
      return `• ${tgEscape(r.senderName)} (${tgEscape(r.friendName)} ordered) — <a href="${link}">tap to send the Rs ${senderCredit} credit WhatsApp</a>`;
    });
    const text =
      `🎁 <b>Gift-a-trial: ${issued.length} sender credit${issued.length > 1 ? "s" : ""} issued</b>\n` +
      `(tap-to-send; messages are NOT sent automatically)\n` +
      lines.join("\n");
    await sendTelegram(text.slice(0, 3500));
  }

  return ok({ checked: pending.length, issued: issued.length });
}
