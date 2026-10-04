export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { ExpenseCategory } from "@prisma/client";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";

const VALID_CATEGORIES = new Set<string>(Object.values(ExpenseCategory));

const serialize = (e: { amount: unknown; [k: string]: unknown }) => ({
  ...e,
  amount: Number(e.amount),
});

function dateFilter(from: string | null, to: string | null) {
  const date: Record<string, Date> = {};
  if (from) {
    const d = new Date(from);
    if (!isNaN(d.getTime())) date.gte = d;
  }
  if (to) {
    const d = new Date(to);
    if (!isNaN(d.getTime())) date.lte = d;
  }
  return Object.keys(date).length > 0 ? date : undefined;
}

export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const sp = req.nextUrl.searchParams;
  const category = sp.get("category");
  const productId = sp.get("productId"); // or "general" for product-less expenses

  if (category && !VALID_CATEGORIES.has(category))
    return err("Invalid category", 400);

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (productId === "general") where.productId = null;
  else if (productId) where.productId = productId;
  const df = dateFilter(sp.get("from"), sp.get("to"));
  if (df) where.date = df;

  const expenses = await db.expense.findMany({
    where,
    orderBy: { date: "desc" },
    include: { product: { select: { id: true, name: true, slug: true } } },
  });
  return ok(expenses.map(serialize));
}

export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const session = await getSessionFromRequest(req);

  let body: {
    category?: string;
    productId?: string | null;
    amount?: number;
    date?: string;
    note?: string;
    receiptUrl?: string;
  };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }
  const category = String(body.category ?? "").toUpperCase();
  if (!VALID_CATEGORIES.has(category)) return err("Invalid category", 400);
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0)
    return err("amount must be a positive number", 400);

  const productId = body.productId ? String(body.productId) : null;
  if (productId) {
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) return err("Product not found", 404);
  }

  let date: Date | undefined;
  if (body.date) {
    const d = new Date(body.date);
    if (isNaN(d.getTime())) return err("Invalid date", 400);
    date = d;
  }

  const expense = await db.expense.create({
    data: {
      category: category as ExpenseCategory,
      productId,
      amount,
      date,
      note: body.note ? String(body.note).trim() : null,
      receiptUrl: body.receiptUrl ? String(body.receiptUrl).trim() : null,
      createdBy: session?.email ?? null,
    },
    include: { product: { select: { id: true, name: true, slug: true } } },
  });
  return ok(serialize(expense), 201);
}
