"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function GiftTrialPage() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [form, setForm] = useState({
    senderName: "",
    senderPhone: "",
    senderEmail: "",
    friendName: "",
    friendPhone: "",
    friendEmail: "",
    friendAddress: "",
    friendCity: "",
  });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/gift-trial")
      .then((r) => r.json())
      .then((b) => setEnabled(b.ok ? !!b.data.enabled : true))
      .catch(() => setEnabled(true));
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setMsg("");
    try {
      const res = await fetch("/api/gift-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error || "Something went wrong");
      setState("done");
      setMsg(body.data.message);
    } catch (e2) {
      setState("error");
      setMsg(e2 instanceof Error ? e2.message : "Something went wrong");
    }
  };

  const inputCls =
    "w-full rounded-xl border border-gold/30 bg-black/60 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-gold focus:ring-1 focus:ring-gold";

  return (
    <div className="bg-[#0B0B0B] text-white">
      <section className="mx-auto max-w-3xl px-4 pt-14 pb-10 text-center">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-gold">Zulfira Loyalty</p>
        <h1 className="font-display mt-4 text-4xl md:text-5xl leading-tight">
          Gift a friend a <span className="text-gold">free trial</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-white/70">
          Know someone who needs the Zulfira ritual? We'll send them a free 100ml trial bottle
          (COD-free, on us). They get 15% off their first order with a <span className="font-bold text-gold">personal one-time code</span> emailed to them —
          and when they order, <span className="font-semibold text-gold">you earn Rs 200</span> wallet credit.
        </p>
        <div className="mx-auto mt-6 h-px w-24 bg-gold/60" />
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20">
        {enabled === false ? (
          <div className="rounded-3xl border border-gold/25 bg-white/[0.03] p-10 text-center">
            <h2 className="font-display text-3xl text-gold">Coming soon</h2>
            <p className="mx-auto mt-3 max-w-md text-white/70">
              Gift-a-trial isn't open yet. We're getting the trial bottles ready — check back soon.
            </p>
            <Link href="/shop" className="mt-6 inline-block rounded-full bg-gold px-8 py-3 text-sm font-bold text-black hover:bg-gold-deep">
              Shop Zulfira
            </Link>
          </div>
        ) : enabled === null ? (
          <p className="py-10 text-center text-white/50">Loading…</p>
        ) : (
        <div className="rounded-3xl border border-gold/25 bg-white/[0.03] p-7 md:p-10">
          {state === "done" ? (
            <div className="text-center">
              <h2 className="font-display text-2xl text-gold">Gift on its way</h2>
              <p className="mx-auto mt-3 max-w-md text-white/70">{msg}</p>
              <Link href="/shop" className="mt-6 inline-block rounded-full bg-gold px-8 py-3 text-sm font-bold text-black hover:bg-gold-deep">
                Shop for yourself too
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gold">You</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <input className={inputCls} placeholder="Your name" value={form.senderName} onChange={set("senderName")} required />
                  <input className={inputCls} placeholder="Your mobile number" value={form.senderPhone} onChange={set("senderPhone")} required />
                  <input className={`${inputCls} md:col-span-2`} type="email" placeholder="Your email (optional — for gift updates)" value={form.senderEmail} onChange={set("senderEmail")} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gold">Your friend (new to Zulfira)</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <input className={inputCls} placeholder="Friend's name" value={form.friendName} onChange={set("friendName")} required />
                  <input className={inputCls} placeholder="Friend's mobile number" value={form.friendPhone} onChange={set("friendPhone")} required />
                  <input className={`${inputCls} md:col-span-2`} type="email" placeholder="Friend's email (optional)" value={form.friendEmail} onChange={set("friendEmail")} />
                  <input className={`${inputCls} md:col-span-2`} placeholder="Friend's address (street + area)" value={form.friendAddress} onChange={set("friendAddress")} required />
                  <input className={inputCls} placeholder="City" value={form.friendCity} onChange={set("friendCity")} required />
                </div>
                <p className="mt-2 text-xs text-white/45">
                  This gift is for new customers only — numbers that have already ordered from Zulfira aren't eligible.
                </p>
              </div>
              {msg && <p className="text-sm text-red-400">{msg}</p>}
              <button type="submit" disabled={state === "sending"} className="w-full rounded-full bg-gold py-3.5 text-sm font-bold text-black hover:bg-gold-deep disabled:opacity-60">
                {state === "sending" ? "Sending the gift…" : "Send a free trial bottle"}
              </button>
            </form>
          )}
        </div>
        )}
      </section>
    </div>
  );
}
