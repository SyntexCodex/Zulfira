export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";

// ADMIN — verify / unverify a challenge checkin.
export async function PUT(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  if (!(await getSessionFromRequest(req))) return err("Unauthorized", 401);

  const body = (await req.json().catch(() => ({}))) as { id?: string; verified?: boolean };
  if (!body.id || typeof body.verified !== "boolean") {
    return err("Checkin id and verified (true | false) are required.", 400);
  }
  const checkin = await db.challengeCheckin.update({
    where: { id: body.id },
    data: { verified: body.verified },
  });
  return ok({ checkin });
}
