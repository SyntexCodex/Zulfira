export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, dbRequired } from "@/lib/api";
import { programEnabled } from "@/lib/discounts";
import { PROGRAM_PROMOS, PROGRAM_KEYS, type ProgramPromo } from "@/lib/programs";

// PUBLIC — loyalty programs currently enabled in admin, with the promo
// content the site-wide banner renders. Cached client-side for 5 minutes.
export async function GET(_req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const active: ProgramPromo[] = [];
  for (const key of PROGRAM_KEYS) {
    const { enabled } = await programEnabled(db, key);
    if (enabled && PROGRAM_PROMOS[key]) active.push(PROGRAM_PROMOS[key]);
  }
  return ok({ programs: active });
}
