"use client";

import { useEffect, useState } from "react";
import type { ProgramPromo } from "@/lib/programs";

const CACHE_TTL = 5 * 60 * 1000;

// Module-level cache shared by every component using this hook — one
// network request per page load no matter how many menus/banners render.
let cached: { at: number; programs: ProgramPromo[] } | null = null;
let inflight: Promise<ProgramPromo[]> | null = null;

async function fetchPrograms(): Promise<ProgramPromo[]> {
  if (cached && Date.now() - cached.at < CACHE_TTL) return cached.programs;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch("/api/programs/active", { cache: "no-store" });
      const json = await res.json();
      const list: ProgramPromo[] = json?.ok && Array.isArray(json.data?.programs)
        ? json.data.programs
        : [];
      cached = { at: Date.now(), programs: list };
      return list;
    } catch {
      return cached?.programs ?? [];
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** Enabled loyalty programs (from /admin/loyalty), shared across banner + menus. */
export function useActivePrograms(): ProgramPromo[] {
  const [programs, setPrograms] = useState<ProgramPromo[]>(() =>
    cached && Date.now() - cached.at < CACHE_TTL ? cached.programs : []
  );
  useEffect(() => {
    let cancelled = false;
    fetchPrograms().then((list) => {
      if (!cancelled) setPrograms(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return programs;
}
