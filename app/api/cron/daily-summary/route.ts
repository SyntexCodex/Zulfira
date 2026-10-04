export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { computeGlobalPnl } from "@/lib/pnl";
import { getSetting } from "@/lib/settings";
import { sendTelegram, isTelegramEnabled } from "@/lib/telegram";

/** Start of "today" in PKT (UTC+5, no DST) as a UTC instant. */
function startOfTodayPKT(): Date {
  const now = new Date();
  const pkt = new Date(now.getTime() + 5 * 3_600_000);
  pkt.setUTCHours(0, 0, 0, 0);
  return new Date(pkt.getTime() - 5 * 3_600_000);
}

const money = (n: number) => `Rs ${Math.round(n).toLocaleString("en-PK")}`;

// Hit by Vercel Cron (or manually). When CRON_SECRET is set, a Bearer token
// is required; without it the endpoint is open but only sends a summary.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) return err("Unauthorized", 401);
  }
  const db = getDb();
  if (!db) return dbRequired();

  const today = startOfTodayPKT();
  const pnl = await computeGlobalPnl({ from: today });

  const ordersByStatusRaw = await db.order.groupBy({
    by: ["status"],
    where: { createdAt: { gte: today } },
    _count: true,
  });
  const ordersByStatus: Record<string, number> = {};
  for (const r of ordersByStatusRaw) ordersByStatus[r.status] = r._count;

  const visitorsToday = await db.pageView.count({
    where: { createdAt: { gte: today } },
  });

  const stats = {
    date: today.toISOString().slice(0, 10),
    net: pnl?.totals.net ?? 0,
    collected: pnl?.totals.collected ?? 0,
    expenses: pnl?.totals.expenses ?? 0,
    invested: pnl?.totals.invested ?? 0,
    returnsLoss: pnl?.totals.returnsLoss ?? 0,
    deliveredOrders: pnl?.totals.deliveredOrders ?? 0,
    pipelineValue: pnl?.totals.pipelineValue ?? 0,
    ordersByStatus,
    visitorsToday,
  };

  let sent = false;
  if (
    (await getSetting("alert_daily_summary", "1")) !== "0" &&
    isTelegramEnabled()
  ) {
    const funnel = Object.entries(ordersByStatus)
      .map(([s, c]) => `${s}: ${c}`)
      .join(", ");
    sent = await sendTelegram(
      `📊 <b>Zulfira daily summary — ${stats.date}</b>\n` +
        `Net: <b>${money(stats.net)}</b> | Collected: ${money(stats.collected)}\n` +
        `Expenses: ${money(stats.expenses)} | Invested: ${money(stats.invested)}\n` +
        `Delivered orders: ${stats.deliveredOrders} | Pipeline: ${money(stats.pipelineValue)}\n` +
        `Orders today — ${funnel || "none"}\n` +
        `Visitors today: ${stats.visitorsToday}`
    );
  }

  return ok({ sent, stats });
}
