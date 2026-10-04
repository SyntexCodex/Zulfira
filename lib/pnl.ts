import { getDb } from "./db";

/**
 * P&L engine — per the plan's formula:
 *   net = collected(delivered) − invested − expenses − returnsLoss
 * where collected = delivered item revenue + delivery charges − discounts,
 * and expenses include product-linked + allocated general expenses.
 * General (product-less) expenses are allocated by delivered-revenue share
 * (equal split fallback when there is no revenue yet).
 * All money returned as plain numbers (Prisma Decimal → Number).
 */

export interface PnlFilter {
  from?: Date;
  to?: Date;
}

export interface InvestorPayout {
  investorId: string;
  name: string;
  amountInvested: number;
  sharePct: number;
  payout: number; // net * sharePct (negative = loss share)
}

export interface ProductPnl {
  productId: string;
  productName: string;
  invested: number;
  expensesDirect: number;
  expensesByCategory: Record<string, number>;
  expensesGeneralAllocated: number;
  expensesTotal: number;
  revenue: number;
  deliveryCollected: number;
  discounts: number;
  collected: number;
  returnsLoss: number;
  returnedUnits: number;
  deliveredUnits: number;
  deliveredOrders: number;
  pipelineValue: number;
  pipelineOrders: number;
  net: number;
  operatingProfit: number; // collected − expensesTotal − returnsLoss (excludes invested)
  marginPct: number | null;
  roiPct: number | null;
  breakEvenUnits: number | null;
  investors: InvestorPayout[];
}

const n = (d: unknown): number => Number(d ?? 0);

function inRange(date: Date, f: PnlFilter): boolean {
  if (f.from && date < f.from) return false;
  if (f.to && date > f.to) return false;
  return true;
}

