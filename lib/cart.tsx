"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { productBySlug } from "./site";

export interface CartItem {
  slug: string;
  qty: number;
  /** true = Subscribe & Save (recurring every 45 days); absent/false = one-time */
  subscribe?: boolean;
}

interface CartCtx {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (slug: string, qty?: number, opts?: { subscribe?: boolean }) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  isOpen: boolean;
  setOpen: (v: boolean) => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "zulfira-cart-v2";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
    }
  }, [items, loaded]);

  const value = useMemo<CartCtx>(() => {
    const subtotal = items.reduce((s, it) => {
      const p = productBySlug(it.slug);
      return s + (p ? p.price * it.qty : 0);
    }, 0);
    const count = items.reduce((s, it) => s + it.qty, 0);
    return {
      items, count, subtotal, isOpen, setOpen,
      add: (slug, qty = 1, opts) => {
        const sub = !!opts?.subscribe;
        return setItems((prev) => {
          // Dedupe key includes the subscribe flag: one-time and subscribe
          // are separate cart lines.
          const found = prev.find((i) => i.slug === slug && !!i.subscribe === sub);
          if (found)
            return prev.map((i) =>
              i.slug === slug && !!i.subscribe === sub
                ? { ...i, qty: Math.min(99, i.qty + qty) }
                : i
            );
          return [...prev, { slug, qty, subscribe: sub || undefined }];
        });
      },
      remove: (slug) => setItems((prev) => prev.filter((i) => i.slug !== slug)),
      setQty: (slug, qty) =>
        setItems((prev) =>
          qty <= 0 ? prev.filter((i) => i.slug !== slug) : prev.map((i) => (i.slug === slug ? { ...i, qty: Math.min(99, qty) } : i))
        ),
      clear: () => setItems([]),
    };
  }, [items, isOpen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
