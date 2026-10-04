"use client";

import { useEffect } from "react";

/**
 * Fire-and-forget visitor ping: records the current page view with the
 * backend analytics endpoint (/api/track). Never throws — if the API is
 * absent or unreachable, the page is unaffected.
 */
export default function VisitorPing() {
  useEffect(() => {
    try {
      const payload = {
        path: window.location.pathname,
        referrer: document.referrer || undefined,
        device: navigator.userAgent,
      };
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        /* analytics are optional — ignore */
      });
    } catch {
      /* never break the page */
    }
  }, []);

  return null;
}
