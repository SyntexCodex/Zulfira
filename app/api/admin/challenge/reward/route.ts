export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";
import { programEnabled, normPhone, issueProgramCode } from "@/lib/discounts";
import { notifyChallenge } from "@/lib/email";

async function requireAdmin(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return err("Unauthorized", 401);
  return null;
}

// ADMIN — reward a 30-day challenge finisher with their free-bundle code.
// POST { phone, name?, email? } → issues unique one-time BUNDLE-XXXX
// (Rs 1,700 fixed = free Complete Ritual Bundle) and emails it.
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const db = getDb();
  if (!db) return dbRequired();
  const { enabled } = await programEnabled(db, "challenge_30");
  if (!enabled) return err("The challenge program is not enabled.", 403);

  let body: { phone?: unknown; name?: unknown; email?: unknown };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }
  const phone = normPhone(String(body.phone ?? ""));
  const name = String(body.name ?? "").trim().slice(0, 80);
  const email = String(body.email ?? "").trim().toLowerCase();
  if (phone.length < 10) return err("A valid phone number is required.", 400);

  const { code } = await issueProgramCode(db, "challenge", { phone });

  let emailed = false;
  if (email) {
    const r = await notifyChallenge(db, { email, name: name || "Champion", kind: "completed", code });
    emailed = r.sent;
  }

  return ok({ code, emailed, value: 1700 });
}
