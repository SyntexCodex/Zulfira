export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { programEnabled } from "@/lib/discounts";
import { sendTelegram, tgEscape } from "@/lib/telegram";
import { notifyChallenge } from "@/lib/email";

const MS_DAY = 86_400_000;
const REMINDER_DAYS = new Set([1, 7, 14, 21, 30]);

/** Start of "today" in PKT (UTC+5, no DST). */
function todayPKT(): Date {
  const now = new Date();
  const pkt = new Date(now.getTime() + 5 * 3_600_000);
  pkt.setUTCHours(0, 0, 0, 0);
  return new Date(pkt.getTime() - 5 * 3_600_000);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// CRON — recompute strikes for the running round, send reminder digests + summary.
// Daily (PKT morning). Bearer auth via CRON_SECRET.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) return err("Unauthorized", 401);
  }
  const db = getDb();
  if (!db) return dbRequired();

  const { enabled, config } = await programEnabled(db, "challenge_30");
  if (!enabled) return ok({ skipped: true });

  const round = await db.challengeRound.findFirst({
    where: { status: "running" },
    orderBy: { createdAt: "desc" },
  });
  if (!round) return ok({ skipped: true, reason: "no running round" });

  const strikesOut = Number(config.strikesOut ?? 3);
  const dayNum = Math.floor((todayPKT().getTime() - round.startDate.getTime()) / MS_DAY) + 1;

  const challengers = await db.challenger.findMany({
    where: { roundId: round.id, status: "active" },
    include: { checkins: { select: { day: true } } },
  });

  const pastDays = Math.max(0, Math.min(dayNum - 1, 30));
  const newlyOut: string[] = [];
  for (const c of challengers) {
    const logged = new Set(c.checkins.map((k) => k.day));
    let strikes = 0;
    for (let d = 1; d <= pastDays; d++) if (!logged.has(d)) strikes++;
    if (dayNum > 30) {
      await db.challenger.update({ where: { id: c.id }, data: { status: "completed", strikes } });
      notifyChallenge(db, {
        email: (c as { email?: string | null }).email ?? undefined,
        name: c.name.split(" ")[0],
        kind: "completed",
      }).catch(() => {});
    } else if (strikes >= strikesOut) {
      await db.challenger.update({ where: { id: c.id }, data: { status: "out", strikes } });
      newlyOut.push(c.name);
    } else {
      await db.challenger.update({ where: { id: c.id }, data: { strikes } });
    }
  }

  const counts = await db.challenger.groupBy({
    by: ["status"],
    where: { roundId: round.id },
    _count: true,
  });
  const byStatus: Record<string, number> = {};
  for (const r of counts) byStatus[r.status] = r._count;

  // (1) Daily reminder template with tap-to-send wa.me links — only on key days.
  if (REMINDER_DAYS.has(dayNum) && dayNum <= 30) {
    const msg =
      `Day ${dayNum} of the Zulfira 30-Day Challenge! Post today's video and tag @zulfira #Zulfira30DayChallenge. ` +
      `One missed day = one strike. 3 strikes and you're out.`;
    const actives = await db.challenger.findMany({
      where: { roundId: round.id, status: "active" },
      select: { name: true, phone: true, email: true },
    });
    // Encouragement emails on days 7/14/21 (marketing-gated inside the helper).
    if ([7, 14, 21].includes(dayNum)) {
      for (const c of actives) {
        notifyChallenge(db, {
          email: c.email ?? undefined,
          name: c.name.split(" ")[0],
          kind: `day${dayNum}` as "day7" | "day14" | "day21",
        }).catch(() => {});
      }
    }
    for (const batch of chunk(actives, 20)) {
      const lines = batch.map((c) => {
        const link = `https://wa.me/${c.phone}?text=${encodeURIComponent(msg)}`;
        return `• <a href="${link}">${tgEscape(c.name)}</a>`;
      });
      const text =
        `🏆 <b>Challenge Day ${dayNum} — tap a name to send the WhatsApp reminder</b>\n` +
        `(tap-to-send; messages are NOT sent automatically)\n` +
        lines.join("\n");
      await sendTelegram(text.slice(0, 3500));
    }
  }

  // (2) Summary digest.
  const summary =
    `🏆 <b>30-Day Challenge — ${tgEscape(round.name)}</b>\n` +
    `Day ${Math.min(Math.max(dayNum, 1), 30)} of 30\n` +
    `Active: <b>${byStatus.active ?? 0}</b> | Out: ${byStatus.out ?? 0} | Completed: ${byStatus.completed ?? 0}\n` +
    (newlyOut.length
      ? `Newly struck out (${newlyOut.length}): ${tgEscape(newlyOut.slice(0, 10).join(", "))}${newlyOut.length > 10 ? "…" : ""}`
      : "No new strikouts today.");
  await sendTelegram(summary.slice(0, 3500));

  return ok({
    round: round.name,
    dayNum,
    active: byStatus.active ?? 0,
    out: byStatus.out ?? 0,
    completed: byStatus.completed ?? 0,
    newlyOut: newlyOut.length,
  });
}
