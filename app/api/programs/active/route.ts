export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, dbRequired } from "@/lib/api";
import { programEnabled } from "@/lib/discounts";
import { PROGRAM_KEYS, promoWithOverrides, type ProgramPromo } from "@/lib/programs";

// PUBLIC — loyalty programs currently enabled in admin, with promo copy.
// Promo text comes from each program's DB config (editable in
// /admin/loyalty); missing values fall back to lib/programs.ts defaults.
export async function GET(_req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const active: ProgramPromo[] = [];
  for (const key of PROGRAM_KEYS) {
    const { enabled, config } = await programEnabled(db, key);
    if (!enabled) continue;
    const promo = promoWithOverrides(key, config as Record<string, unknown>);
    if (promo) active.push(promo);
  }
  return ok({ programs: active });
}
