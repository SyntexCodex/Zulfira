export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";

// ADMIN — list challengers for a round, with checkin counts + checkin details.
export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  if (!(await getSessionFromRequest(req))) return err("Unauthorized", 401);

  const roundId = req.nextUrl.searchParams.get("roundId");
  if (!roundId) return err("roundId is required.", 400);

  const challengers = await db.challenger.findMany({
    where: { roundId },
    orderBy: { joinedAt: "desc" },
    take: 500,
    include: {
      checkins: {
        orderBy: { day: "asc" },
        select: { id: true, day: true, postUrl: true, verified: true, createdAt: true },
      },
    },
  });

  const rows = challengers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    handle: c.handle,
    orderNo: c.orderNo,
    strikes: c.strikes,
    status: c.status,
    joinedAt: c.joinedAt.toISOString(),
    totalCheckins: c.checkins.length,
    verifiedCheckins: c.checkins.filter((k) => k.verified).length,
    checkins: c.checkins,
  }));

  return ok({ challengers: rows });
}
