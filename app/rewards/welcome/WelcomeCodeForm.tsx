"use client";

import { useState } from "react";
import CopyCode from "@/components/rewards/CopyCode";

export default function WelcomeCodeForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [expiry, setExpiry] = useState<string | null>(null);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/welcome-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const j = (await res.json().catch(() => null)) as {
        ok?: boolean;
        data?: { code?: string; expiryDate?: string };
        error?: string;
      } | null;
      if (j?.ok && j.data?.code) {
        setCode(j.data.code);
        setExpiry(j.data.expiryDate ?? null);
      } else {
        setError(j?.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (code) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-gold/25 bg-white/[0.04] p-8 text-center">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-gold">Your personal code</p>
        <div className="mt-5 flex justify-center">
          <CopyCode code={code} />
        </div>
        <p className="mt-4 text-sm text-white/60">
          We've also emailed it to <span className="font-semibold text-white/85">{email}</span>
          {expiry ? <> — use it before {expiry}</> : null}. One-time use, 20% off everything.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl rounded-3xl border border-gold/25 bg-white/[0.04] p-8">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-gold">Claim your code</p>
      <h2 className="font-display mt-3 text-2xl md:text-3xl">Get your personal 20% code by email</h2>
      <p className="mt-2 text-sm text-white/55">
        Every code is unique and one-time use — made just for you.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-gold/60"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-gold/60"
        />
      </div>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full rounded-xl bg-gold px-6 py-3.5 text-sm font-extrabold uppercase tracking-widest text-coal transition hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Sending…" : "Email my 20% code"}
      </button>
      <p className="mt-3 text-center text-xs text-white/40">
        One code per email. We never share your address.
      </p>
    </form>
  );
}
