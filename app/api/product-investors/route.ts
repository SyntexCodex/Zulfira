export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";

type Db = PrismaClient;

/**
 * ALLOCATION RULE: every product's investor profitSharePct values MUST total
 * exactly 100 (within 0.01 rounding). The sum is computed as if the new
 * value were applied (excluding the link being replaced), so validation
 * happens BEFORE any write — no rollback needed.
 */
async function shareSumAfter(
  db: Db,
  productId: string,
  excludeInvestorId: string | null,
  newPct: number
): Promise<number> {
  const links = await db.productInvestor.findMany({ where: { productId } });
  let sum = 0;
  for (const l of links) {
    if (l.investorId === excludeInvestorId) continue;
    sum += Number(l.profitSharePct);
  }
  return sum + newPct;
}

function checkSum(sum: number) {
  if (Math.abs(sum - 100) > 0.01) {
    return err(
      `Profit shares for this product must total 100% (currently ${sum.toFixed(2)}%)`,
      400
    );
  }
  return null;
}

const serialize = (l: {
  profitSharePct: unknown;
  [k: string]: unknown;
}) => ({ ...l, profitSharePct: Number(l.profitSharePct) });

export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const productId = req.nextUrl.searchParams.get("productId");
  const links = await db.productInvestor.findMany({
    where: productId ? { productId } : {},
    include: {
      product: { select: { id: true, name: true, slug: true } },
      investor: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return ok(links.map(serialize));
}

export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();

  let body: { productId?: string; investorId?: string; profitSharePct?: number };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }
  const { productId, investorId } = body;
  const pct = Number(body.profitSharePct);
  if (!productId || !investorId)
    return err("productId and investorId are required", 400);
  if (!Number.isFinite(pct) || pct < 0 || pct > 100)
    return err("profitSharePct must be between 0 and 100", 400);

  const [product, investor] = await Promise.all([
    db.product.findUnique({ where: { id: productId } }),
    db.investor.findUnique({ where: { id: investorId } }),
  ]);
  if (!product) return err("Product not found", 404);
  if (!investor) return err("Investor not found", 404);

  // Upsert replaces the investor's existing link, so exclude it from the sum.
  const sum = await shareSumAfter(db, productId, investorId, pct);
  const sumErr = checkSum(sum);
  if (sumErr) return sumErr;

  const link = await db.productInvestor.upsert({
    where: { productId_investorId: { productId, investorId } },
    update: { profitSharePct: pct },
    create: { productId, investorId, profitSharePct: pct },
    include: {
      product: { select: { id: true, name: true, slug: true } },
      investor: { select: { id: true, name: true } },
    },
  });
  return ok(serialize(link), 201);
}
