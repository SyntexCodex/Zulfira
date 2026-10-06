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

// ADMIN — list challenge rounds (newest first, with challenger counts).
export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const rounds = await db.challengeRound.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { challengers: true } } },
    take: 50,
  });
  return ok({ rounds });
}

// ADMIN — create a challenge round.
export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    startDate?: string;
    endDate?: string;
    maxChallengers?: number;
  };
  const name = (body.name ?? "").trim();
  const startDate = body.startDate ? new Date(body.startDate) : null;
  const endDate = body.endDate ? new Date(body.endDate) : null;
  if (!name || !startDate || Number.isNaN(startDate.getTime()) || !endDate || Number.isNaN(endDate.getTime())) {
    return err("Name, start date and end date are required.", 400);
  }
  if (endDate <= startDate) return err("End date must be after the start date.", 400);

  const round = await db.challengeRound.create({
    data: {
      name,
      startDate,
      endDate,
      maxChallengers: Math.max(1, Math.floor(Number(body.maxChallengers) || 200)),
      status: "open",
    },
  });
  return ok({ round });
}

// ADMIN — change a round's status (open | running | ended).
export async function PUT(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as { id?: string; status?: string };
  if (!body.id || !["open", "running", "ended"].includes(body.status ?? "")) {
    return err("Valid id and status (open | running | ended) are required.", 400);
  }
  const round = await db.challengeRound.update({
    where: { id: body.id },
    data: { status: body.status },
  });
  return ok({ round });
}
