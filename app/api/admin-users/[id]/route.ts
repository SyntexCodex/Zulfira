export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";

const VALID_ROLES = new Set(["OWNER", "STAFF"]);

type Ctx = { params: Promise<{ id: string }> };

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

export async function PUT(req: NextRequest, { params }: Ctx) {
  const db = getDb();
  if (!db) return dbRequired();
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "OWNER")
    return err("Owner access required", 403);
  const { id } = await params;

  const user = await db.adminUser.findUnique({ where: { id } });
  if (!user) return err("Admin user not found", 404);

  let body: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    isActive?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return err("name cannot be empty", 400);
    data.name = name;
  }
  if (body.email !== undefined) {
    const email = String(body.email).trim().toLowerCase();
    if (!email.includes("@")) return err("Valid email is required", 400);
    const clash = await db.adminUser.findFirst({
      where: { email, NOT: { id } },
    });
    if (clash) return err("An admin with this email already exists", 409);
    data.email = email;
  }
  if (body.password !== undefined) {
    if (String(body.password).length < 8)
      return err("Password must be at least 8 characters", 400);
    data.passwordHash = await bcrypt.hash(String(body.password), 10);
  }
  if (body.role !== undefined) {
    const role = String(body.role).toUpperCase();
    if (!VALID_ROLES.has(role)) return err("role must be OWNER or STAFF", 400);
    data.role = role;
  }
  if (body.isActive !== undefined) data.isActive = body.isActive === true;

  const updated = await db.adminUser.update({ where: { id }, data });
  return ok(safe(updated));
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const db = getDb();
  if (!db) return dbRequired();
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "OWNER")
    return err("Owner access required", 403);
  const { id } = await params;

  if (session.id === id) return err("You cannot delete your own account", 400);

  const user = await db.adminUser.findUnique({ where: { id } });
  if (!user) return err("Admin user not found", 404);

  // Never orphan the admin panel: the last active OWNER cannot be removed.
  if (user.role === "OWNER" && user.isActive) {
    const remainingOwners = await db.adminUser.count({
      where: { role: "OWNER", isActive: true, NOT: { id } },
    });
    if (remainingOwners === 0)
      return err("Cannot delete the last active owner", 400);
  }

  await db.adminUser.delete({ where: { id } });
  return ok({ deleted: true });
}
