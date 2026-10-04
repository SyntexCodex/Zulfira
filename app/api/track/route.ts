export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok } from "@/lib/api";

// PUBLIC — storefront visitor tracking. Swallows all errors and always
// answers 200 so analytics never break the shopping experience.
export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    if (!db) return ok({ ok: true });

    let body: {
      path?: string;
      sessionId?: string;
      referrer?: string;
      device?: string;
    };
    try {
      body = await req.json();
    } catch {
      return ok({ ok: true });
    }
    const path = String(body.path ?? "").slice(0, 500);
    if (!path) return ok({ ok: true });

    await db.pageView.create({
      data: {
        path,
        sessionId: body.sessionId ? String(body.sessionId).slice(0, 100) : null,
        referrer: body.referrer ? String(body.referrer).slice(0, 500) : null,
        device: body.device ? String(body.device).slice(0, 100) : null,
      },
    });
  } catch {
    // never fail the request
  }
  return ok({ ok: true });
}
