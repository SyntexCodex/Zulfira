"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { productBySlug, formatPKR } from "@/lib/site";

export default function CartDrawer() {
  const { items, isOpen, setOpen, setQty, remove, subtotal } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-[420px] flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="section-title text-xl">
                Your Cart{" "}
                <span className="text-sm font-normal text-muted">
                  ({items.reduce((s, i) => s + i.qty, 0)})
                </span>
              </h2>
              <button onClick={() => setOpen(false)} aria-label="Close cart" className="rounded-full p-2 hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft">
                    <ShoppingBag className="h-7 w-7 text-coal" />
                  </span>
                  <p className="section-title mt-5 text-lg">Your cart is empty</p>
                  <p className="mt-2 text-sm text-muted">Beautiful hair starts with the first step.</p>
                  <Link
                    href="/shop"
                    onClick={() => setOpen(false)}
                    className="btn-dark mt-6 rounded-full px-8 py-3 text-sm font-bold uppercase tracking-widest"
                  >
                    Shop Products
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((it) => {
                    const p = productBySlug(it.slug);
                    if (!p) return null;
                    return (
                      <li key={it.slug} className="flex gap-4 rounded-2xl border border-line p-3.5">
                        <Link
                          href={`/product/${p.slug}`}
                          onClick={() => setOpen(false)}
                          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gold-soft"
                        >
                          <Image src={p.gallery[0]} alt={p.name} fill className="object-cover" />
                        </Link>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[13.5px] font-semibold leading-snug">{p.name}</p>
                              <p className="mt-0.5 text-xs text-muted">{p.size}</p>
                            </div>
                            <button
                              onClick={() => remove(it.slug)}
                              aria-label="Remove item"
                              className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center border border-ink/20">
                              <button onClick={() => setQty(it.slug, it.qty - 1)} className="px-2.5 py-1.5" aria-label="Decrease">
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-7 text-center text-sm font-bold tabular-nums">{it.qty}</span>
                              <button onClick={() => setQty(it.slug, it.qty + 1)} className="px-2.5 py-1.5" aria-label="Increase">
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="text-[15px] font-extrabold">{formatPKR(p.price * it.qty)}</span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-line bg-white px-6 py-5">
                <div className="flex justify-between text-[15px]">
                  <span className="text-muted">Subtotal</span>
                  <span className="text-xl font-extrabold">{formatPKR(subtotal)}</span>
                </div>
                <p className="mt-1 text-xs text-muted">Delivery calculated at checkout. CoD available.</p>
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="btn-dark mt-4 flex items-center justify-center gap-2 rounded-full py-3.5 text-[13px] font-bold uppercase tracking-widest"
                >
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-2 w-full rounded-full py-2.5 text-sm font-medium text-muted hover:text-ink"
                >
                  Continue shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
