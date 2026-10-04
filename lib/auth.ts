import { SignJWT, jwtVerify } from "jose";

/** httpOnly cookie carrying the admin session JWT. */
export const ADMIN_COOKIE = "zulfira_admin_session";

export type AdminRole = "OWNER" | "STAFF";

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

function getSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set — add it to env vars.");
  return new TextEncoder().encode(s);
}

export async function signAdminToken(session: AdminSession): Promise<string> {
  return await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.id === "string" &&
      typeof payload.email === "string" &&
      (payload.role === "OWNER" || payload.role === "STAFF")
    ) {
      return {
        id: payload.id,
        email: payload.email,
        name: typeof payload.name === "string" ? payload.name : "",
        role: payload.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** Read the session from an incoming Request's Cookie header (route handlers). */
export async function getSessionFromRequest(req: Request): Promise<AdminSession | null> {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${ADMIN_COOKIE}=([^;]+)`));
  if (!match) return null;
  try {
    return await verifyAdminToken(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

/** Build a Set-Cookie header value for login. */
export function adminCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`;
}

/** Expire the session cookie (logout). */
export function clearAdminCookieHeader(): string {
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
