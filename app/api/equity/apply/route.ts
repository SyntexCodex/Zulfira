export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { programEnabled } from "@/lib/discounts";
import { notifyEquity } from "@/lib/email";

const normPhone = (p: string) => {
  let d = String(p || "").replace(/\D/g, "");
  if (d.startsWith("0")) d = "92" + d.slice(1);
  if (!d.startsWith("92")) d = "92" + d;
  return d;
};

export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();

  let body: {
    name?: string;
    phone?: string;
    email?: string;
    cnic?: string;
    slots?: number;
    whyText?: string;
  };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }

  try {
    const { enabled, config } = await programEnabled(db, "equity_1pct");
    if (!enabled) return err("The 1% Equity program is not open right now.", 403);

    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const emailRaw = String(body.email ?? "").trim();
    const cnic = String(body.cnic ?? "").trim();
    const slots = Number(body.slots);
    const whyText = String(body.whyText ?? "").trim();

    if (!name) return err("Name is required", 400);
    if (!phone || phone.replace(/\D/g, "").length < 10)
      return err("A valid phone number is required", 400);
    if (emailRaw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw))
      return err("Please enter a valid email address", 400);
    if (!Number.isInteger(slots) || slots < 1)
      return err("Slots must be a whole number of 1 or more", 400);
    if (!whyText) return err("Please tell us why you want to join", 400);

    const totalSlots = Number(config.totalSlots ?? 20);
    const agg = await db.equityOwner.aggregate({
      _sum: { slots: true },
      where: { status: { in: ["approved", "active"] } },
    });
    const slotsTaken = agg._sum.slots ?? 0;
    if (slotsTaken + slots > totalSlots)
      return err(`Only ${totalSlots - slotsTaken} slot(s) remaining`, 409);

    const owner = await db.equityOwner.create({
      data: {
        name,
        phone: normPhone(phone),
        email: emailRaw || null,
        // No dedicated field for the applicant's "why" text (schema owned by
        // another worker), so it is stored after the CNIC with a separator.
        cnic: cnic ? `${cnic} || WHY: ${whyText}` : `WHY: ${whyText}`,
        slots,
        amountPaid: 0,
        status: "applied",
      },
    });

    // Application received email (fire-and-forget).
    notifyEquity(db, {
      email: emailRaw || undefined,
      name: name.trim().split(/\s+/)[0],
      kind: "applied",
      slots,
    }).catch(() => {});

    return ok({ id: owner.id, status: owner.status }, 201);
  } catch (e) {
    return err(`Failed to submit application: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}
