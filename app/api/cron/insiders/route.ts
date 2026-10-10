export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { programEnabled, normPhone, issueProgramCode } from "@/lib/discounts";
import { getSetting, setSetting } from "@/lib/settings";
import { sendTelegram, tgEscape } from "@/lib/telegram";
import { notifyInsidersInvite } from "@/lib/email";

const CHANNEL_LINK_PLACEHOLDER = "PASTE YOUR WHATSAPP CHANNEL LINK";

// CRON — invite customers with >= minOrders delivered orders to Zulfira Insiders.
// Runs daily; each phone is invited once (flagged in settings).
// NOTE: there is NO WhatsApp Business API — the digest below carries
// tap-to-send wa.me links for the admin to forward manually.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) return err("Unauthorized", 401);
  }
  const db = getDb();
  if (!db) return dbRequired();
  const { enabled, config } = await programEnabled(db, "insiders");
  if (!enabled) return ok({ skipped: true });

  const minOrders = Math.max(2, Math.floor(Number(config.minOrders ?? 2)));

  const groups = await db.order.groupBy({
    by: ["phone"],
    where: { status: "DELIVERED" },
    _count: { phone: true },
    having: { phone: { _count: { gte: minOrders } } },
  });

  const invited: { name: string; phone: string; email: string | null }[] = [];
  for (const g of groups) {
    const phone = normPhone(g.phone);
    const flag = await getSetting(`insiders_invited_${phone}`, "0");
    if (flag === "1") continue;
    // Use the most recent order for a friendly name.
    const recent = await db.order.findFirst({
      where: { OR: [{ phone }, { phone: g.phone }] },
      orderBy: { createdAt: "desc" },
      select: { customerName: true, email: true },
    });
    await setSetting(`insiders_invited_${phone}`, "1");
    invited.push({ name: recent?.customerName ?? "Zulfira customer", phone, email: recent?.email ?? null });
    // Issue their personal one-time 15% member code and invite by email.
    try {
      const { code } = await issueProgramCode(db, "insiders", { phone });
      notifyInsidersInvite(db, {
        email: recent?.email ?? undefined,
        name: (recent?.customerName ?? "there").trim().split(/\s+/)[0],
        code,
      }).catch(() => {});
    } catch {
      notifyInsidersInvite(db, {
        email: recent?.email ?? undefined,
        name: (recent?.customerName ?? "there").trim().split(/\s+/)[0],
      }).catch(() => {});
    }
  }

  if (invited.length) {
    const lines = invited.map((c) => {
      const msg =
        `Hi ${c.name}! You've unlocked ZULFIRA INSIDERS — our private circle. ` +
        `Early sale access, secret drops, founder updates. Join here: ${CHANNEL_LINK_PLACEHOLDER}`;
      const link = `https://wa.me/${c.phone}?text=${encodeURIComponent(msg)}`;
      return `• <a href="${link}">${tgEscape(c.name)}</a>`;
    });
    const text =
      `💎 <b>Zulfira Insiders — ${invited.length} new member${invited.length > 1 ? "s" : ""} unlocked (${minOrders}+ delivered orders)</b>\n` +
      `(tap-to-send; messages are NOT sent automatically)\n` +
      `⚠️ Before tapping: edit each message and replace "${CHANNEL_LINK_PLACEHOLDER}" with the real Insiders channel link.\n` +
      lines.join("\n");
    await sendTelegram(text.slice(0, 3500));
  }

  return ok({ eligible: groups.length, invited: invited.length });
}
