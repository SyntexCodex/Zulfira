export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";
import { programEnabled, generateCode } from "@/lib/discounts";

// ADMIN — list inbox upsell codes (latest 100) + redemption summary.
export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  if (!(await getSessionFromRequest(req))) return err("Unauthorized", 401);

  const codes = await db.discountCode.findMany({
    where: { programKey: "inbox_upsell" },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      code: true,
      kind: true,
      value: true,
      usedCount: true,
      maxUses: true,
      expiresAt: true,
      isActive: true,
      createdAt: true,
    },
  });
  const agg = await db.discountCode.aggregate({
    where: { programKey: "inbox_upsell" },
    _count: true,
  });
  const used = await db.discountCode.count({
    where: { programKey: "inbox_upsell", usedCount: { gt: 0 } },
  });

  return ok({ codes, summary: { total: agg._count, used } });
}

// ADMIN — generate a batch of INBOX20-XXXX codes for the in-box cards.
export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  if (!(await getSessionFromRequest(req))) return err("Unauthorized", 401);

  const { config } = await programEnabled(db, "inbox_upsell");
  const body = (await req.json().catch(() => ({}))) as { count?: number };
  const count = Math.floor(Number(body.count) || 0);
  if (count < 1 || count > 500) return err("Count must be between 1 and 500.", 400);

  const prefix = String(config.codePrefix ?? "INBOX20");
  const discountPct = Number(config.discountPct ?? 20);
  const expiryDays = Number(config.expiryDays ?? 30);
  const expiresAt = new Date(Date.now() + expiryDays * 86_400_000);

  const created: string[] = [];
  for (let i = 0; i < count; i++) {
    // Collision is extremely unlikely with 4 random chars; retry if it happens.
    let code = generateCode(prefix);
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const row = await db.discountCode.create({
          data: {
            code,
            kind: "percent",
            value: discountPct,
            maxUses: 1,
            expiresAt,
            programKey: "inbox_upsell",
            isActive: true,
          },
        });
        created.push(row.code);
        break;
      } catch {
        code = generateCode(prefix);
        if (attempt === 4) throw err("Could not generate unique codes — try a smaller batch.", 500);
      }
    }
  }

  return ok({
    created: created.length,
    codes: created,
    message: `Generated ${created.length} ${discountPct}%-off codes. Print these on the gold/black in-box cards.`,
  });
}
