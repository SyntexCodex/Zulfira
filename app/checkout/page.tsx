"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShoppingBag, Truck, Banknote, CreditCard, MessageCircle,
  CheckCircle2, ArrowLeft, Lock, AlertTriangle,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import {
  productBySlug, formatPKR, PAYMENT_METHODS, ONLINE_PAYMENT_DETAILS,
  whatsappOrderLink,
} from "@/lib/site";
import Reveal, { SectionHeading } from "@/components/Reveal";

const FREE_SHIP_THRESHOLD = 2500;
const SHIP_FEE = 200;

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  const { items, subtotal, count, clear } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", notes: "" });
  const [payMethod, setPayMethod] = useState<"cod" | "online">("cod");
  const [orderState, setOrderState] = useState<"idle" | "submitting" | "error">("idle");
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const [apiError, setApiError] = useState("");
  const [whatsappPlaced, setWhatsappPlaced] = useState(false);

  const shipping = subtotal >= FREE_SHIP_THRESHOLD || subtotal === 0 ? 0 : SHIP_FEE;
  const total = subtotal + shipping;

  const lines = useMemo(
    () =>
      items
        .map((it) => {
          const p = productBySlug(it.slug);
          return p ? `• ${p.name} (${p.size}) x${it.qty} — ${formatPKR(p.price * it.qty)}` : "";
        })
        .filter(Boolean)
        .join("\n"),
    [items]
  );

  const message = [
    "Hello Zulfira! I would like to place an order:",
    "",
    lines,
    "",
    `Subtotal: ${formatPKR(subtotal)}`,
    `Delivery: ${shipping === 0 ? "FREE" : formatPKR(shipping)}`,
    `Total: ${formatPKR(total)}`,
    `Payment: ${payMethod === "cod" ? "Cash on Delivery" : "Online Payment"}`,
    "",
    `Name: ${form.name}`,
    `Phone: ${form.phone}`,
    `Address: ${form.address}, ${form.city}`,
    form.notes ? `Notes: ${form.notes}` : "",
  ].join("\n");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const valid = form.name.trim() && /^0?3\d{9}$/.test(form.phone.replace(/[\s-]/g, "")) && form.address.trim() && form.city.trim();

  const submitOrder = async () => {
    if (!valid || orderState === "submitting") return;
    setOrderState("submitting");
    setApiError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
          },
          items: items.map(({ slug, qty }) => ({ slug, qty })),
          payment: payMethod,
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; data?: { orderNo?: string }; error?: string }
        | null;
      if (res.status === 503) throw new Error("SERVICE_UNAVAILABLE");
      if (!res.ok || !json?.ok || !json?.data?.orderNo) {
        throw new Error(json?.error || `Server responded ${res.status}`);
      }
      setOrderNo(json.data.orderNo);
      setOrderState("idle");
      clear();
    } catch (e) {
      setOrderState("error");
      setApiError(
        e instanceof Error && e.message === "SERVICE_UNAVAILABLE"
          ? "Online ordering is temporarily unavailable. You can still place this exact order via WhatsApp below — your details are already filled in."
          : "We couldn't place your order online just now. Please try again, or use the WhatsApp button below — nothing you entered is lost."
      );
    }
  };

  const placeOrderWhatsApp = () => {
    if (!valid) return;
    setWhatsappPlaced(true);
    window.open(whatsappOrderLink(message), "_blank");
    clear();
  };

  if (orderNo || whatsappPlaced) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <Reveal>
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-coal/10">
            <CheckCircle2 className="h-10 w-10 text-coal" />
          </span>
          {orderNo ? (
            <>
              <h1 className="font-display mt-7 text-3xl font-semibold sm:text-4xl">Order placed!</h1>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
                Thank you! Your order <b className="text-ink">{orderNo}</b> has been received.
                We'll message you back shortly to finalize {payMethod === "cod" ? "your Cash on Delivery" : "payment details"}.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/track-order" className="btn-primary rounded-full px-8 py-3.5 text-sm font-semibold">
                  Track Your Order
                </Link>
                <Link href="/shop" className="btn-outline-dark rounded-full px-8 py-3.5 text-sm font-semibold">
                  Continue Shopping
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display mt-7 text-3xl font-semibold sm:text-4xl">Order sent!</h1>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
                Your order details were opened in WhatsApp. Just press <b>send</b> there to confirm —
                we'll message you back shortly to finalize {payMethod === "cod" ? "your Cash on Delivery" : "payment details"}.
              </p>
              <Link href="/shop" className="btn-primary mt-8 inline-block rounded-full px-8 py-3.5 text-sm font-semibold">
                Continue Shopping
              </Link>
            </>
          )}
        </Reveal>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading eyebrow="Secure Checkout" title={<>Almost there.</>} />

      {items.length === 0 ? (
        <div className="mx-auto mt-12 max-w-md text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft">
            <ShoppingBag className="h-7 w-7 text-coal" />
          </span>
          <p className="font-display mt-5 text-xl font-semibold">Your cart is empty</p>
          <Link href="/shop" className="btn-primary mt-6 inline-block rounded-full px-8 py-3 text-sm font-semibold">
            Shop Products
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* form */}
          <div className="space-y-8">
            <Reveal>
              <section className="card p-7 sm:p-8">
                <h2 className="font-display text-xl font-semibold">1 · Contact & delivery</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <input placeholder="Full name *" value={form.name} onChange={set("name")} className="input-clean rounded-xl px-5 py-3.5 text-[15px]" />
                  <input placeholder="Mobile number * (03xx-xxxxxxx)" value={form.phone} onChange={set("phone")} inputMode="tel" className="input-clean rounded-xl px-5 py-3.5 text-[15px]" />
                  <input placeholder="Street address *" value={form.address} onChange={set("address")} className="input-clean rounded-xl px-5 py-3.5 text-[15px] sm:col-span-2" />
                  <input placeholder="City *" value={form.city} onChange={set("city")} className="input-clean rounded-xl px-5 py-3.5 text-[15px]" />
                  <input placeholder="Landmark (optional)" value={form.notes} onChange={set("notes")} className="input-clean rounded-xl px-5 py-3.5 text-[15px]" />
                </div>
              </section>
            </Reveal>

            <Reveal delay={0.08}>
              <section className="card p-7 sm:p-8">
                <h2 className="font-display text-xl font-semibold">2 · Payment method</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    { icon: Banknote, label: PAYMENT_METHODS.cod.label, note: PAYMENT_METHODS.cod.note, id: "cod" as const },
                    { icon: CreditCard, label: PAYMENT_METHODS.online.label, note: PAYMENT_METHODS.online.note, id: "online" as const },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPayMethod(m.id)}
                      className={`rounded-2xl border-[1.5px] p-5 text-left transition-all ${payMethod === m.id ? "border-coal bg-coal/[0.04] shadow-sm" : "border-ink/12 hover:border-ink/25"}`}
                    >
                      <span className="flex items-center justify-between">
                        <m.icon className={`h-6 w-6 ${payMethod === m.id ? "text-coal" : "text-muted"}`} />
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${payMethod === m.id ? "border-coal" : "border-ink/20"}`}>
                          {payMethod === m.id && <span className="h-2.5 w-2.5 rounded-full bg-coal" />}
                        </span>
                      </span>
                      <p className="mt-3 font-bold">{m.label}</p>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{m.note}</p>
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {payMethod === "online" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 rounded-2xl bg-gold-soft p-5">
                        <p className="text-sm font-bold">Pay to any of these accounts, then share the receipt on WhatsApp:</p>
                        <ul className="mt-3 space-y-2.5">
                          {ONLINE_PAYMENT_DETAILS.map((d) => (
                            <li key={d.label} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                              <span className="font-semibold text-coal">{d.label}</span>
                              <span className="font-mono text-[13px]">{d.value}</span>
                              <span className="w-full text-xs text-muted">{d.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </Reveal>

            <Reveal delay={0.12}>
              {orderState === "error" && (
                <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-left">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <p className="text-[13.5px] leading-relaxed text-red-900">{apiError}</p>
                </div>
              )}
              <button
                onClick={submitOrder}
                disabled={!valid || orderState === "submitting"}
                className={`flex w-full items-center justify-center gap-2 rounded-full py-4 text-[16px] font-bold transition-all ${valid && orderState !== "submitting" ? "btn-primary" : "cursor-not-allowed bg-ink/10 text-muted"}`}
              >
                {orderState === "submitting" ? "Placing your order…" : <>Place Order · {formatPKR(total)}</>}
              </button>
              {orderState === "error" && (
                <button
                  onClick={placeOrderWhatsApp}
                  disabled={!valid}
                  className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full py-4 text-[16px] font-bold text-white transition-all ${valid ? "bg-[#25D366] hover:brightness-95" : "cursor-not-allowed bg-ink/10 !text-muted"}`}
                >
                  <MessageCircle className="h-5 w-5" />
                  Place Order via WhatsApp · {formatPKR(total)}
                </button>
              )}
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
                <Lock className="h-3.5 w-3.5" /> Your details are only shared with Zulfira.
              </p>
              <Link href="/shop" className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-muted hover:text-ink">
                <ArrowLeft className="h-4 w-4" /> Back to shop
              </Link>
            </Reveal>
          </div>

          {/* summary */}
          <Reveal delay={0.1}>
            <aside className="card h-fit p-7 lg:sticky lg:top-28">
              <h2 className="font-display text-xl font-semibold">Order summary</h2>
              <ul className="mt-5 space-y-4">
                {items.map((it) => {
                  const p = productBySlug(it.slug);
                  if (!p) return null;
                  return (
                    <li key={it.slug} className="flex gap-3.5">
                      <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gold-soft">
                        <Image src={p.gallery[0]} alt={p.name} fill className="object-cover" />
                        <span className="absolute -right-0 -top-0 flex h-5 w-5 items-center justify-center rounded-bl-lg bg-coal text-[11px] font-bold text-white">
                          {it.qty}
                        </span>
                      </span>
                      <div className="flex-1">
                        <p className="text-[13.5px] font-semibold leading-snug">{p.name}</p>
                        <p className="text-xs text-muted">{p.size}</p>
                      </div>
                      <span className="text-[13.5px] font-bold">{formatPKR(p.price * it.qty)}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6 space-y-2.5 border-t border-ink/10 pt-5 text-[14.5px]">
                <div className="flex justify-between text-muted"><span>Subtotal ({count} items)</span><span className="font-semibold text-ink">{formatPKR(subtotal)}</span></div>
                <div className="flex justify-between text-muted">
                  <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> Delivery</span>
                  <span className="font-semibold text-ink">{shipping === 0 ? <span className="text-coal">FREE</span> : formatPKR(shipping)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted">Add {formatPKR(FREE_SHIP_THRESHOLD - subtotal)} more for free delivery.</p>
                )}
                <div className="flex justify-between pt-2">
                  <span className="font-bold">Total</span>
                  <span className="font-display text-2xl font-bold text-coal">{formatPKR(total)}</span>
                </div>
              </div>
            </aside>
          </Reveal>
        </div>
      )}
    </div>
  );
}
