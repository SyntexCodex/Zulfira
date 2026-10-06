export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";
import { generateCode, createDiscountCode, programEnabled } from "@/lib/discounts";
import { notifyEquity } from "@/lib/email";

async function requireAdmin(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return err("Unauthorized", 401);
  return null;
}

const COUNTED = ["approved", "active"];

async function slotsTaken(db: NonNullable<ReturnType<typeof getDb>>) {
  const agg = await db.equityOwner.aggregate({
    _sum: { slots: true },
    where: { status: { in: COUNTED } },
  });
  return agg._sum.slots ?? 0;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

// ADMIN — owners list + slot summary.
export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { enabled, config } = await programEnabled(db, "equity_1pct");
    const owners = await db.equityOwner.findMany({
      orderBy: { createdAt: "desc" },
      include: { payouts: { orderBy: { createdAt: "desc" } } },
      take: 200,
    });
    const taken = await slotsTaken(db);
    const totalSlots = Number(config.totalSlots ?? 20);
    return ok({
      enabled,
      config,
      owners,
      summary: {
        slotsTaken: taken,
        slotsRemaining: Math.max(0, totalSlots - taken),
        totalSlots,
      },
    });
  } catch (e) {
    return err(`Failed to load equity data: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}

// ADMIN — approve / reject / activate / end / payout / markPaid.
export async function PUT(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const denied = await requireAdmin(req);
  if (denied) return denied;

  let body: {
    id?: string;
    action?: string;
    amountPaid?: number;
    quarter?: string;
    profit?: number;
    payoutId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }

  const action = String(body.action ?? "");

  try {
    if (action === "markPaid") {
      const payoutId = String(body.payoutId ?? "").trim();
      if (!payoutId) return err("payoutId is required", 400);
      const p = await db.equityPayout.update({
        where: { id: payoutId },
        data: { paidAt: new Date() },
      });
      return ok({ id: p.id, paidAt: p.paidAt });
    }

    const id = String(body.id ?? "").trim();
    if (!id) return err("Owner id is required", 400);
    const owner = await db.equityOwner.findUnique({ where: { id } });
    if (!owner) return err("Owner not found", 404);

    if (action === "approve") {
      const updated = await db.equityOwner.update({
        where: { id },
        data: { status: "approved" },
      });
      return ok({ id: updated.id, status: updated.status });
    }

    if (action === "reject") {
      const updated = await db.equityOwner.update({
        where: { id },
        data: { status: "rejected" },
      });
      return ok({ id: updated.id, status: updated.status });
    }

    if (action === "activate") {
      const amountPaid = Number(body.amountPaid);
      if (!Number.isFinite(amountPaid) || amountPaid < 0)
        return err("amountPaid must be a non-negative number", 400);
      const { config } = await programEnabled(db, "equity_1pct");
      const termMonths = Number(config.termMonths ?? 12);
      const slotPct = Number(config.slotPct ?? 1);

      const start = new Date();
      const end = new Date(start);
      end.setMonth(end.getMonth() + termMonths);

      const updated = await db.equityOwner.update({
        where: { id },
        data: {
          status: "active",
          amountPaid,
          startDate: start,
          endDate: end,
        },
      });

      // Owner perk: lifetime 20% personal discount code.
      const code = await createDiscountCode(db, {
        code: generateCode("OWNER"),
        kind: "percent",
        value: 20,
        programKey: "equity_1pct",
        phone: owner.phone,
      });

      // Activation email (mentions the lawyer-drafted agreement).
      notifyEquity(db, {
        email: owner.email ?? undefined,
        name: owner.name.trim().split(/\s+/)[0],
        kind: "approved",
        slots: owner.slots,
      }).catch(() => {});

      return ok({ id: updated.id, status: updated.status, discountCode: code.code, slotPct });
    }

    if (action === "end") {
      const updated = await db.equityOwner.update({
        where: { id },
        data: { status: "ended" },
      });
      return ok({ id: updated.id, status: updated.status });
    }

    if (action === "payout") {
      const quarter = String(body.quarter ?? "").trim();
      const profit = Number(body.profit);
      if (!quarter) return err("quarter is required (e.g. 2026-Q3)", 400);
      if (!Number.isFinite(profit) || profit <= 0)
        return err("profit must be a positive number", 400);

      const existing = await db.equityPayout.count({ where: { quarter } });
      if (existing > 0)
        return err(`Payouts for ${quarter} have already been created`, 400);

      const { config } = await programEnabled(db, "equity_1pct");
      const slotPct = Number(config.slotPct ?? 1);

      const actives = await db.equityOwner.findMany({
        where: { status: "active" },
      });
      if (actives.length === 0) return err("No active owners to pay", 400);

      const created = await db.$transaction(
        actives.map((o) =>
          db.equityPayout.create({
            data: {
              ownerId: o.id,
              quarter,
              profit,
              payout: round2((profit * o.slots * slotPct) / 100),
            },
          })
        )
      );
      // Quarterly payout statement emails (fire-and-forget).
      for (const o of actives) {
        notifyEquity(db, {
          email: (o as { email?: string | null }).email ?? undefined,
          name: o.name.trim().split(/\s+/)[0],
          kind: "payout",
          slots: o.slots,
          payout: round2((profit * o.slots * slotPct) / 100),
          quarter,
        }).catch(() => {});
      }
      return ok({ quarter, count: created.length }, 201);
    }

    return err(`Unknown action: ${action}`, 400);
  } catch (e) {
    return err(`Failed: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}
