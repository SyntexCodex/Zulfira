import { getDb } from "./db";

/**
 * Key/value settings store. All alert toggles default to "1" (enabled):
 * alert_new_order, alert_low_stock, alert_daily_summary, alert_returns.
 * Returns the fallback (and no-ops on write) when the DB isn't configured.
 */
export async function getSetting(key: string, fallback = "1"): Promise<string> {
  const db = getDb();
  if (!db) return fallback;
  const row = await db.setting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

/** Fetch every setting as a plain { key: value } object. */
export async function getAllSettings(): Promise<Record<string, string>> {
  const db = getDb();
  if (!db) return {};
  const rows = await db.setting.findMany();
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}
