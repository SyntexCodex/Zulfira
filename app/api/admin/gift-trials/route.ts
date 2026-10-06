export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";

const STATUSES = ["pending", "shipped", "delivered", "ordered"] as const;

// ADMIN — list gift-a-trial nominations (newest first).
export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  if (!(await getSessionFromRequest(req))) return err("Unauthorized", 401);

  const trials = await db.giftTrial.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return ok({ trials });
}

// ADMIN — advance a trial through the pending → shipped → delivered workflow.
export async function PUT(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  if (!(await getSessionFromRequest(req))) return err("Unauthorized", 401);

  const body = (await req.json().catch(() => ({}))) as { id?: string; status?: string };
  if (!body.id || !STATUSES.includes(body.status as (typeof STATUSES)[number])) {
    return err("Valid id and status (pending | shipped | delivered | ordered) are required.", 400);
  }
  const trial = await db.giftTrial.update({
    where: { id: body.id },
    data: { status: body.status as string },
  });
  return ok({ trial });
}
