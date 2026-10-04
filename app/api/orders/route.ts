export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { generateOrderNo, adjustStock, checkLowStock } from "@/lib/orders";
import { getSetting } from "@/lib/settings";
import { sendTelegram, tgEscape } from "@/lib/telegram";

const FREE_SHIPPING_THRESHOLD = 2500;
const FLAT_DELIVERY_CHARGE = 200;

const money = (n: number) => `Rs ${Math.round(n).toLocaleString("en-PK")}`;
const round2 = (n: number) => Math.round(n * 100) / 100;

interface OrderItemInput {
  slug?: string;
  productId?: string;
  qty?: number;
}

interface ResolvedItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
}

// POST is PUBLIC (checkout). Validates against live DB prices/stock, never
// trusts client-computed totals.
export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();

  let body: {
    customer?: {
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
      notes?: string;
    };
    items?: OrderItemInput[];
    payment?: string;
  };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }

  const customer = body.customer ?? {};
  const name = String(customer.name ?? "").trim();
  const phone = String(customer.phone ?? "").trim();
  const address = String(customer.address ?? "").trim();
  const city = String(customer.city ?? "").trim();
  const notes = customer.notes ? String(customer.notes).trim() : null;
  if (!name) return err("Customer name is required", 400);
  if (!phone) return err("Customer phone is required", 400);
  if (!address) return err("Customer address is required", 400);
  if (!city) return err("Customer city is required", 400);

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) return err("At least one item is required", 400);

  const payment =
    String(body.payment ?? "cod").toLowerCase() === "online" ? "ONLINE" : "COD";

  // Resolve every line against the DB: unknown/inactive products and
  // insufficient stock are rejected up front.
  const resolved: ResolvedItem[] = [];
  for (const it of rawItems) {
    const qty = Math.floor(Number(it.qty));
    if (!Number.isFinite(qty) || qty <= 0)
      return err("Each item needs a positive quantity", 400);
    const key = it.productId ?? it.slug;
    if (!key) return err("Each item needs a productId or slug", 400);
    const product = it.productId
      ? await db.product.findUnique({ where: { id: it.productId } })
      : await db.product.findUnique({ where: { slug: it.slug } });
    if (!product || !product.isActive)
      return err(`Product not available: ${key}`, 400);
    if (product.stockQty < qty)
      return err(
        `Insufficient stock for ${product.name} (only ${product.stockQty} left)`,
        400
      );
    resolved.push({
      productId: product.id,
      name: product.name,
      qty,
      unitPrice: Number(product.salePrice),
    });
  }

  const subtotal = round2(
    resolved.reduce((s, it) => s + it.unitPrice * it.qty, 0)
  );
  const deliveryCharge = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_DELIVERY_CHARGE;
  const discount = 0;
  const total = round2(subtotal + deliveryCharge - discount);

  // Retry on the (very unlikely) order-number collision.
  let created: { id: string; orderNo: string } | null = null;
  for (let attempt = 0; attempt < 5 && !created; attempt++) {
    const orderNo = generateOrderNo();
    try {
      created = await db.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            orderNo,
            customerName: name,
            phone,
            address,
            city,
            notes,
            payment,
            subtotal,
            deliveryCharge,
            discount,
            total,
            items: {
              create: resolved.map((it) => ({
                productId: it.productId,
                qty: it.qty,
                unitPrice: it.unitPrice,
              })),
            },
          },
          select: { id: true, orderNo: true },
        });
        for (const it of resolved) {
          const updated = await adjustStock(
            tx,
            it.productId,
            -it.qty,
            "SALE",
            `Order ${orderNo}`,
            order.id
          );
          await checkLowStock(tx, updated, updated.stockQty + it.qty);
        }
        return order;
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        continue; // orderNo collision — regenerate
      }
      throw e;
    }
  }
  if (!created) return err("Could not place order, please try again", 500);

  // Fire-and-forget alert (never throws when Telegram isn't configured).
  if ((await getSetting("alert_new_order", "1")) !== "0") {
    const lines = resolved
      .map((it) => `• ${it.qty}× ${tgEscape(it.name)} (${money(it.unitPrice * it.qty)})`)
      .join("\n");
    await sendTelegram(
      `🛍️ <b>New order ${tgEscape(created.orderNo)}</b>\n` +
        `${tgEscape(name)} — ${tgEscape(phone)}\n` +
        `${tgEscape(address)}, ${tgEscape(city)}\n` +
        `${lines}\n` +
        `Delivery: ${money(deliveryCharge)} | <b>Total: ${money(total)}</b> (${payment})` +
        (notes ? `\nNotes: ${tgEscape(notes)}` : "")
    );
  }

  return ok({ orderNo: created.orderNo, total }, 201);
}

// GET is admin-only (proxy enforces auth). Filters + pagination for the
// orders pipeline view.
export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const sp = req.nextUrl.searchParams;

  const status = sp.get("status");
  const payment = sp.get("payment");
  const productId = sp.get("productId");
  const q = sp.get("q")?.trim();
  const from = sp.get("from");
  const to = sp.get("to");
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(sp.get("limit") ?? "20", 10) || 20)
  );

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (payment) where.payment = payment;
  if (productId) where.items = { some: { productId } };
  if (q) {
    where.OR = [
      { orderNo: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { customerName: { contains: q, mode: "insensitive" } },
    ];
  }
  if (from || to) {
    const createdAt: Record<string, Date> = {};
    if (from) {
      const d = new Date(from);
      if (!isNaN(d.getTime())) createdAt.gte = d;
    }
    if (to) {
      const d = new Date(to);
      if (!isNaN(d.getTime())) createdAt.lte = d;
    }
    if (Object.keys(createdAt).length > 0) where.createdAt = createdAt;
  }

  const [total, orders] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: {
          include: { product: { select: { name: true, slug: true } } },
        },
      },
    }),
  ]);

  const serialize = (o: (typeof orders)[number]) => ({
    ...o,
    subtotal: Number(o.subtotal),
    deliveryCharge: Number(o.deliveryCharge),
    discount: Number(o.discount),
    total: Number(o.total),
    items: o.items.map((it) => ({
      ...it,
      unitPrice: Number(it.unitPrice),
    })),
  });

  return ok({
    orders: orders.map(serialize),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}
