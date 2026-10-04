import { PrismaClient } from "@prisma/client";

/**
 * Lazy Prisma singleton. Returns null when DATABASE_URL is not set, so the
 * app (and `next build`) works fine before the database is provisioned.
 * Callers must handle null = "database not configured".
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getDb(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}

/** True when a database is configured and reachable-ish (env present). */
export function isDbConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}
