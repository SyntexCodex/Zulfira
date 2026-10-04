import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/** 503 when the database isn't configured yet (user hasn't added DATABASE_URL). */
export function dbRequired() {
  return err(
    "Database is not configured yet. Add DATABASE_URL in Vercel env vars and redeploy.",
    503
  );
}
