export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";

function displayName(full: string): string {
  const parts = String(full || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Founder";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export async function GET(_req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();

  try {
    const owners = await db.equityOwner.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "asc" },
      select: { name: true, slots: true },
    });
    return ok(
      owners.map((o) => ({ name: displayName(o.name), slots: o.slots }))
    );
  } catch (e) {
    return err(`Failed to load owners: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}
