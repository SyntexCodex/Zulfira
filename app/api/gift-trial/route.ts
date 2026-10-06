export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { programEnabled, normPhone } from "@/lib/discounts";

// PUBLIC — is the gift-a-trial program open?
export async function GET() {
  const db = getDb();
  if (!db) return dbRequired();
  const { enabled, config } = await programEnabled(db, "gift_trial");
  return ok({
    enabled,
    friendDiscountPct: Number(config.friendDiscountPct ?? 15),
    senderCredit: Number(config.senderCredit ?? 200),
  });
}

// PUBLIC — nominate a friend for a free 100ml trial bottle.
export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const { enabled, config } = await programEnabled(db, "gift_trial");
  if (!enabled) return err("The gift-a-trial program is not open right now.", 403);

  const body = (await req.json().catch(() => ({}))) as {
    senderName?: string;
    senderPhone?: string;
    senderEmail?: string;
    friendName?: string;
    friendPhone?: string;
    friendEmail?: string;
    friendAddress?: string;
    friendCity?: string;
  };
  const senderName = (body.senderName ?? "").trim();
  const friendName = (body.friendName ?? "").trim();
  const friendAddress = (body.friendAddress ?? "").trim();
  const friendCity = (body.friendCity ?? "").trim();
  const senderEmail = (body.senderEmail ?? "").trim().toLowerCase();
  const friendEmail = (body.friendEmail ?? "").trim().toLowerCase();
  if (!senderName || !body.senderPhone || !friendName || !body.friendPhone || !friendAddress || !friendCity) {
    return err("All fields are required.", 400);
  }
  const emailRe = /^\S+@\S+\.\S+$/;
  if ((senderEmail && !emailRe.test(senderEmail)) || (friendEmail && !emailRe.test(friendEmail))) {
    return err("One of the email addresses doesn't look right.", 400);
  }

  const senderPhone = normPhone(body.senderPhone);
  const friendPhone = normPhone(body.friendPhone);
  if (senderPhone.length < 10 || friendPhone.length < 10) {
    return err("Please enter valid mobile numbers.", 400);
  }
  if (senderPhone === friendPhone) {
    return err("Your friend's number must be different from your own.", 400);
  }

  // New customers only — the friend must not have ordered before.
  const priorOrder = await db.order.findFirst({
    where: { OR: [{ phone: friendPhone }, { phone: body.friendPhone }] },
    select: { id: true },
  });
  if (priorOrder) {
    return err("This gift is for new customers — that number has already ordered from Zulfira.", 400);
  }

  const trial = await db.giftTrial.create({
    data: {
      senderName,
      senderPhone,
      senderEmail: senderEmail || null,
      friendName,
      friendPhone,
      friendEmail: friendEmail || null,
      friendAddress,
      friendCity,
      status: "pending",
    },
  });

  // Ensure the shared friend code exists.
  const pct = Number(config.friendDiscountPct ?? 15);
  await db.discountCode.upsert({
    where: { code: "FRIEND15" },
    create: {
      code: "FRIEND15",
      kind: "percent",
      value: pct,
      maxUses: 10000,
      programKey: "gift_trial",
      isActive: true,
    },
    update: { kind: "percent", value: pct, maxUses: 10000, programKey: "gift_trial", isActive: true },
  });

  return ok({
    trialId: trial.id,
    message: `Thank you, ${senderName.split(" ")[0]}! We'll send a free trial bottle to ${friendName} soon. They get ${pct}% off their first order with code FRIEND15.`,
  });
}
