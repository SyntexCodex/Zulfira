export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";

async function requireAdmin(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return err("Unauthorized", 401);
  return null;
}

// ADMIN — list all reviews (pending + approved), newest first.
export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const status = req.nextUrl.searchParams.get("status"); // pending | approved | all
  const where =
    status === "pending"
      ? { isApproved: false }
      : status === "approved"
        ? { isApproved: true }
        : {};

  const reviews = await db.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { product: { select: { name: true, slug: true } } },
  });

  return ok({ reviews });
}

// ADMIN — approve or reject a review.
export async function PATCH(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const denied = await requireAdmin(req);
  if (denied) return denied;

  let body: { id?: string; isApproved?: boolean };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }
  const id = String(body.id ?? "").trim();
  if (!id) return err("Review id is required", 400);

  const review = await db.review.update({
    where: { id },
    data: { isApproved: !!body.isApproved },
  });
  return ok({ id: review.id, isApproved: review.isApproved });
}

// ADMIN — delete a review.
export async function DELETE(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const id = req.nextUrl.searchParams.get("id")?.trim();
  if (!id) return err("Review id is required", 400);
  await db.review.delete({ where: { id } });
  return ok({ id });
}
