export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";

async function requireAdmin(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return err("Unauthorized", 401);
  return null;
}

const select = {
  key: true,
  name: true,
  enabled: true,
  config: true,
  updatedAt: true,
};

// ADMIN — list all loyalty programs, A→Z.
export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const programs = await db.loyaltyProgram.findMany({
    orderBy: { name: "asc" },
    select,
  });
  return ok({ programs });
}

// ADMIN — flip the master switch and/or update the program config.
export async function PUT(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const denied = await requireAdmin(req);
  if (denied) return denied;

  let body: { key?: unknown; enabled?: unknown; config?: unknown };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }

  const key = String(body.key ?? "").trim();
  if (!key) return err("Program key is required", 400);

  const data: Record<string, unknown> = {};
  if (typeof body.enabled === "boolean") data.enabled = body.enabled;
  if (body.config !== undefined && body.config !== null) {
    if (typeof body.config !== "object" || Array.isArray(body.config))
      return err("config must be a JSON object", 400);
    data.config = body.config;
  }
  if (Object.keys(data).length === 0)
    return err("Nothing to update (pass enabled and/or config)", 400);

  const existing = await db.loyaltyProgram.findUnique({ where: { key } });
  if (!existing) return err(`Unknown loyalty program: ${key}`, 404);

  const updated = await db.loyaltyProgram.update({
    where: { key },
    data,
    select,
  });
  return ok({ program: updated });
}
