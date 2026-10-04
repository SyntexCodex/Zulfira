export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { signAdminToken, adminCookieHeader } from "@/lib/auth";

export async function POST(req: Request) {
  if (!process.env.AUTH_SECRET) return err("AUTH_SECRET not set", 500);
  const db = getDb();
  if (!db) return dbRequired();

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) return err("Email and password are required", 400);

  const user = await db.adminUser.findUnique({ where: { email } });
  if (!user || !user.isActive) return err("Invalid email or password", 401);
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return err("Invalid email or password", 401);

  const token = await signAdminToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const res = ok({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
  res.headers.set("Set-Cookie", adminCookieHeader(token));
  return res;
}
