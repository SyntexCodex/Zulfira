"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus, Plus, Banknote, CreditCard, Copy, Check, MessageCircle,
  Truck, ShieldCheck, ChevronDown,
} from "lucide-react";
import Reveal, { SectionHeading } from "./Reveal";
import {
  PRODUCTS, BUNDLE, PAYMENT_METHODS, ONLINE_PAYMENT_DETAILS,
  formatPKR, whatsappOrderLink,
} from "@/lib/site";

type Selection = "oil" | "shampoo" | "bundle";
type PayMethod = "cod" | "online";

const DELIVERY_FEE = 199;
const FREE_DELIVERY_ABOVE = 2500;

function priceOf(sel: Selection) {
  if (sel === "bundle") return BUNDLE.price;
  return PRODUCTS.find((p) => p.id === sel)!.price;
}
function nameOf(sel: Selection) {
  if (sel === "bundle") return BUNDLE.name;
  return PRODUCTS.find((p) => p.id === sel)!.name;
}
function imageOf(sel: Selection) {
  if (sel === "bundle") return PRODUCTS[0].image;
  return PRODUCTS.find((p) => p.id === sel)!.image;
}

export default function OrderSection() {
  const [sel, setSel] = useState<Selection>("bundle");
  const [qty, setQty] = useState(1);
  const [pay, setPay] = useState<PayMethod>("cod");
  const [copied, setCopied] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", phone: "", city: "", address: "", notes: "" });

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent).detail as Selection;
      if (id === "oil" || id === "shampoo" || id === "bundle") {
        setSel(id);
        setSent(false);
      }
    };
    window.addEventListener("zulfira:select-product", handler);
    return () => window.removeEventListener("zulfira:select-product", handler);
  }, []);

  const subtotal = useMemo(() => priceOf(sel) * qty, [sel, qty]);
  const delivery = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1600);
    } catch { /* clipboard unavailable */ }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 3) errs.name = "Please enter your full name.";
    if (!/^0?3\d{9}$/.test(form.phone.replace(/[\s-]/g, ""))) errs.phone = "Enter a valid mobile number (e.g. 03001234567).";
    if (form.city.trim().length < 2) errs.city = "Please enter your city.";
    if (form.address.trim().length < 8) errs.address = "Please enter your complete address.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const lines = [
      "*NEW ZULFIRA ORDER*",
      "--------------------------",
      `Product: ${nameOf(sel)}`,
      `Quantity: ${qty}`,
      `Subtotal: ${formatPKR(subtotal)}`,
      `Delivery: ${delivery === 0 ? "FREE" : formatPKR(delivery)}`,
      `*Total: ${formatPKR(total)}*`,
      `Payment: ${pay === "cod" ? "Cash on Delivery" : "Online Payment (receipt will follow)"}`,
      "--------------------------",
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `City: ${form.city}`,
      `Address: ${form.address}`,
    ];
    if (form.notes.trim()) lines.push(`Notes: ${form.notes}`);
    window.open(whatsappOrderLink(lines.join("\n")), "_blank", "noopener");
    setSent(true);
  };

  const inputCls = (bad?: string) =>
    `input-futuristic w-full rounded-xl px-4 py-3.5 text-[15px] ${bad ? "!border-red-400" : ""}`;

  return (
    <section id="order" className="relative py-28 sm:py-36">
      <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-mint/8 blur-[140px]" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          kicker="Order Portal"
          title={
            <>
              Claim your <span className="text-gold-gradient">ritual</span>
            </>
          }
          copy="Fill in your details and confirm on WhatsApp — pay cash at your doorstep, or online in advance. It takes under a minute."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-[1.05fr_1fr]">
          {/* left: product + payment selection */}
          <Reveal className="h-full">
            <div className="glass flex h-full flex-col rounded-[28px] p-7 sm:p-9">
              <h3 className="font-display text-xl font-extrabold uppercase tracking-widest text-muted">
                01 · Choose your formula
              </h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {(["oil", "shampoo", "bundle"] as Selection[]).map((id) => {
                  const active = sel === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => { setSel(id); setSent(false); }}
                      className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                        active ? "border-gold bg-gold/10 shadow-[0_0_30px_-8px_rgba(232,180,74,0.6)]" : "border-white/10 bg-white/[0.03] hover:border-gold/40"
                      }`}
                    >
                      <div className="relative h-24 overflow-hidden rounded-xl">
                        <Image src={imageOf(id)} alt={nameOf(id)} fill className="object-cover" />
                      </div>
                      <div className="mt-3 text-sm font-bold leading-tight">{nameOf(id)}</div>
                      <div className="font-display mt-1 text-lg font-extrabold text-gold-gradient">{formatPKR(priceOf(id))}</div>
                      {active && (
                        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-void">
                          <Check className="h-4 w-4" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* qty */}
              <div className="mt-7 flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-widest text-muted">Quantity</span>
                <div className="flex items-center gap-4">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition hover:border-gold hover:text-gold">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-display w-8 text-center text-2xl font-extrabold">{qty}</span>
                  <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(9, q + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition hover:border-gold hover:text-gold">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-display mt-9 text-xl font-extrabold uppercase tracking-widest text-muted">
                02 · Payment method
              </h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {(Object.keys(PAYMENT_METHODS) as PayMethod[]).map((id) => {
                  const m = PAYMENT_METHODS[id];
                  const active = pay === id;
                  const Icon = id === "cod" ? Banknote : CreditCard;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPay(id)}
                      className={`rounded-2xl border p-5 text-left transition-all duration-300 ${
                        active ? "border-mint bg-mint/10 shadow-[0_0_30px_-8px_rgba(45,212,168,0.5)]" : "border-white/10 bg-white/[0.03] hover:border-mint/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${active ? "bg-mint/20" : "bg-white/5"}`}>
                          <Icon className={`h-5 w-5 ${active ? "text-mint" : "text-muted"}`} />
                        </span>
                        <div className="font-bold">{m.label}</div>
                      </div>
                      <p className="mt-3 text-[13px] leading-relaxed text-muted">{m.note}</p>
                    </button>
                  );
                })}
              </div>

              {/* online payment details */}
              <AnimatePresence initial={false}>
                {pay === "online" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 rounded-2xl border border-gold/25 bg-gold/[0.06] p-5">
                      <p className="text-sm font-bold text-gold-soft">Pay to any of these accounts, then send the receipt screenshot on WhatsApp:</p>
                      <div className="mt-4 space-y-3">
                        {ONLINE_PAYMENT_DETAILS.map((d) => (
                          <div key={d.label} className="flex items-center justify-between gap-3 rounded-xl bg-void/60 px-4 py-3">
                            <div>
                              <div className="text-xs uppercase tracking-widest text-muted">{d.label} · {d.title}</div>
                              <div className="font-mono mt-0.5 text-[15px] font-semibold tracking-wide">{d.value}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => copy(d.label, d.value)}
                              className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold transition hover:border-gold hover:text-gold"
                            >
                              {copied === d.label ? <Check className="h-3.5 w-3.5 text-mint" /> : <Copy className="h-3.5 w-3.5" />}
                              {copied === d.label ? "Copied" : "Copy"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* summary */}
              <div className="mt-8 rounded-2xl bg-void/60 p-5">
                <div className="flex justify-between text-sm text-muted"><span>{nameOf(sel)} × {qty}</span><span>{formatPKR(subtotal)}</span></div>
                <div className="mt-2 flex justify-between text-sm text-muted">
                  <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> Delivery</span>
                  <span className={delivery === 0 ? "font-bold text-mint" : ""}>{delivery === 0 ? "FREE" : formatPKR(delivery)}</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-white/10 pt-3">
                  <span className="font-bold">Total</span>
                  <span className="font-display text-2xl font-extrabold text-gold-gradient">{formatPKR(total)}</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* right: details form */}
          <Reveal delay={0.12} className="h-full">
            <form onSubmit={submit} className="glass flex h-full flex-col rounded-[28px] p-7 sm:p-9">
              <h3 className="font-display text-xl font-extrabold uppercase tracking-widest text-muted">
                03 · Delivery details
              </h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <input className={inputCls(errors.name)} placeholder="Full name *" value={form.name} onChange={set("name")} />
                  {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
                </div>
                <div>
                  <input className={inputCls(errors.phone)} placeholder="Mobile (03xx-xxxxxxx) *" inputMode="tel" value={form.phone} onChange={set("phone")} />
                  {errors.phone && <p className="mt-1.5 text-xs text-red-400">{errors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <input className={inputCls(errors.city)} placeholder="City *" value={form.city} onChange={set("city")} />
                  {errors.city && <p className="mt-1.5 text-xs text-red-400">{errors.city}</p>}
                </div>
                <div className="sm:col-span-2">
                  <textarea className={`${inputCls(errors.address)} min-h-[96px] resize-none`} placeholder="Complete address (house, street, area) *" value={form.address} onChange={set("address")} />
                  {errors.address && <p className="mt-1.5 text-xs text-red-400">{errors.address}</p>}
                </div>
                <div className="sm:col-span-2">
                  <textarea className={`${inputCls()} min-h-[64px] resize-none`} placeholder="Notes (optional)" value={form.notes} onChange={set("notes")} />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-mint/25 bg-mint/[0.07] p-4 text-sm">
                <ShieldCheck className="h-8 w-8 shrink-0 text-mint" />
                <p className="text-cream/85">
                  {pay === "cod"
                    ? "Pay in cash when your parcel arrives. No advance needed — zero risk."
                    : "After paying online, tap the button below and attach your receipt screenshot in the WhatsApp chat."}
                </p>
              </div>

              <button type="submit" className="btn-gold mt-7 inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 text-base font-bold">
                <MessageCircle className="h-5 w-5" />
                Confirm Order on WhatsApp
              </button>

              <AnimatePresence>
                {sent && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-2 text-sm text-mint"
                  >
                    <Check className="h-4 w-4" />
                    WhatsApp opened with your order — just press send. We'll confirm shortly!
                  </motion.p>
                )}
              </AnimatePresence>

              <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted">
                <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                Prefer talking to a human? Scroll down for our QR code.
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
