export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { validateDiscountCode } from "@/lib/discounts";

// PUBLIC — validate a discount code for a checkout subtotal.
export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();

  let body: { code?: unknown; subtotal?: unknown; phone?: unknown };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }

  const result = await validateDiscountCode(db, {
    code: String(body.code ?? ""),
    subtotal: Number(body.subtotal) || 0,
    phone: body.phone ? String(body.phone) : undefined,
  });
  if (!result.ok) return err(result.error ?? "Invalid discount code", 400);
  return ok(result);
}
