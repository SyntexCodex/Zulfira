export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { ExpenseCategory } from "@prisma/client";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";

const VALID_CATEGORIES = new Set<string>(Object.values(ExpenseCategory));

type Ctx = { params: Promise<{ id: string }> };

const serialize = (e: { amount: unknown; [k: string]: unknown }) => ({
  ...e,
  amount: Number(e.amount),
});

export async function PUT(req: NextRequest, { params }: Ctx) {
  const db = getDb();
  if (!db) return dbRequired();
  const { id } = await params;
  const expense = await db.expense.findUnique({ where: { id } });
  if (!expense) return err("Expense not found", 404);

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

  const data: Record<string, unknown> = {};
  if (body.category !== undefined) {
    const category = String(body.category).toUpperCase();
    if (!VALID_CATEGORIES.has(category)) return err("Invalid category", 400);
    data.category = category as ExpenseCategory;
  }
  if (body.productId !== undefined) {
    const productId = body.productId ? String(body.productId) : null;
    if (productId) {
      const product = await db.product.findUnique({ where: { id: productId } });
      if (!product) return err("Product not found", 404);
    }
    data.productId = productId;
  }
  if (body.amount !== undefined) {
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0)
      return err("amount must be a positive number", 400);
    data.amount = amount;
  }
  if (body.date !== undefined) {
    const d = new Date(String(body.date));
    if (isNaN(d.getTime())) return err("Invalid date", 400);
    data.date = d;
  }
  if (body.note !== undefined)
    data.note = body.note ? String(body.note).trim() : null;
  if (body.receiptUrl !== undefined)
    data.receiptUrl = body.receiptUrl ? String(body.receiptUrl).trim() : null;

  const updated = await db.expense.update({
    where: { id },
    data,
    include: { product: { select: { id: true, name: true, slug: true } } },
  });
  return ok(serialize(updated));
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const db = getDb();
  if (!db) return dbRequired();
  const { id } = await params;
  const expense = await db.expense.findUnique({ where: { id } });
  if (!expense) return err("Expense not found", 404);
  await db.expense.delete({ where: { id } });
  return ok({ deleted: true });
}
