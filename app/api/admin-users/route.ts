export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";

const VALID_ROLES = new Set(["OWNER", "STAFF"]);

const safe = (u: {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  isActive: u.isActive,
  createdAt: u.createdAt,
});

async function requireOwner(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "OWNER") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  if (!(await requireOwner(req))) return err("Owner access required", 403);
  const users = await db.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  return ok(users.map(safe));
}

export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  if (!(await requireOwner(req))) return err("Owner access required", 403);

  let body: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const role = String(body.role ?? "STAFF").toUpperCase();
  if (!name) return err("name is required", 400);
  if (!email || !email.includes("@")) return err("Valid email is required", 400);
  if (password.length < 8)
    return err("Password must be at least 8 characters", 400);
  if (!VALID_ROLES.has(role)) return err("role must be OWNER or STAFF", 400);

  const existing = await db.adminUser.findUnique({ where: { email } });
  if (existing) return err("An admin with this email already exists", 409);

  const user = await db.adminUser.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 10), role: role as "OWNER" | "STAFF" },
  });
  return ok(safe(user), 201);
}
