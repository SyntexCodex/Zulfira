export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { programEnabled, issueProgramCode } from "@/lib/discounts";
import { notifyWelcomeCode, fmtPkt } from "@/lib/email";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// PUBLIC — claim a unique one-time 20% welcome code by email.
// Rate-limited by email: one code per email address.
export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();

  let body: { email?: unknown; name?: unknown; phone?: unknown };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const name = String(body.name ?? "").trim().slice(0, 80);
  const phone = String(body.phone ?? "").trim();
  if (!emailRe.test(email)) return err("Please enter a valid email address.", 400);

  const { enabled } = await programEnabled(db, "inbox_upsell");
  if (!enabled) return err("The welcome gift is not available right now.", 403);

  // One code per email — check EmailLog (sendEmail logs every attempt).
  const recentLog = await db.emailLog.findFirst({
    where: { template: "welcome-code", to: email, status: "sent" },
    orderBy: { createdAt: "desc" },
  });
  if (recentLog) {
    return err("A welcome code was already sent to this email address.", 409);
  }

  const { code, spec } = await issueProgramCode(db, "welcome", { phone: phone || undefined });
  const expiryDate = fmtPkt(new Date(Date.now() + spec.expiryDays * 24 * 60 * 60 * 1000));

  const sent = await notifyWelcomeCode(db, { email, name, code, expiryDate });

  if (!sent.sent) return err("We couldn't send the email. Please try again.", 500);
  return ok({ code, expiryDate });
}
