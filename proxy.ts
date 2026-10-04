import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { ADMIN_COOKIE } from "./lib/auth";

/**
 * Next.js 16 "proxy" (renamed from middleware). Protects /admin/* pages and
 * /api/* routes, except the public storefront API endpoints.
 */

const PUBLIC_API: { method: string; pattern: RegExp }[] = [
  { method: "GET", pattern: /^\/api\/products(\/.*)?$/ },
  { method: "POST", pattern: /^\/api\/orders$/ },
  { method: "GET", pattern: /^\/api\/orders\/track$/ },
  { method: "POST", pattern: /^\/api\/track$/ },
  { method: "POST", pattern: /^\/api\/auth\/login$/ },
];

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    const isPublic = PUBLIC_API.some(
      (r) => r.method === req.method && r.pattern.test(pathname)
    );
    if (isPublic) return NextResponse.next();
  } else if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (await hasValidSession(req)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
