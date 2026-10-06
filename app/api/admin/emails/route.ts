export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";

// ADMIN — email send log + unsubscribe list.
// GET /api/admin/emails?status=sent|skipped|failed&q=...&take=50
export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  if (!(await getSessionFromRequest(req))) return err("Unauthorized", 401);

  const sp = req.nextUrl.searchParams;
  const status = (sp.get("status") ?? "").trim();
  const q = (sp.get("q") ?? "").trim();
  const take = Math.min(Math.max(Number(sp.get("take")) || 50, 1), 200);

  const where: Record<string, unknown> = {};
  if (["sent", "skipped", "failed"].includes(status)) where.status = status;
  if (q) {
    where.OR = [
      { to: { contains: q, mode: "insensitive" } },
      { subject: { contains: q, mode: "insensitive" } },
      { template: { contains: q, mode: "insensitive" } },
    ];
  }

  const [logs, countsRaw, unsubscribed] = await Promise.all([
    db.emailLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      select: { id: true, to: true, subject: true, template: true, status: true, error: true, createdAt: true },
    }),
    db.emailLog.groupBy({ by: ["status"], _count: { status: true } }),
    db.emailPreference.findMany({
      where: { unsubscribed: true },
      orderBy: { updatedAt: "desc" },
      take: 200,
      select: { email: true, updatedAt: true },
    }),
  ]);

  const counts: Record<string, number> = { sent: 0, skipped: 0, failed: 0 };
  for (const c of countsRaw) counts[c.status] = c._count.status;

  return ok({ logs, counts, unsubscribed });
}
