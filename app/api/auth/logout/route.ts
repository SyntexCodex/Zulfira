export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { ok } from "@/lib/api";
import { clearAdminCookieHeader } from "@/lib/auth";

export async function POST() {
  const res = ok({ loggedOut: true });
  res.headers.set("Set-Cookie", clearAdminCookieHeader());
  return res;
}
