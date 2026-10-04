export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";

// PUBLIC — list approved reviews for a product.
export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const productId = req.nextUrl.searchParams.get("productId")?.trim();
  if (!productId) return err("productId is required", 400);

  const reviews = await db.review.findMany({
    where: { productId, isApproved: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      customerName: true,
      rating: true,
      title: true,
      comment: true,
      createdAt: true,
    },
  });

  const agg = await db.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return ok({
    reviews,
    average: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null,
    count: agg._count.rating,
  });
}

// PUBLIC — submit a review. Only allowed for delivered orders, one review
// per (order, product).
export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();

  let body: {
    productId?: string;
    orderId?: string;
    customerName?: string;
    rating?: number;
    title?: string;
    comment?: string;
  };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }

  const productId = String(body.productId ?? "").trim();
  const orderId = String(body.orderId ?? "").trim();
  const customerName = String(body.customerName ?? "").trim().slice(0, 80);
  const rating = Math.round(Number(body.rating));
  const title = String(body.title ?? "").trim().slice(0, 120) || null;
  const comment = String(body.comment ?? "").trim().slice(0, 2000);

  if (!productId) return err("productId is required", 400);
  if (!customerName) return err("Please enter your name", 400);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5)
    return err("Rating must be between 1 and 5", 400);
  if (!comment) return err("Please write a review", 400);

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return err("Product not found", 404);

  // If tied to an order, it must exist, be delivered, and contain the product.
  if (orderId) {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: { select: { productId: true } } },
    });
    if (!order) return err("Order not found", 404);
    if (order.status !== "DELIVERED")
      return err("You can review once your order is delivered", 400);
    if (!order.items.some((it) => it.productId === productId))
      return err("This product is not in the order", 400);
    const existing = await db.review.findFirst({ where: { orderId, productId } });
    if (existing) return err("You already reviewed this product", 400);
  }

  const review = await db.review.create({
    data: { productId, orderId: orderId || null, customerName, rating, title, comment },
  });

  return ok({ id: review.id }, 201);
}
