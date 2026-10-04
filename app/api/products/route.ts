export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";

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

// GET is public (storefront). ?all=1 also returns inactive products, but only
// for callers with a valid admin session (proxy enforces auth otherwise).
export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const session = await getSessionFromRequest(req);
  const showAll = req.nextUrl.searchParams.get("all") === "1" && !!session;
  const products = await db.product.findMany({
    where: showAll ? {} : { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return ok(products.map(serialize));
}

export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }

  const name = String(body.name ?? "").trim();
  const slug = String(body.slug ?? "").trim();
  const salePrice = Number(body.salePrice);
  if (!name) return err("name is required", 400);
  if (!slug) return err("slug is required", 400);
  if (!Number.isFinite(salePrice) || salePrice < 0)
    return err("salePrice must be a non-negative number", 400);

  const existing = await db.product.findUnique({ where: { slug } });
  if (existing) return err("A product with this slug already exists", 409);

  try {
    const product = await db.product.create({
      data: {
        name,
        slug,
        sku: body.sku ? String(body.sku) : null,
        tagline: body.tagline ? String(body.tagline) : null,
        size: body.size ? String(body.size) : null,
        salePrice,
        compareAt:
          body.compareAt == null || body.compareAt === ""
            ? null
            : Number(body.compareAt),
        unitCost: body.unitCost == null ? 0 : Number(body.unitCost),
        stockQty:
          body.stockQty == null ? 0 : Math.max(0, Math.floor(Number(body.stockQty))),
        lowStockLevel:
          body.lowStockLevel == null
            ? 10
            : Math.max(0, Math.floor(Number(body.lowStockLevel))),
        image: body.image ? String(body.image) : null,
        gallery: Array.isArray(body.gallery)
          ? body.gallery.map(String)
          : [],
        isActive: body.isActive !== false,
      },
    });
    return ok(serialize(product), 201);
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return err("A product with this slug or SKU already exists", 409);
    }
    throw e;
  }
}
