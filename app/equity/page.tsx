"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";

const GOLD = "#C9A227";
const BLACK = "#0B0B0B";

interface EquityInfo {
  enabled: boolean;
  name: string;
  slotPct: number;
  totalSlots: number;
  pricePerSlot: number;
  termMonths: number;
  slotsTaken: number;
  slotsRemaining: number;
}

interface Founder {
  name: string;
  slots: number;
}

const formatRs = (n: number) => `Rs ${Math.round(Number(n) || 0).toLocaleString("en-PK")}`;

const STEPS = [
  {
    n: "01",
    title: "Apply",
    text: "Submit your details below. Our team reviews every application personally.",
  },
  {
    n: "02",
    title: "Sign the agreement",
    text: "A 1-year profit-sharing agreement, drafted by our lawyer — clear terms, no fine print.",
  },
  {
    n: "03",
    title: "Get quarterly payouts",
    text: `Receive your share of Zulfira's profit every quarter for 12 months.`,
  },
];

const INCLUDED = [
  { title: "Quarterly profit payout", text: "Your slot's share of Zulfira's profit, paid every quarter for one year." },
  { title: "Lifetime Insider status", text: "A permanent 20% personal discount on everything at Zulfira." },
  { title: "Founders wall", text: "Your name engraved on our Founders wall — here and in-store." },
  { title: "Quarterly business updates", text: "See exactly how the business performs — revenue, growth, and your payout math." },
];

function Field({
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-left">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-400">
        {label}
      </span>
      <input
        {...rest}
        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#C9A227]"
      />
    </label>
  );
}

