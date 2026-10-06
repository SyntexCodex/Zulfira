export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, dbRequired } from "@/lib/api";
import { programEnabled } from "@/lib/discounts";

// PUBLIC — enabled flags for the loyalty programs the storefront renders.
const STOREFRONT_PROGRAMS = [
  "subscribe_save",
  "challenge_30",
  "gift_trial",
  "equity_1pct",
] as const;

export async function GET(_req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const out: Record<string, boolean> = {};
  for (const key of STOREFRONT_PROGRAMS) {
    out[key] = (await programEnabled(db, key)).enabled;
  }
  return ok(out);
}
