export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

const withLinks = {
  productLinks: {
    include: { product: { select: { id: true, name: true, slug: true } } },
  },
};

const serialize = (inv: {
  productLinks: { profitSharePct: unknown; [k: string]: unknown }[];
  [k: string]: unknown;
}) => ({
  ...inv,
  productLinks: inv.productLinks.map((l) => ({
    ...l,
    profitSharePct: Number(l.profitSharePct),
  })),
});

export async function GET(_req: NextRequest, { params }: Ctx) {
  const db = getDb();
  if (!db) return dbRequired();
  const { id } = await params;
  const investor = await db.investor.findUnique({
    where: { id },
    include: withLinks,
  });
  if (!investor) return err("Investor not found", 404);
  return ok(serialize(investor));
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const db = getDb();
  if (!db) return dbRequired();
  const { id } = await params;
  const investor = await db.investor.findUnique({ where: { id } });
  if (!investor) return err("Investor not found", 404);

  let body: { name?: string; phone?: string; email?: string; notes?: string };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return err("name cannot be empty", 400);
    data.name = name;
  }
  if (body.phone !== undefined)
    data.phone = body.phone ? String(body.phone).trim() : null;
  if (body.email !== undefined)
    data.email = body.email ? String(body.email).trim().toLowerCase() : null;
  if (body.notes !== undefined)
    data.notes = body.notes ? String(body.notes).trim() : null;

  const updated = await db.investor.update({
    where: { id },
    data,
    include: withLinks,
  });
  return ok(serialize(updated));
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const db = getDb();
  if (!db) return dbRequired();
  const { id } = await params;
  const investor = await db.investor.findUnique({ where: { id } });
  if (!investor) return err("Investor not found", 404);

  // Investment tranches are immutable financial history (Restrict on delete),
  // so an investor with recorded investments cannot be removed — keep the
  // record and simply stop linking them to new products.
  const investmentCount = await db.investment.count({ where: { investorId: id } });
  if (investmentCount > 0) {
    return err(
      "Cannot delete: this investor has recorded investments. Remove their product profit-share links instead and keep the history.",
      400
    );
  }
  // ProductInvestor rows cascade-delete with the investor.
  await db.investor.delete({ where: { id } });
  return ok({ deleted: true });
}
