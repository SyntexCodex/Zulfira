export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { programEnabled } from "@/lib/discounts";

export async function GET(_req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();

  try {
    const { enabled, config } = await programEnabled(db, "equity_1pct");
    const name = String(config.name ?? "1% Equity (1-Year)");
    const slotPct = Number(config.slotPct ?? 1);
    const totalSlots = Number(config.totalSlots ?? 20);
    const pricePerSlot = Number(config.pricePerSlot ?? 50000);
    const termMonths = Number(config.termMonths ?? 12);

    const agg = await db.equityOwner.aggregate({
      _sum: { slots: true },
      where: { status: { in: ["approved", "active"] } },
    });
    const slotsTaken = agg._sum.slots ?? 0;

    return ok({
      enabled,
      name,
      slotPct,
      totalSlots,
      pricePerSlot,
      termMonths,
      slotsTaken,
      slotsRemaining: Math.max(0, totalSlots - slotsTaken),
    });
  } catch (e) {
    return err(`Failed to load equity info: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}
