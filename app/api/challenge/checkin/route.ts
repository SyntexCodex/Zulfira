export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { programEnabled, normPhone } from "@/lib/discounts";

function looksLikeUrl(u: string): boolean {
  return /^https?:\/\/\S+\.\S+/i.test(u.trim());
}

// PUBLIC — log a daily challenge post (upsert per challenger+day).
export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const { enabled } = await programEnabled(db, "challenge_30");
  if (!enabled) return err("The 30-day challenge is not open right now.", 403);

  const body = (await req.json().catch(() => ({}))) as {
    phone?: string;
    day?: number;
    postUrl?: string;
  };
  const day = Number(body.day);
  const postUrl = (body.postUrl ?? "").trim();
  if (!body.phone || !Number.isInteger(day) || day < 1 || day > 30) {
    return err("Valid phone and day (1–30) are required.", 400);
  }
  if (!looksLikeUrl(postUrl)) {
    return err("Please paste a valid post link (https://…).", 400);
  }

  const round =
    (await db.challengeRound.findFirst({
      where: { status: "running" },
      orderBy: { createdAt: "desc" },
    })) ??
    (await db.challengeRound.findFirst({
      where: { status: "open" },
      orderBy: { createdAt: "desc" },
    }));
  if (!round) return err("No active round right now.", 400);

  const challenger = await db.challenger.findFirst({
    where: { roundId: round.id, phone: normPhone(body.phone), status: "active" },
  });
  if (!challenger) {
    return err("No active entry for this number. Sign up for the challenge first.", 400);
  }

  await db.challengeCheckin.upsert({
    where: { challengerId_day: { challengerId: challenger.id, day } },
    create: { challengerId: challenger.id, day, postUrl, verified: false },
    // A new link means a new post — reset verification for re-checkin.
    update: { postUrl, verified: false },
  });

  return ok({ day, message: `Day ${day} logged. Keep going — tag @zulfira #Zulfira30DayChallenge.` });
}
