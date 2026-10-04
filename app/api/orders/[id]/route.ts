export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { OrderStatus } from "@prisma/client";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";
import { adjustStock } from "@/lib/orders";
import { getSetting } from "@/lib/settings";
import { sendTelegram, tgEscape } from "@/lib/telegram";

const VALID_STATUSES = new Set<string>(Object.values(OrderStatus));
// Terminal states that already returned their stock to inventory.
const RESTOCKED_STATES = new Set(["RETURNED", "CANCELLED"]);

type Ctx = { params: Promise<{ id: string }> };

const serialize = (o: {
  subtotal: unknown;
  deliveryCharge: unknown;
  discount: unknown;
  total: unknown;
  items: { unitPrice: unknown; [k: string]: unknown }[];
  [k: string]: unknown;
}) => ({
  ...o,
  subtotal: Number(o.subtotal),
  deliveryCharge: Number(o.deliveryCharge),
  discount: Number(o.discount),
  total: Number(o.total),
  items: o.items.map((it) => ({ ...it, unitPrice: Number(it.unitPrice) })),
});

export async function GET(_req: NextRequest, { params }: Ctx) {
  const db = getDb();
  if (!db) return dbRequired();
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: { select: { name: true, slug: true, image: true } } },
      },
    },
  });
  if (!order) return err("Order not found", 404);
  return ok(serialize(order));
}

// Status pipeline: PENDING → CONFIRMED → SHIPPED → DELIVERED,
// with RETURNED / CANCELLED as terminal states that restock inventory.
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const db = getDb();
  if (!db) return dbRequired();
  const session = await getSessionFromRequest(req);
  const { id } = await params;

  let body: { status?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }
  const status = String(body.status ?? "").toUpperCase();
  if (!VALID_STATUSES.has(status)) return err("Invalid status", 400);
  const reason =
    typeof body.reason === "string" && body.reason.trim()
      ? body.reason.trim()
      : undefined;

  const order = await db.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return err("Order not found", 404);

  // Restock exactly once: only when entering a restocked state from a state
  // that still holds the stock (a repeat RETURNED→RETURNED patch must not
  // double-add inventory).
  const shouldRestock =
    RESTOCKED_STATES.has(status) && !RESTOCKED_STATES.has(order.status);

  const updated = await db.$transaction(async (tx) => {
    const next = await tx.order.update({
      where: { id },
      data: {
        status: status as OrderStatus,
        statusReason: reason !== undefined ? reason : order.statusReason,
        // deliveredAt marks the revenue-recognition moment for P&L.
        deliveredAt: status === "DELIVERED" ? new Date() : null,
      },
    });
    if (shouldRestock) {
      for (const it of order.items) {
        await adjustStock(
          tx,
          it.productId,
          it.qty,
          "RETURN",
          `Order ${order.orderNo} ${status}`,
          order.id,
          session?.email ?? undefined
        );
      }
    }
    return next;
  });

  if (shouldRestock && (await getSetting("alert_returns", "1")) !== "0") {
    await sendTelegram(
      `↩️ <b>Order ${tgEscape(order.orderNo)} marked ${tgEscape(status)}</b>\n` +
        `${tgEscape(order.customerName)} — ${tgEscape(order.phone)}\n` +
        `Items restocked to inventory.` +
        (reason ? `\nReason: ${tgEscape(reason)}` : "")
    );
  }

  return ok(serialize({ ...updated, items: order.items }));
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const db = getDb();
  if (!db) return dbRequired();
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "OWNER")
    return err("Owner access required", 403);
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id } });
  if (!order) return err("Order not found", 404);
  // OrderItems cascade-delete; stock is NOT auto-adjusted here — deleting is
  // an exceptional cleanup, stock corrections go through manual adjustment.
  await db.order.delete({ where: { id } });
  return ok({ deleted: true, orderNo: order.orderNo });
}
