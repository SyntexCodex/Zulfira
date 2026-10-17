"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCart } from "@/lib/cart";

export default function PromoPopup() {
  const [open, setOpen] = useState(false);
  const { isOpen: cartOpen } = useCart();

  useEffect(() => {
    if (localStorage.getItem("zulfira-popup-seen")) return;
    const t = setTimeout(() => setOpen(true), 3500);
    return () => clearTimeout(t);
  }, []);

  // Never cover the cart drawer — wait until it's closed
  useEffect(() => {
    if (cartOpen) setOpen(false);
  }, [cartOpen]);

  const close = () => {
    localStorage.setItem("zulfira-popup-seen", "1");
    setOpen(false);
  };

  // Don't render over the cart drawer (z-71) — popup is z-90
  if (cartOpen) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-2 text-white backdrop-blur hover:bg-black/60"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative h-52 bg-gold-soft">
              <Image src="/banners/hero-gold-soft.webp" alt="Zulfira offer" fill className="object-cover" />
            </div>
            <div className="p-7 text-center">
              <p className="eyebrow-red">Special Offer</p>
              <h3 className="section-title mt-2 text-3xl">Up to 50% Off</h3>
              <p className="mt-2 text-sm text-muted">
                Shampoo Rs 599 (was Rs 999) · Hair Oil Rs 699 (was Rs 1,200) · Ritual
                Bundle Rs 1,099 (was Rs 2,199) — with free home delivery.
              </p>
              <Link
                href="/shop"
                onClick={close}
                className="btn-coal mt-5 block rounded-full py-3.5 text-sm font-bold uppercase tracking-widest"
              >
                Shop the Offer
              </Link>
              <button onClick={close} className="mt-3 text-[13px] font-medium text-muted underline underline-offset-4 hover:text-ink">
                No, thanks
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
