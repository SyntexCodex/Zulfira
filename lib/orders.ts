import type { PrismaClient, StockMovementType } from "@prisma/client";
import { getSetting } from "./settings";
import { sendTelegram, tgEscape } from "./telegram";

/**
 * A Prisma client OR an interactive-transaction client — both expose the
 * same model delegates, so stock helpers work inside $transaction.
 */
export type DbLike = Pick<PrismaClient, "product" | "stockMovement">;

interface ProductLike {
  id: string;
  name: string;
  stockQty: number;
  lowStockLevel: number;
}

/** Order numbers look like ZL-20261004-4821 (date + random 4 digits). */
export function generateOrderNo(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ZL-${y}${m}${d}-${rand}`;
}

/**
 * Move stock and record an audit trail row in one step.
 * qtyDelta is signed: negative = stock out (sale), positive = stock in.
 * Returns the updated product; callers can derive previousQty as
 * updated.stockQty - qtyDelta for threshold-crossing checks.
 */
export async function adjustStock(
  db: DbLike,
  productId: string,
  qtyDelta: number,
  type: StockMovementType,
  note: string,
  orderId?: string,
  createdBy?: string
) {
  const updated = await db.product.update({
    where: { id: productId },
    data: { stockQty: { increment: qtyDelta } },
  });
  await db.stockMovement.create({
    data: {
      productId,
      type,
      qty: qtyDelta,
      note,
      orderId: orderId ?? null,
      createdBy: createdBy ?? null,
    },
  });
  return updated;
}

/**
 * Low-stock Telegram alert with threshold-crossing dedupe: only fires when
 * the stock just dropped AT or BELOW lowStockLevel (previousQty was above
 * it). Repeated sales while already below the threshold stay silent.
 */
export async function checkLowStock(
  _db: DbLike,
  product: ProductLike,
  previousQty?: number
): Promise<void> {
  if (product.stockQty > product.lowStockLevel) return;
  // Dedupe: alert only on the downward crossing, not on every later sale.
  if (previousQty !== undefined && previousQty <= product.lowStockLevel) return;
  if ((await getSetting("alert_low_stock", "1")) === "0") return;
  await sendTelegram(
    `⚠️ <b>Low stock alert</b>\n` +
      `${tgEscape(product.name)}: <b>${product.stockQty}</b> left ` +
      `(threshold ${product.lowStockLevel})`
  );
}
