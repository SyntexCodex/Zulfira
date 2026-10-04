"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageCircle, Package, PackageCheck, Truck,
  Check, AlertTriangle, RotateCcw, XCircle, ArrowLeft,
} from "lucide-react";
import { WHATSAPP_LINK, formatPKR } from "@/lib/site";

export const dynamic = "force-dynamic";

interface TrackItem {
  name: string;
  qty: number;
  unitPrice: number;
}

interface TrackData {
  orderNo: string;
  status: string;
  items: TrackItem[];
  total: number;
  createdAt?: string | null;
  deliveredAt?: string | null;
}

const STEPS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"] as const;
const TERMINAL = ["RETURNED", "CANCELLED"] as const;

const STEP_META: { label: string; icon: typeof Package }[] = [
  { label: "Pending", icon: Package },
  { label: "Confirmed", icon: PackageCheck },
  { label: "Shipped", icon: Truck },
  { label: "Delivered", icon: Check },
];

function fmtDate(d?: string | null): string | null {
  if (!d) return null;
  const t = new Date(d);
  return isNaN(t.getTime())
    ? null
    : t.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

export default function TrackOrderPage() {
  const [orderNo, setOrderNo] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "found" | "error">("idle");
  const [data, setData] = useState<TrackData | null>(null);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNo.trim() || !phone.trim() || state === "loading") return;
    setState("loading");
    setData(null);
    setError("");
    try {
      const qs = new URLSearchParams({ orderNo: orderNo.trim(), phone: phone.trim() });
      const res = await fetch(`/api/orders/track?${qs.toString()}`, { cache: "no-store" });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; data?: TrackData; error?: string }
        | null;
      if (!res.ok || !json?.ok || !json?.data) {
        setError(
          res.status === 503
            ? "Our tracking service is unreachable right now. Please try again in a moment — or ask us on WhatsApp and we'll check for you."
            : json?.error ||
              "We couldn't find an order with those details. Please check the order number and phone number and try again."
        );
        setState("error");
        return;
      }
      setData(json.data);
      setState("found");
    } catch {
      setError(
        "Our tracking service is unreachable right now. Please try again in a moment — or ask us on WhatsApp and we'll check for you."
      );
      setState("error");
    }
  };

  const reset = () => {
    setState("idle");
    setData(null);
    setError("");
  };

  const status = (data?.status ?? "").toUpperCase();
  const isTerminal = (TERMINAL as readonly string[]).includes(status);
  const stepIdx = isTerminal ? -1 : (STEPS as readonly string[]).indexOf(status);
  const createdAt = fmtDate(data?.createdAt);
  const deliveredAt = fmtDate(data?.deliveredAt);

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="text-center">
        <p className="eyebrow-red">Order Status</p>
        <h1 className="section-title mt-3 text-4xl sm:text-5xl">Track Your Order</h1>
        <p className="mx-auto mt-3 max-w-md text-[14.5px] text-muted">
          {state === "found"
            ? `Here's the latest on order ${data!.orderNo}.`
            : "Enter the order number you received at checkout and the phone number you ordered with."}
        </p>
      </div>

      <div className="card-soft mt-10 p-7 sm:p-9">
        {state === "found" && data ? (
          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-maroon">Order {data.orderNo}</p>
                {createdAt && <p className="mt-1 text-[13px] text-muted">Placed on {createdAt}</p>}
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-ink"
              >
                <ArrowLeft className="h-4 w-4" /> Track another
              </button>
            </div>

            {isTerminal ? (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left">
                {status === "CANCELLED" ? (
                  <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
                ) : (
                  <RotateCcw className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
                )}
                <div>
                  <p className="font-bold text-amber-900">
                    This order was {status === "CANCELLED" ? "cancelled" : "returned"}.
                  </p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-amber-800">
                    Please message us on WhatsApp if you have any questions — we're happy to help.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <ol className="flex items-start">
                  {STEP_META.map((s, i) => {
                    const done = stepIdx >= 0 && i < stepIdx;
                    const current = i === stepIdx;
                    const upcoming = stepIdx < 0 || i > stepIdx;
                    const Icon = s.icon;
                    return (
                      <li key={s.label} className={`flex flex-1 ${i > 0 ? "-ml-1" : ""}`}>
                        <div className="flex w-full flex-col items-center">
                          <div className="flex w-full items-center">
                            <span
                              className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors ${
                                current
                                  ? "border-maroon bg-maroon text-white shadow-md"
                                  : done
                                    ? "border-maroon bg-maroon/10 text-maroon"
                                    : "border-ink/15 bg-white text-muted"
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </span>
                          </div>
                          <p className={`mt-2 text-center text-[11.5px] font-bold leading-tight sm:text-[12.5px] ${current || done ? "text-ink" : "text-muted"}`}>
                            {s.label}
                          </p>
                          {current && (
                            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-maroon">
                              Current
                            </p>
                          )}
                        </div>
                        {i < STEP_META.length - 1 && (
                          <span
                            className={`mt-[22px] h-0.5 w-full min-w-3 ${i < stepIdx ? "bg-maroon" : "bg-ink/12"}`}
                            aria-hidden
                          />
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {data.items.length > 0 && (
              <ul className="mt-8 space-y-3 border-t border-ink/10 pt-6">
                {data.items.map((it, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 text-[14px]">
                    <span className="font-semibold">
                      {it.name} <span className="font-normal text-muted">× {it.qty}</span>
                    </span>
                    <span className="font-bold">{formatPKR((it.unitPrice || 0) * (it.qty || 0))}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-5">
              <span className="font-bold">Total</span>
              <span className="font-display text-2xl font-bold text-maroon">{formatPKR(data.total || 0)}</span>
            </div>

            {deliveredAt && (
              <p className="mt-3 text-center text-[13px] text-muted">
                Delivered on {deliveredAt} — enjoy your hair ritual!
              </p>
            )}

            <div className="mt-7 text-center">
              <a
                href={`${WHATSAPP_LINK}?text=${encodeURIComponent(`Hello Zulfira! I need help with my order ${data.orderNo}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-3.5 text-sm font-bold text-white"
              >
                <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <div>
            {state === "error" && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-left">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <p className="text-[13.5px] leading-relaxed text-red-900">{error}</p>
              </div>
            )}
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-bold">Order Number</label>
                <input
                  value={orderNo}
                  onChange={(e) => setOrderNo(e.target.value)}
                  placeholder="e.g. ZF-1234"
                  className="input-clean w-full rounded-xl px-5 py-3.5 text-[15px]"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-bold">Phone Number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03xx-xxxxxxx"
                  inputMode="tel"
                  className="input-clean w-full rounded-xl px-5 py-3.5 text-[15px]"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={state === "loading"}
                className={`btn-dark w-full rounded-full py-4 text-sm font-bold uppercase tracking-widest ${state === "loading" ? "opacity-60" : ""}`}
              >
                {state === "loading" ? "Looking up…" : "Track Order"}
              </button>
            </form>
            <p className="mt-6 text-center text-[13.5px] text-muted">
              Can't find your order number?{" "}
              <a
                href={`${WHATSAPP_LINK}?text=${encodeURIComponent("Hello Zulfira! Please help me track my order.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-maroon hover:underline"
              >
                Ask us on WhatsApp
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
