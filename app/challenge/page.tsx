"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Round {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  challengerCount: number;
  maxChallengers: number;
}

interface Leader {
  name: string;
  handle: string;
  checkins: number;
}

interface StatusData {
  enabled: boolean;
  round: Round | null;
  leaderboard: Leader[];
}

const RULES = [
  { n: "30 days", d: "Post one video every day for 30 days showing your Zulfira ritual." },
  { n: "Tag it", d: "Every post must tag @zulfira and use #Zulfira30DayChallenge." },
  { n: "3 strikes = out", d: "Miss a day and you earn a strike. Three strikes and you're out of the round." },
  { n: "Finishers win", d: "Everyone who completes all 30 days wins a free Complete Ritual Bundle." },
  { n: "Grand prize", d: "The best transformation of the round wins a 1-year supply of Zulfira." },
];

function fmtDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

export default function ChallengePage() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  const [signup, setSignup] = useState({ name: "", phone: "", handle: "", orderNo: "", email: "" });
  const [signupState, setSignupState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [signupMsg, setSignupMsg] = useState("");

  const [checkin, setCheckin] = useState({ phone: "", day: "", postUrl: "" });
  const [checkinState, setCheckinState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [checkinMsg, setCheckinMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/challenge/status");
      const body = await res.json();
      if (body.ok) setStatus(body.data);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const doSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupState === "sending") return;
    setSignupState("sending");
    setSignupMsg("");
    try {
      const res = await fetch("/api/challenge/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signup),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error || "Signup failed");
      setSignupState("done");
      setSignupMsg(body.data.message);
      load();
    } catch (e2) {
      setSignupState("error");
      setSignupMsg(e2 instanceof Error ? e2.message : "Signup failed");
    }
  };

  const doCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkinState === "sending") return;
    setCheckinState("sending");
    setCheckinMsg("");
    try {
      const res = await fetch("/api/challenge/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: checkin.phone, day: Number(checkin.day), postUrl: checkin.postUrl }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error || "Check-in failed");
      setCheckinState("done");
      setCheckinMsg(body.data.message);
      load();
    } catch (e2) {
      setCheckinState("error");
      setCheckinMsg(e2 instanceof Error ? e2.message : "Check-in failed");
    }
  };

  const inputCls =
    "w-full rounded-xl border border-gold/30 bg-black/60 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-gold focus:ring-1 focus:ring-gold";

  return (
    <div className="bg-[#0B0B0B] text-white">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pt-14 pb-10 text-center">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-gold">Zulfira Loyalty</p>
        <h1 className="font-display mt-4 text-4xl md:text-6xl leading-tight">
          The <span className="text-gold">30-Day</span> Hair Challenge
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-white/70">
          Show your ritual for 30 days straight. Finishers win a free Complete Ritual Bundle —
          the best transformation wins a <span className="text-gold font-semibold">1-year supply</span>.
        </p>
        <div className="mx-auto mt-6 h-px w-24 bg-gold/60" />
      </section>

      {loading ? (
        <p className="pb-20 text-center text-white/50">Loading the challenge…</p>
      ) : status && !status.enabled ? (
        <section className="mx-auto max-w-3xl px-4 pb-20 text-center">
          <div className="rounded-3xl border border-gold/30 bg-white/[0.03] p-10">
            <h2 className="font-display text-3xl text-gold">Coming soon</h2>
            <p className="mt-3 text-white/70">
              The 30-Day Challenge isn't open yet. Keep an eye on this page — the next round launches soon.
            </p>
            <Link href="/shop" className="mt-6 inline-block rounded-full bg-gold px-8 py-3 text-sm font-bold text-black hover:bg-gold-deep">
              Stock up on your ritual
            </Link>
          </div>
        </section>
      ) : (
        <>
          {/* Rules */}
          <section className="mx-auto max-w-5xl px-4 pb-12">
            <h2 className="text-center font-display text-2xl md:text-3xl">How it works</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-5">
              {RULES.map((r, i) => (
                <div key={r.n} className="rounded-2xl border border-gold/25 bg-white/[0.03] p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-sm font-extrabold text-black">{i + 1}</div>
                  <p className="mt-3 font-bold text-gold">{r.n}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/65">{r.d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Current round */}
          {status?.round && (
            <section className="mx-auto max-w-5xl px-4 pb-12">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/[0.06] px-6 py-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
                    {status.round.status === "running" ? "Live round" : "Signups open"}
                  </p>
                  <h3 className="font-display mt-1 text-2xl">{status.round.name}</h3>
                  <p className="mt-1 text-sm text-white/60">
                    {fmtDate(status.round.startDate)} → {fmtDate(status.round.endDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl text-gold">
                    {status.round.challengerCount}
                    <span className="text-base text-white/50"> / {status.round.maxChallengers}</span>
                  </p>
                  <p className="text-xs text-white/50">challengers</p>
                </div>
              </div>
            </section>
          )}

          <div className="mx-auto max-w-5xl px-4 pb-16 grid gap-8 md:grid-cols-2">
            {/* Signup */}
            <section className="rounded-3xl border border-gold/25 bg-white/[0.03] p-7">
              <h2 className="font-display text-2xl">Join the challenge</h2>
              <p className="mt-1 text-sm text-white/60">You need a Zulfira order number to enter.</p>
              {signupState === "done" ? (
                <div className="mt-6 rounded-xl border border-gold/40 bg-gold/10 p-5 text-sm text-gold">{signupMsg}</div>
              ) : (
                <form onSubmit={doSignup} className="mt-5 space-y-3">
                  <input className={inputCls} placeholder="Full name" value={signup.name} onChange={(e) => setSignup({ ...signup, name: e.target.value })} required />
                  <input className={inputCls} placeholder="Mobile number (03XX-XXXXXXX)" value={signup.phone} onChange={(e) => setSignup({ ...signup, phone: e.target.value })} required />
                  <input className={inputCls} placeholder="Social handle (@yourhandle)" value={signup.handle} onChange={(e) => setSignup({ ...signup, handle: e.target.value })} required />
                  <input className={inputCls} placeholder="Order number (e.g. ZF-12345)" value={signup.orderNo} onChange={(e) => setSignup({ ...signup, orderNo: e.target.value })} required />
                  <input className={inputCls} type="email" placeholder="Email (optional — for challenge updates)" value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} />
                  {signupMsg && <p className="text-sm text-red-400">{signupMsg}</p>}
                  <button type="submit" disabled={signupState === "sending"} className="w-full rounded-full bg-gold py-3 text-sm font-bold text-black hover:bg-gold-deep disabled:opacity-60">
                    {signupState === "sending" ? "Joining…" : "I'm in — join the challenge"}
                  </button>
                </form>
              )}
            </section>

            {/* Check-in */}
            <section className="rounded-3xl border border-gold/25 bg-white/[0.03] p-7">
              <h2 className="font-display text-2xl">Log today's post</h2>
              <p className="mt-1 text-sm text-white/60">Paste the link to the post you published today.</p>
              {checkinState === "done" ? (
                <div className="mt-6">
                  <div className="rounded-xl border border-gold/40 bg-gold/10 p-5 text-sm text-gold">{checkinMsg}</div>
                  <button onClick={() => { setCheckinState("idle"); setCheckinMsg(""); }} className="mt-3 text-sm text-white/60 underline">
                    Log another day
                  </button>
                </div>
              ) : (
                <form onSubmit={doCheckin} className="mt-5 space-y-3">
                  <input className={inputCls} placeholder="Mobile number you signed up with" value={checkin.phone} onChange={(e) => setCheckin({ ...checkin, phone: e.target.value })} required />
                  <input className={inputCls} type="number" min={1} max={30} placeholder="Day (1–30)" value={checkin.day} onChange={(e) => setCheckin({ ...checkin, day: e.target.value })} required />
                  <input className={inputCls} placeholder="Post URL (https://…)" value={checkin.postUrl} onChange={(e) => setCheckin({ ...checkin, postUrl: e.target.value })} required />
                  {checkinMsg && <p className="text-sm text-red-400">{checkinMsg}</p>}
                  <button type="submit" disabled={checkinState === "sending"} className="w-full rounded-full border border-gold bg-transparent py-3 text-sm font-bold text-gold hover:bg-gold hover:text-black disabled:opacity-60">
                    {checkinState === "sending" ? "Logging…" : "Log Day"}
                  </button>
                </form>
              )}
            </section>
          </div>

          {/* Leaderboard */}
          <section className="mx-auto max-w-3xl px-4 pb-20">
            <h2 className="text-center font-display text-2xl md:text-3xl">Leaderboard</h2>
            <p className="mt-1 text-center text-sm text-white/50">Ranked by verified daily posts</p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-gold/25">
              {(status?.leaderboard ?? []).length === 0 ? (
                <p className="p-8 text-center text-sm text-white/50">No verified posts yet — be the first to claim the top spot.</p>
              ) : (
                status!.leaderboard.map((l, i) => (
                  <div key={i} className={`flex items-center justify-between px-5 py-3.5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                    <div className="flex items-center gap-4">
                      <span className={`font-display text-lg ${i < 3 ? "text-gold" : "text-white/40"}`}>{i + 1}</span>
                      <div>
                        <p className="text-sm font-semibold">{l.name}</p>
                        <p className="text-xs text-white/45">{l.handle}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">{l.checkins} days</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
