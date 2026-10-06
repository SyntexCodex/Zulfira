export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { dbRequired } from "@/lib/api";
import { unsubscribeToken } from "@/lib/email";

// PUBLIC — one-click unsubscribe from marketing emails.
// GET /api/email/unsubscribe?email=...&token=...
export async function GET(req: NextRequest) {
  const email = (req.nextUrl.searchParams.get("email") ?? "").trim().toLowerCase();
  const token = req.nextUrl.searchParams.get("token") ?? "";

  const invalid = page("Invalid link", "This unsubscribe link is invalid or incomplete. Please use the link from your most recent Zulfira email.");
  if (!email || !token) return html(invalid);

  // Constant-time-ish compare of the HMAC token.
  const expected = unsubscribeToken(email);
  if (token.length !== expected.length || token !== expected) return html(invalid);

  const db = getDb();
  if (!db) return dbRequired();

  try {
    await db.emailPreference.upsert({
      where: { email },
      create: { email, unsubscribed: true },
      update: { unsubscribed: true },
    });
  } catch {
    return html(page("Something went wrong", "We could not update your preferences. Please try again later or reply to any Zulfira email."));
  }

  return html(
    page(
      "You've been unsubscribed",
      `You've been unsubscribed from Zulfira marketing emails. You'll still receive order confirmations and delivery updates at <strong>${escape(email)}</strong>.`
    )
  );
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function page(title: string, body: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escape(title)} — Zulfira</title></head>
<body style="margin:0;padding:0;background-color:#F7EFDC;font-family:Helvetica,Arial,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#F7EFDC;"><tr><td align="center" style="padding:64px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;background-color:#FFFFFF;border:1px solid #E8DCC0;border-radius:12px;overflow:hidden;">
<tr><td align="center" style="padding:36px 40px 24px 40px;">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;letter-spacing:6px;color:#C9A227;">ZULFIRA</div></td></tr>
<tr><td align="center" style="background-color:#0B0B0B;padding:40px;">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#C9A227;">${escape(title)}</div>
<div style="width:64px;height:2px;background-color:#C9A227;margin:18px auto 0 auto;"></div></td></tr>
<tr><td style="padding:36px 40px;font-size:15px;line-height:1.7;color:#3a3a3a;">${body}</td></tr>
</table></td></tr></table></body></html>`;
}

function html(body: string): NextResponse {
  return new NextResponse(body, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
