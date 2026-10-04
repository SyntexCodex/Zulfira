export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { computeProductPnl, computeGlobalPnl } from "@/lib/pnl";

const DAY = 86_400_000;
const MAX_RANGE_DAYS = 90;

function parseDate(v: string | null): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d;
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const sp = req.nextUrl.searchParams;
  const productId = sp.get("productId") || undefined;

  if (productId) {
    const exists = await db.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!exists) return err("Product not found", 404);
  }

  const now = new Date();
  let to = parseDate(sp.get("to")) ?? now;
  let from = parseDate(sp.get("from")) ?? new Date(to.getTime() - 30 * DAY);
  if (from > to) [from, to] = [to, from];
  // Cap the range so the daily series stays cheap.
  if (to.getTime() - from.getTime() > MAX_RANGE_DAYS * DAY) {
    from = new Date(to.getTime() - MAX_RANGE_DAYS * DAY);
  }

  const range = { gte: from, lte: to };
  const productClause = productId ? { productId } : {};
  const orderProductClause = productId ? { items: { some: { productId } } } : {};

  // P&L is the single source of truth for revenue/collected/expenses/net.
  let revenue = 0,
    collected = 0,
    expenses = 0,
    invested = 0,
    net = 0;
  if (productId) {
    const p = await computeProductPnl(productId, { from, to });
    if (p) {
      revenue = p.revenue;
      collected = p.collected;
      expenses = p.expensesTotal;
      invested = p.invested;
      net = p.net;
    }
  } else {
    const g = await computeGlobalPnl({ from, to });
    if (g) {
      revenue = g.totals.revenue;
      collected = g.totals.collected;
      expenses = g.totals.expenses;
      invested = g.totals.invested;
      net = g.totals.net;
    }
  }

  const deliveredOrders = await db.order.count({
    where: { status: "DELIVERED", createdAt: range, ...orderProductClause },
  });

  const pipelineItems = await db.orderItem.findMany({
    where: {
      ...productClause,
      order: {
        status: { in: ["PENDING", "CONFIRMED", "SHIPPED"] },
        createdAt: range,
      },
    },
    select: { qty: true, unitPrice: true },
  });
  const pipelineValue = pipelineItems.reduce(
    (s, it) => s + Number(it.unitPrice) * it.qty,
    0
  );

  const visitors = await db.pageView.count({ where: { createdAt: range } });

  const lowStockRows = await db.product.findMany({
    where: productId ? { id: productId } : { isActive: true },
    select: { id: true, name: true, stockQty: true, lowStockLevel: true },
    orderBy: { stockQty: "asc" },
    take: 50,
  });
  const lowStock = lowStockRows
    .filter((p) => p.stockQty <= p.lowStockLevel)
    .slice(0, 10)
    .map((p) => ({ id: p.id, name: p.name, stockQty: p.stockQty }));

  // Daily series bucketed in JS from range-scoped rows.
  const days: string[] = [];
  for (let t = new Date(from); t <= to; t = new Date(t.getTime() + DAY)) {
    days.push(dayKey(t));
  }
  const revenueByDay = new Map<string, number>();
  const expenseByDay = new Map<string, number>();
  const viewsByDay = new Map<string, number>();

  const deliveredItems = await db.orderItem.findMany({
    where: {
      ...productClause,
      order: { status: "DELIVERED", createdAt: range },
    },
    select: {
      qty: true,
      unitPrice: true,
      order: { select: { createdAt: true } },
    },
  });
  for (const it of deliveredItems) {
    const k = dayKey(it.order.createdAt);
    revenueByDay.set(k, (revenueByDay.get(k) ?? 0) + Number(it.unitPrice) * it.qty);
  }

  const expenseRows = await db.expense.findMany({
    where: { ...productClause, date: range },
    select: { amount: true, date: true },
  });
  for (const e of expenseRows) {
    const k = dayKey(e.date);
    expenseByDay.set(k, (expenseByDay.get(k) ?? 0) + Number(e.amount));
  }

  const viewRows = await db.pageView.findMany({
    where: { createdAt: range },
    select: { createdAt: true },
  });
  for (const v of viewRows) {
    const k = dayKey(v.createdAt);
    viewsByDay.set(k, (viewsByDay.get(k) ?? 0) + 1);
  }

  const daily = days.map((date) => ({
    date,
    revenue: revenueByDay.get(date) ?? 0,
    expenses: expenseByDay.get(date) ?? 0,
  }));
  const visitorSeries = days.map((date) => ({
    date,
    views: viewsByDay.get(date) ?? 0,
  }));

  const productRows = await db.product.findMany({
    where: productId ? { id: productId } : { isActive: true },
    select: { id: true, name: true },
  });
  const profitByProduct: {
    id: string;
    name: string;
    net: number;
    revenue: number;
  }[] = [];
  for (const p of productRows) {
    const pp = await computeProductPnl(p.id, { from, to });
    profitByProduct.push({
      id: p.id,
      name: p.name,
      net: pp?.net ?? 0,
      revenue: pp?.revenue ?? 0,
    });
  }

  const funnelRaw = await db.order.groupBy({
    by: ["status"],
    where: { createdAt: range, ...orderProductClause },
    _count: true,
  });
  const funnel = funnelRaw.map((f) => ({ status: f.status, count: f._count }));

  return ok({
    kpis: {
      revenue,
      collected,
      expenses,
      invested,
      net,
      deliveredOrders,
      pipelineValue,
      visitors,
      lowStock,
    },
    series: { daily },
    profitByProduct,
    funnel,
    visitors: visitorSeries,
  });
}