export default function EquityPage() {
  const [info, setInfo] = useState<EquityInfo | null>(null);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", email: "", cnic: "", slots: "1", whyText: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/equity/info");
        if (r.ok) setInfo((await r.json()).data as EquityInfo);
      } catch { /* keep loading state honest */ }
      try {
        const r2 = await fetch("/api/equity/owners");
        if (r2.ok) setFounders((await r2.json()).data as Founder[]);
      } catch { /* wall is optional */ }
      setLoading(false);
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setResult(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/equity/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slots: parseInt(form.slots, 10) }),
      });
      const body = await res.json();
      if (!res.ok || body.ok === false) throw new Error(body.error || "Submission failed");
      setResult({
        ok: true,
        msg: "Application received. Our team will review it and reach out on your phone number shortly.",
      });
      setForm({ name: "", phone: "", email: "", cnic: "", slots: "1", whyText: "" });
    } catch (e2) {
      setResult({ ok: false, msg: e2 instanceof Error ? e2.message : "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#0B0B0B]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-[#C9A227]" />
      </div>
    );
  }

  if (!info || !info.enabled) {
    return (
      <div className="bg-[#0B0B0B] px-6 py-28 text-center text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C9A227]">
          Zulfira Private Circle
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
          Coming soon.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-neutral-400">
          The 1% Equity profit-share program is not open right now. Join the
          Insiders list and we will notify you when the next round opens.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-[#C9A227] px-8 py-3 text-sm font-bold uppercase tracking-widest text-[#0B0B0B] transition hover:bg-[#d9b53a]"
        >
          Back to store
        </Link>
      </div>
    );
  }

  const pct = info.totalSlots > 0 ? Math.round((info.slotsTaken / info.totalSlots) * 100) : 0;

  return (
    <div className="bg-[#0B0B0B] text-white">
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden px-6 pb-20 pt-24 text-center sm:pt-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(600px circle at 50% 20%, rgba(201,162,39,0.25), transparent 70%)",
          }}
        />
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#C9A227]">
          Zulfira Private Circle
        </p>
        <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-6xl">
          Own 1% of Zulfira&rsquo;s profit.{" "}
          <span className="text-[#C9A227]">For 1 year.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base">
          Twenty slots. One for you. Share in the profit of a brand you already
          believe in — paid quarterly, documented openly, for twelve months.
        </p>

        {/* slots counter */}
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6">
          <div className="flex items-end justify-between">
            <div className="text-left">
              <div className="text-4xl font-bold text-[#C9A227]">
                {info.slotsRemaining}
                <span className="text-lg text-neutral-500"> / {info.totalSlots}</span>
              </div>
              <div className="mt-1 text-xs uppercase tracking-widest text-neutral-400">
                slots remaining
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatRs(info.pricePerSlot)}</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-neutral-400">
                per 1% slot
              </div>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-[#C9A227] transition-all"
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            {info.slotsTaken} slot{info.slotsTaken === 1 ? "" : "s"} already claimed
          </p>
        </div>

        <a
          href="#apply"
          className="mt-10 inline-block rounded-full bg-[#C9A227] px-10 py-4 text-sm font-bold uppercase tracking-widest text-[#0B0B0B] transition hover:bg-[#d9b53a]"
        >
          Apply now
        </a>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="border-t border-neutral-900 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-3xl font-semibold sm:text-4xl">
            How it works
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-7"
              >
                <div className="font-display text-4xl font-semibold text-[#C9A227]">{s.n}</div>
                <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- INCLUDED ---------- */}
      <section className="border-t border-neutral-900 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-display text-3xl font-semibold sm:text-4xl">
            What&rsquo;s included
          </h2>
          <div className="mt-10 space-y-4">
            {INCLUDED.map((f) => (
              <div
                key={f.title}
                className="flex gap-4 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C9A227]/15 text-[#C9A227]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold">{f.title}</h3>
                  <p className="mt-1 text-sm text-neutral-400">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950/60 p-5 text-center text-xs leading-relaxed text-neutral-400">
            Structured as a 1-year profit-sharing agreement (not company shares).
            The final agreement is drafted by our lawyer.
          </p>
        </div>
      </section>

      {/* ---------- FOUNDERS WALL ---------- */}
      <section className="border-t border-neutral-900 px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Founders wall</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-neutral-400">
            The first believers who claimed a slot.
          </p>
          {founders.length === 0 ? (
            <p className="mt-10 text-sm text-neutral-500">
              No founders yet — you could be first.
            </p>
          ) : (
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {founders.map((f, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[#C9A227]/30 bg-gradient-to-b from-[#C9A227]/10 to-transparent p-6"
                >
                  <div className="font-display text-xl font-semibold text-[#C9A227]">
                    {f.name}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-neutral-500">
                    {f.slots} slot{f.slots === 1 ? "" : "s"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- APPLICATION FORM ---------- */}
      <section id="apply" className="border-t border-neutral-900 px-6 py-20">
        <div className="mx-auto max-w-xl">
          <h2 className="text-center font-display text-3xl font-semibold sm:text-4xl">
            Apply for a slot
          </h2>
          <p className="mt-3 text-center text-sm text-neutral-400">
            Takes a minute. We respond personally to every application.
          </p>

          {result?.ok ? (
            <div className="mt-10 rounded-2xl border border-[#C9A227]/40 bg-[#C9A227]/10 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#C9A227] text-[#0B0B0B]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-bold">Application received</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-300">{result.msg}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-10 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Full name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                />
                <Field
                  label="Phone"
                  required
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="03xx xxxxxxx"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="CNIC"
                  value={form.cnic}
                  onChange={(e) => setForm({ ...form, cnic: e.target.value })}
                  placeholder="xxxxx-xxxxxxx-x"
                />
                <Field
                  label="Email (optional)"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>
              <label className="block text-left">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Slots (1% each)
                </span>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.slots}
                  onChange={(e) => setForm({ ...form, slots: e.target.value })}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#C9A227]"
                />
              </label>
              <label className="block text-left">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Why do you want to join?
                </span>
                <textarea
                  required
                  rows={4}
                  value={form.whyText}
                  onChange={(e) => setForm({ ...form, whyText: e.target.value })}
                  placeholder="Tell us in a line or two…"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#C9A227]"
                />
              </label>

              {result && !result.ok && (
                <p className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
                  {result.msg}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-[#C9A227] px-10 py-4 text-sm font-bold uppercase tracking-widest text-[#0B0B0B] transition hover:bg-[#d9b53a] disabled:opacity-50"
              >
                {submitting ? "Submitting…" : `Apply — ${formatRs(info.pricePerSlot * Math.max(1, parseInt(form.slots || "1", 10) || 1))}`}
              </button>
              <p className="text-center text-xs text-neutral-500">
                No payment is taken at this stage. You pay only after your
                application is approved and the agreement is signed.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
