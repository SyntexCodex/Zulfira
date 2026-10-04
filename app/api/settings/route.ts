export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";
import { getAllSettings, setSetting } from "@/lib/settings";

export async function GET(_req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  return ok(await getAllSettings());
}

// OWNER only. Accepts { key, value } or bulk { settings: { k: v } }.
export async function PUT(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "OWNER")
    return err("Owner access required", 403);

  let body: { key?: string; value?: unknown; settings?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }

  const entries: [string, string][] = [];
  if (body.settings && typeof body.settings === "object") {
    for (const [k, v] of Object.entries(body.settings)) {
      if (typeof k === "string" && k.trim()) entries.push([k.trim(), String(v ?? "")]);
    }
  }
  if (typeof body.key === "string" && body.key.trim()) {
    entries.push([body.key.trim(), String(body.value ?? "")]);
  }
  if (entries.length === 0) return err("Nothing to save: provide {key, value} or {settings}", 400);

  for (const [k, v] of entries) {
    await setSetting(k, v);
  }
  return ok(await getAllSettings());
}
