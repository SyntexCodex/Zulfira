export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";
import { generateCode, createDiscountCode, programEnabled } from "@/lib/discounts";
import { notifyReviewReward } from "@/lib/email";

const normPhone = (p: string) => {
  let d = String(p || "").replace(/\D/g, "");
  if (d.startsWith("0")) d = "92" + d.slice(1);
  if (!d.startsWith("92")) d = "92" + d;
  return d;
};

const money = (n: number) => `Rs ${Math.round(n).toLocaleString("en-PK")}`;

// ADMIN — issue the review-rewards discount code for an APPROVED review.
// Idempotent: re-calling for the same review+customer on the same day returns
// the code that was already created instead of minting a new one.
export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  if (!(await getSessionFromRequest(req))) return err("Unauthorized", 401);

  let body: { reviewId?: string };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }
  const reviewId = String(body.reviewId ?? "").trim();
  if (!reviewId) return err("reviewId is required", 400);

  const review = await db.review.findUnique({ where: { id: reviewId } });
  if (!review) return err("Review not found", 404);
  if (!review.isApproved) return err("Review must be approved first", 400);

  // Review carries orderId but no relation — fetch the order for the phone.
  const order = review.orderId
    ? await db.order.findUnique({
        where: { id: review.orderId },
        select: { phone: true, customerName: true, email: true },
      })
    : null;

  const { enabled, config } = await programEnabled(db, "review_rewards");
  if (!enabled) return ok({ rewarded: false, reason: "program_disabled" });

  const photoReward = Number(config.photoReward ?? 75);
  const videoReward = Number(config.videoReward ?? 150);
  const minOrder = Number(config.minOrder ?? 500);
  const expiryDays = Number(config.expiryDays ?? 60);
  const value = review.videoUrl ? videoReward : photoReward;

  const rawPhone = order?.phone ?? "";
  const phone = rawPhone ? normPhone(rawPhone) : null;
  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);

  // Idempotency: same program + same customer phone + same value, created
  // today → return the existing code instead of creating a duplicate.
  const existing = await db.discountCode.findFirst({
    where: {
      programKey: "review_rewards",
      phone,
      value,
      createdAt: { gte: dayStart },
    },
    select: { code: true, value: true },
  });
  if (existing) {
    return ok({
      rewarded: true,
      code: existing.code,
      value: Number(existing.value),
      existing: true,
      waLink: phone ? buildWaLink(phone, review, existing.code, Number(existing.value), minOrder, expiryDays) : null,
    });
  }

  const expiresAt = new Date(Date.now() + expiryDays * 24 * 3_600_000);
  const { code } = await createDiscountCode(db, {
    code: generateCode("REVIEW"),
    kind: "fixed",
    value,
    minOrder,
    maxUses: 1,
    programKey: "review_rewards",
    phone: rawPhone || undefined,
    expiresAt,
  });

  // Reward email (fire-and-forget; skipped silently without an address).
  notifyReviewReward(db, {
    email: order?.email ?? undefined,
    name: (order?.customerName ?? review.customerName).trim().split(/\s+/)[0],
    code,
    value,
  }).catch(() => {});

  return ok({
    rewarded: true,
    code,
    value,
    waLink: phone ? buildWaLink(phone, review, code, value, minOrder, expiryDays) : null,
  });
}

function buildWaLink(
  phone: string,
  review: { customerName: string; videoUrl: string | null },
  code: string,
  value: number,
  minOrder: number,
  expiryDays: number
): string {
  const firstName = review.customerName.trim().split(/\s+/)[0];
  const msg =
    `Hi ${firstName}! Thank you for reviewing Zulfira — ` +
    (review.videoUrl
      ? `your video review earned you ${money(value)} off 🎉`
      : `your review earned you ${money(value)} off 🎉`) +
    `\nYour code: ${code} (min. order ${money(minOrder)}, valid ${expiryDays} days).` +
    `\nOrder here: https://zulfira.vercel.app`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}
