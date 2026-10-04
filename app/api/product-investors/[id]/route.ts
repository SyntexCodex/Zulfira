export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

const serialize = (l: {
  profitSharePct: unknown;
  [k: string]: unknown;
}) => ({ ...l, profitSharePct: Number(l.profitSharePct) });

export async function PUT(req: NextRequest, { params }: Ctx) {
  const db = getDb();
  if (!db) return dbRequired();
  const { id } = await params;

  const link = await db.productInvestor.findUnique({ where: { id } });
  if (!link) return err("Profit-share link not found", 404);

  let body: { profitSharePct?: number };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }
  const pct = Number(body.profitSharePct);
  if (!Number.isFinite(pct) || pct < 0 || pct > 100)
    return err("profitSharePct must be between 0 and 100", 400);

  // Revalidate the 100% rule with the updated value in place.
  const others = await db.productInvestor.findMany({
    where: { productId: link.productId, NOT: { id } },
  });
  const sum = others.reduce((s, l) => s + Number(l.profitSharePct), 0) + pct;
  if (Math.abs(sum - 100) > 0.01) {
    return err(
      `Profit shares for this product must total 100% (would be ${sum.toFixed(2)}%)`,
      400
    );
  }

  const updated = await db.productInvestor.update({
    where: { id },
    data: { profitSharePct: pct },
    include: {
      product: { select: { id: true, name: true, slug: true } },
      investor: { select: { id: true, name: true } },
    },
  });
  return ok(serialize(updated));
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const db = getDb();
  if (!db) return dbRequired();
  const { id } = await params;
  const link = await db.productInvestor.findUnique({ where: { id } });
  if (!link) return err("Profit-share link not found", 404);
  await db.productInvestor.delete({ where: { id } });
  return ok({ deleted: true });
}
