export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";

// PUBLIC — customers track their order with the order number alone. Returns
// no PII beyond what's needed to identify the order's contents.
export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const sp = req.nextUrl.searchParams;
  const orderNo = sp.get("orderNo")?.trim();
  if (!orderNo) return err("orderNo is required", 400);

  const order = await db.order.findFirst({
    where: { orderNo },
    include: {
      items: {
        include: { product: { select: { name: true } } },
      },
    },
  });
  if (!order) return err("Order not found", 404);

  return ok({
    orderNo: order.orderNo,
    status: order.status,
    items: order.items.map((it) => ({
      name: it.product.name,
      qty: it.qty,
      unitPrice: Number(it.unitPrice),
    })),
    total: Number(order.total),
    createdAt: order.createdAt,
    deliveredAt: order.deliveredAt,
  });
}
