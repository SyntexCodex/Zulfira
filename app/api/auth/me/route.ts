export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { ok, err } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) return err("Unauthorized", 401);
  return ok({ user: session });
}
