export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";

async function requireAdmin(req: NextRequest) {
  if (!(await getSessionFromRequest(req))) return err("Unauthorized", 401);
  return null;
}

// ADMIN — list subscriptions with product names, soonest refill first.
export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const status = req.nextUrl.searchParams.get("status")?.trim(); // active | paused | cancelled
  const subscriptions = await db.subscription.findMany({
    where: status ? { status } : {},
    orderBy: { nextShipDate: "asc" },
    take: 200,
    include: { product: { select: { name: true, slug: true, salePrice: true } } },
  });
  return ok({ subscriptions });
}

// ADMIN — change a subscription's status (active | paused | cancelled).
export async function PUT(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const denied = await requireAdmin(req);
  if (denied) return denied;

  let body: { id?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }
  const id = String(body.id ?? "").trim();
  const status = String(body.status ?? "").trim().toLowerCase();
  if (!id) return err("Subscription id is required", 400);
  if (!["active", "paused", "cancelled"].includes(status))
    return err("status must be active, paused or cancelled", 400);

  const subscription = await db.subscription.update({
    where: { id },
    data: { status },
  });
  return ok({ id: subscription.id, status: subscription.status });
}
