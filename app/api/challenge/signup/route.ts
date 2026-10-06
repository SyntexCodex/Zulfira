export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { programEnabled, normPhone } from "@/lib/discounts";
import { notifyChallenge } from "@/lib/email";

// PUBLIC — sign up for the open challenge round.
export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const { enabled, config } = await programEnabled(db, "challenge_30");
  if (!enabled) return err("The 30-day challenge is not open right now.", 403);

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    phone?: string;
    handle?: string;
    orderNo?: string;
    email?: string;
  };
  const name = (body.name ?? "").trim();
  const handle = (body.handle ?? "").trim();
  const orderNo = (body.orderNo ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  if (!name || !body.phone || !handle || !orderNo) {
    return err("Name, phone, handle and order number are all required.", 400);
  }
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return err("That email address doesn't look right.", 400);
  }

  const round = await db.challengeRound.findFirst({
    where: { status: "open" },
    orderBy: { createdAt: "desc" },
  });
  if (!round) return err("No open round right now — check back soon.", 400);

  const order = await db.order.findUnique({ where: { orderNo } });
  if (!order || order.status === "CANCELLED") {
    return err("We couldn't find that order. Check your order number and try again.", 400);
  }

  const challengerCount = await db.challenger.count({ where: { roundId: round.id } });
  const max = Number(config.maxChallengers ?? 200);
  if (challengerCount >= max) {
    return err("Round is full — you're on the waitlist", 409);
  }

  const challenger = await db.challenger.create({
    data: {
      roundId: round.id,
      name,
      phone: normPhone(body.phone),
      email: email || null,
      handle,
      orderNo,
      status: "active",
    },
  });

  // Signup confirmation email (fire-and-forget).
  notifyChallenge(db, {
    email: email || undefined,
    name: name.split(" ")[0],
    kind: "signup",
  }).catch(() => {});

  return ok({
    challengerId: challenger.id,
    message: `You're in, ${name.split(" ")[0]}! Post Day 1 and tag @zulfira #Zulfira30DayChallenge.`,
  });
}
