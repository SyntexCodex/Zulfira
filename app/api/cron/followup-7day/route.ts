export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { notifyFollowup7Day } from "@/lib/email";

const DAY = 24 * 3_600_000;

// CRON — 7-day post-delivery follow-up email.
// Finds orders DELIVERED ~7 days ago (±12h window) with an email address.
// Dedupe: skips if a 'followup-7-day' EmailLog for that email+order exists
// in the last 30 days. Marketing gate: helper skips unsubscribed emails.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) return err("Unauthorized", 401);
  }
  const db = getDb();
  if (!db) return dbRequired();

  const now = Date.now();
  const low = new Date(now - 7 * DAY - 12 * 3_600_000);
  const high = new Date(now - 7 * DAY + 12 * 3_600_000);
  const thirtyDaysAgo = new Date(now - 30 * DAY);

  const candidates = await db.order.findMany({
    where: {
      status: "DELIVERED",
      deliveredAt: { gte: low, lte: high },
      email: { not: null },
    },
    select: { id: true, orderNo: true, customerName: true, email: true, deliveredAt: true },
  });

  let sent = 0;
  let skipped = 0;
  const detail: string[] = [];

  for (const o of candidates) {
    if (!o.email) continue;
    try {
      const already = await db.emailLog.count({
        where: {
          template: "followup-7-day",
          to: o.email,
          subject: { contains: o.orderNo },
          createdAt: { gte: thirtyDaysAgo },
        },
      });
      if (already > 0) {
        skipped++;
        detail.push(`${o.orderNo}: deduped`);
        continue;
      }
      const r = await notifyFollowup7Day(db, {
        email: o.email,
        name: o.customerName,
        orderNo: o.orderNo,
        deliveryDate: o.deliveredAt ?? undefined,
      });
      if (r.sent) {
        sent++;
        detail.push(`${o.orderNo}: sent`);
      } else {
        skipped++;
        detail.push(`${o.orderNo}: skipped`);
      }
    } catch {
      skipped++;
      detail.push(`${o.orderNo}: error`);
    }
  }

  return ok({ candidates: candidates.length, sent, skipped, detail });
}
