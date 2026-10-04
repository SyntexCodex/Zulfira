"use client";

import { useCallback, useEffect, useState } from "react";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function parseBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await parseBody(res)) as { ok?: boolean; data?: unknown; error?: string } | null;
  if (!res.ok || (body && body.ok === false)) {
    const msg =
      (body && typeof body.error === "string" && body.error) ||
      `Request failed (${res.status})`;
    throw new ApiError(res.status, msg);
  }
  return (body && "data" in body ? body.data : body) as T;
}

export function formatRs(n: number | null | undefined): string {
  const v = Number(n);
  if (n === null || n === undefined || Number.isNaN(v)) return "Rs 0";
  return `Rs ${Math.round(v).toLocaleString("en-PK")}`;
}

/** ISO date (yyyy-mm-dd) for `days` days ago. */
export function isoDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export function fmtDate(s: string | null | undefined): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(s);
  return d.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateTime(s: string | null | undefined): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(s);
  return d.toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Convenience fetch-hook: GETs `url` when set, exposes reload(). */
export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!url);
  const [error, setError] = useState<ApiError | null>(null);

  const reload = useCallback(() => {
    if (!url) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchJson<T>(url)
      .then((d) => setData(d))
      .catch((e) =>
        setError(e instanceof ApiError ? e : new ApiError(0, String(e)))
      )
      .finally(() => setLoading(false));
  }, [url]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload, setData };
}

/** Normalize endpoints that return either an array or { items: [...] }. */
export function asArray<T>(d: unknown): T[] {
  if (Array.isArray(d)) return d as T[];
  if (d && typeof d === "object" && Array.isArray((d as { items?: unknown }).items))
    return (d as { items: T[] }).items;
  return [];
}
