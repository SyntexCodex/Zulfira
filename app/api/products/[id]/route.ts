export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";
import { adjustStock, checkLowStock } from "@/lib/orders";

const num = (d: unknown): number => Number(d ?? 0);

function serialize(p: {
  salePrice: unknown;
  compareAt: unknown;
  unitCost: unknown;
  [k: string]: unknown;
}) {
  return {
    ...p,
    salePrice: num(p.salePrice),
    compareAt: p.compareAt == null ? null : num(p.compareAt),
    unitCost: num(p.unitCost),
  };
}

type Ctx = { params: Promise<{ id: string }> };

// GET is public. Inactive products 404 so the storefront never sees them;
// the admin panel can pass ?all=1 on the collection endpoint instead.
export async function GET(req: NextRequest, { params }: Ctx) {
  const db = getDb();
  if (!db) return dbRequired();
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product || !product.isActive) return err("Product not found", 404);
  return ok(serialize(product));
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const db = getDb();
  if (!db) return dbRequired();
  const session = await getSessionFromRequest(req);
  const { id } = await params;

  const current = await db.product.findUnique({ where: { id } });
  if (!current) return err("Product not found", 404);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }

  // Slug changes must stay unique.
  if (body.slug !== undefined) {
    const slug = String(body.slug).trim();
    if (!slug) return err("slug cannot be empty", 400);
    const clash = await db.product.findFirst({
      where: { slug, NOT: { id } },
    });
    if (clash) return err("A product with this slug already exists", 409);
  }

  const data: Record<string, unknown> = {};
  const set = (k: string, v: unknown) => {
    if (v !== undefined) data[k] = v;
  };
  if (body.name !== undefined) set("name", String(body.name).trim());
  if (body.slug !== undefined) set("slug", String(body.slug).trim());
  if (body.sku !== undefined)
    set("sku", body.sku ? String(body.sku) : null);
  if (body.tagline !== undefined)
    set("tagline", body.tagline ? String(body.tagline) : null);
  if (body.size !== undefined)
    set("size", body.size ? String(body.size) : null);
  if (body.salePrice !== undefined) {
    const v = Number(body.salePrice);
    if (!Number.isFinite(v) || v < 0)
      return err("salePrice must be a non-negative number", 400);
    set("salePrice", v);
  }
  if (body.compareAt !== undefined)
    set(
      "compareAt",
      body.compareAt == null || body.compareAt === ""
        ? null
        : Number(body.compareAt)
    );
  if (body.unitCost !== undefined) {
    const v = Number(body.unitCost);
    if (!Number.isFinite(v) || v < 0)
      return err("unitCost must be a non-negative number", 400);
    set("unitCost", v);
  }
  if (body.lowStockLevel !== undefined)
    set("lowStockLevel", Math.max(0, Math.floor(Number(body.lowStockLevel))));
  if (body.image !== undefined)
    set("image", body.image ? String(body.image) : null);
  if (body.gallery !== undefined)
    set(
      "gallery",
      Array.isArray(body.gallery) ? body.gallery.map(String) : []
    );
  if (body.isActive !== undefined) set("isActive", body.isActive === true);

  // Stock changes go through adjustStock so the audit trail stays complete.
  let stockDelta = 0;
  if (body.stockQty !== undefined) {
    const next = Math.max(0, Math.floor(Number(body.stockQty)));
    if (!Number.isFinite(next)) return err("stockQty must be a number", 400);
    stockDelta = next - current.stockQty;
  }

  let updated = current;
  if (Object.keys(data).length > 0) {
    updated = await db.product.update({ where: { id }, data });
  }
  if (stockDelta !== 0) {
    updated = await adjustStock(
      db,
      id,
      stockDelta,
      "ADJUSTMENT",
      typeof body.stockNote === "string" && body.stockNote.trim()
        ? body.stockNote.trim()
        : `Manual adjustment by ${session?.email ?? "admin"}`,
      undefined,
      session?.email ?? undefined
    );
    await checkLowStock(db, updated, current.stockQty);
  }
  return ok(serialize(updated));
}

// Soft delete: the product disappears from the storefront but history
// (orders, P&L, investments) keeps working.
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const db = getDb();
  if (!db) return dbRequired();
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) return err("Product not found", 404);
  const updated = await db.product.update({
    where: { id },
    data: { isActive: false },
  });
  return ok(serialize(updated));
}
