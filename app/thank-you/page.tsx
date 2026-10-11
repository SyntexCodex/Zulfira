"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, ShoppingBag } from "lucide-react";
import Reveal from "@/components/Reveal";

function ThankYouContent() {
  const params = useSearchParams();
  const orderNo = params.get("order");

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <Reveal>
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-coal/10">
          <CheckCircle2 className="h-10 w-10 text-coal" />
        </span>
        <h1 className="font-display mt-7 text-3xl font-semibold sm:text-4xl">
          Thank you!
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
          {orderNo ? (
            <>
              Your order <b className="text-ink">{orderNo}</b> has been placed
              successfully. We&apos;ll be in touch shortly to confirm delivery
              details.
            </>
          ) : (
            <>
              Your order has been placed successfully. We&apos;ll be in touch
              shortly to confirm delivery details.
            </>
          )}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {orderNo && (
            <Link
              href={`/track-order?order=${encodeURIComponent(orderNo)}`}
              className="btn-primary rounded-full px-8 py-3.5 text-sm font-semibold"
            >
              <span className="inline-flex items-center gap-2">
                <Package className="h-4 w-4" /> Track Your Order
              </span>
            </Link>
          )}
          <Link
            href="/shop"
            className="btn-outline-dark rounded-full px-8 py-3.5 text-sm font-semibold"
          >
            <span className="inline-flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Continue Shopping
            </span>
          </Link>
        </div>
      </Reveal>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <p className="text-muted">Loading…</p>
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
