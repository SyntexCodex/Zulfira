export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";

export async function GET(_req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const investors = await db.investor.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      productLinks: {
        include: { product: { select: { id: true, name: true, slug: true } } },
      },
    },
  });
  return ok(
    investors.map((inv) => ({
      ...inv,
      productLinks: inv.productLinks.map((l) => ({
        ...l,
        profitSharePct: Number(l.profitSharePct),
      })),
    }))
  );
}

export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();

  let body: { name?: string; phone?: string; email?: string; notes?: string };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }
  const name = String(body.name ?? "").trim();
  if (!name) return err("name is required", 400);

  const investor = await db.investor.create({
    data: {
      name,
      phone: body.phone ? String(body.phone).trim() : null,
      email: body.email ? String(body.email).trim().toLowerCase() : null,
      notes: body.notes ? String(body.notes).trim() : null,
    },
  });
  return ok(investor, 201);
}