export async function computeProductPnl(
  productId: string,
  filter: PnlFilter = {}
): Promise<ProductPnl | null> {
  const db = getDb();
  if (!db) return null;
  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      investors: { include: { investor: true } },
      investments: true,
      expenses: true,
    },
  });
  if (!product) return null;

  const invested = product.investments
    .filter((i) => inRange(i.investedAt, filter))
    .reduce((s, i) => s + n(i.amount), 0);

  const expensesByCategory: Record<string, number> = {};
  let expensesDirect = 0;
  for (const e of product.expenses) {
    if (!inRange(e.date, filter)) continue;
    const amt = n(e.amount);
    expensesDirect += amt;
    expensesByCategory[e.category] = (expensesByCategory[e.category] ?? 0) + amt;
  }

  // Delivered + returned + pipeline orders containing this product
  const items = await db.orderItem.findMany({
    where: { productId },
    include: { order: true },
  });

  let revenue = 0,
    deliveryCollected = 0,
    discounts = 0,
    returnsLoss = 0,
    returnedUnits = 0,
    deliveredUnits = 0,
    pipelineValue = 0;
  const deliveredOrderIds = new Set<string>();
  const pipelineOrderIds = new Set<string>();

  for (const it of items) {
    const o = it.order;
    if (!inRange(o.createdAt, filter)) continue;
    const line = n(it.unitPrice) * it.qty;
    if (o.status === "DELIVERED") {
      revenue += line;
      deliveredUnits += it.qty;
      deliveredOrderIds.add(o.id);
    } else if (o.status === "RETURNED") {
      returnsLoss += line;
      returnedUnits += it.qty;
    } else if (o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "SHIPPED") {
      pipelineValue += line;
      pipelineOrderIds.add(o.id);
    }
  }

  if (deliveredOrderIds.size > 0) {
    const delivered = await db.order.findMany({
      where: { id: { in: [...deliveredOrderIds] } },
      select: { deliveryCharge: true, discount: true },
    });
    for (const o of delivered) {
      deliveryCollected += n(o.deliveryCharge);
      discounts += n(o.discount);
    }
  }

  const collected = revenue + deliveryCollected - discounts;

  // General expenses allocated by delivered-revenue share across products
  let expensesGeneralAllocated = 0;
  const general = await db.expense.findMany({ where: { productId: null } });
  const generalTotal = general
    .filter((e) => inRange(e.date, filter))
    .reduce((s, e) => s + n(e.amount), 0);
  if (generalTotal > 0) {
    const allDelivered = await db.orderItem.findMany({
      where: { order: { status: "DELIVERED" } },
      include: { order: { select: { createdAt: true } } },
    });
    let totalRevenue = 0;
    for (const it of allDelivered) {
      if (inRange(it.order.createdAt, filter)) totalRevenue += n(it.unitPrice) * it.qty;
    }
    if (totalRevenue > 0) {
      expensesGeneralAllocated = generalTotal * (revenue / totalRevenue);
    } else {
      const productCount = await db.product.count({ where: { isActive: true } });
      expensesGeneralAllocated = productCount > 0 ? generalTotal / productCount : 0;
    }
  }

  const expensesTotal = expensesDirect + expensesGeneralAllocated;
  const net = collected - invested - expensesTotal - returnsLoss;
  const operatingProfit = collected - expensesTotal - returnsLoss;
  const marginPct = collected > 0 ? (net / collected) * 100 : null;
  const roiPct = invested > 0 ? (net / invested) * 100 : null;

  const unitPrice = n(product.salePrice);
  const unitCost = n(product.unitCost);
  const contribution = unitPrice - unitCost;
  const breakEvenUnits =
    contribution > 0 ? Math.ceil((invested + expensesTotal) / contribution) : null;

  const investors: InvestorPayout[] = product.investors.map((pi) => {
    const sharePct = n(pi.profitSharePct);
    const amountInvested = product.investments
      .filter((i) => i.investorId === pi.investorId && inRange(i.investedAt, filter))
      .reduce((s, i) => s + n(i.amount), 0);
    return {
      investorId: pi.investorId,
      name: pi.investor.name,
      amountInvested,
      sharePct,
      payout: (net * sharePct) / 100,
    };
  });

  return {
    productId,
    productName: product.name,
    invested,
    expensesDirect,
    expensesByCategory,
    expensesGeneralAllocated,
    expensesTotal,
    revenue,
    deliveryCollected,
    discounts,
    collected,
    returnsLoss,
    returnedUnits,
    deliveredUnits,
    deliveredOrders: deliveredOrderIds.size,
    pipelineValue,
    pipelineOrders: pipelineOrderIds.size,
    net,
    operatingProfit,
    marginPct,
    roiPct,
    breakEvenUnits,
    investors,
  };
}

export interface GlobalPnl {
  products: ProductPnl[];
  totals: {
    invested: number;
    expenses: number;
    revenue: number;
    collected: number;
    returnsLoss: number;
    net: number;
    deliveredOrders: number;
    pipelineValue: number;
    pipelineOrders: number;
  };
}

export async function computeGlobalPnl(filter: PnlFilter = {}): Promise<GlobalPnl | null> {
  const db = getDb();
  if (!db) return null;
  const products = await db.product.findMany({
    where: { isActive: true },
    select: { id: true },
  });
  const list: ProductPnl[] = [];
  for (const p of products) {
    const pnl = await computeProductPnl(p.id, filter);
    if (pnl) list.push(pnl);
  }
  const totals = {
    invested: list.reduce((s, p) => s + p.invested, 0),
    expenses: list.reduce((s, p) => s + p.expensesTotal, 0),
    revenue: list.reduce((s, p) => s + p.revenue, 0),
    collected: list.reduce((s, p) => s + p.collected, 0),
    returnsLoss: list.reduce((s, p) => s + p.returnsLoss, 0),
    net: list.reduce((s, p) => s + p.net, 0),
    deliveredOrders: 0,
    pipelineValue: list.reduce((s, p) => s + p.pipelineValue, 0),
    pipelineOrders: list.reduce((s, p) => s + p.pipelineOrders, 0),
  };
  // distinct delivered order count
  const delivered = await db.order.count({ where: { status: "DELIVERED" } });
  totals.deliveredOrders = delivered;
  return { products: list, totals };
}
