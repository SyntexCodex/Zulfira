export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";

const serialize = (i: { amount: unknown; [k: string]: unknown }) => ({
  ...i,
  amount: Number(i.amount),
});

export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const sp = req.nextUrl.searchParams;
  const productId = sp.get("productId");
  const investorId = sp.get("investorId");
  const where: Record<string, string> = {};
  if (productId) where.productId = productId;
  if (investorId) where.investorId = investorId;

  const investments = await db.investment.findMany({
    where,
    orderBy: { investedAt: "desc" },
    include: {
      product: { select: { id: true, name: true, slug: true } },
      investor: { select: { id: true, name: true } },
    },
  });
  return ok(investments.map(serialize));
}

// Record one investment tranche. Tranches are append-only financial history.
export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();

  let body: {
    productId?: string;
    investorId?: string;
    amount?: number;
    date?: string;
    notes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }
  const { productId, investorId } = body;
  const amount = Number(body.amount);
  if (!productId || !investorId)
    return err("productId and investorId are required", 400);
  if (!Number.isFinite(amount) || amount <= 0)
    return err("amount must be a positive number", 400);

  const [product, investor] = await Promise.all([
    db.product.findUnique({ where: { id: productId } }),
    db.investor.findUnique({ where: { id: investorId } }),
  ]);
  if (!product) return err("Product not found", 404);
  if (!investor) return err("Investor not found", 404);

  let investedAt: Date | undefined;
  if (body.date) {
    const d = new Date(body.date);
    if (isNaN(d.getTime())) return err("Invalid date", 400);
    investedAt = d;
  }

  const investment = await db.investment.create({
    data: {
      productId,
      investorId,
      amount,
      investedAt,
      notes: body.notes ? String(body.notes).trim() : null,
    },
    include: {
      product: { select: { id: true, name: true, slug: true } },
      investor: { select: { id: true, name: true } },
    },
  });
  return ok(serialize(investment), 201);
}
