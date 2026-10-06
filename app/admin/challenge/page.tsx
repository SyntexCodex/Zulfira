"use client";

import { useState } from "react";
import { asArray, fetchJson, useApi, fmtDate } from "../_components/api";
import {
  AdminNote,
  ApiErrorNote,
  Btn,
  Card,
  Field,
  Loading,
  Empty,
  PageHeader,
  TextInput,
  Select,
} from "../_components/ui";

interface Round {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  maxChallengers: number;
  status: string;
  _count: { challengers: number };
}

interface Checkin {
  id: string;
  day: number;
  postUrl: string;
  verified: boolean;
  createdAt: string;
}

interface Challenger {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  handle: string;
  orderNo: string | null;
  strikes: number;
  status: string;
  joinedAt: string;
  totalCheckins: number;
  verifiedCheckins: number;
  checkins: Checkin[];
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  out: "bg-red-100 text-red-800",
  completed: "bg-amber-100 text-amber-900",
  open: "bg-sky-100 text-sky-800",
  running: "bg-emerald-100 text-emerald-800",
  ended: "bg-slate-200 text-slate-700",
};

function Pill({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] ?? "bg-slate-200 text-slate-700"}`}>
      {status}
    </span>
  );
}

export default function AdminChallengePage() {
  const { data, error, reload } = useApi<{ rounds: Round[] }>("/api/admin/challenge/rounds");
  const [roundId, setRoundId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "", maxChallengers: "200" });
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const rounds = asArray<Round>(data?.rounds);
  const activeRoundId = roundId ?? rounds[0]?.id ?? null;

  const {
    data: cData,
    error: cError,
    reload: cReload,
  } = useApi<{ challengers: Challenger[] }>(
    activeRoundId ? `/api/admin/challenge/challengers?roundId=${activeRoundId}` : null
  );
  const challengers = asArray<Challenger>(cData?.challengers);

  const createRound = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("create");
    setNote("");
    try {
      await fetchJson("/api/admin/challenge/rounds", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          startDate: form.startDate,
          endDate: form.endDate,
          maxChallengers: Number(form.maxChallengers),
        }),
      });
      setForm({ name: "", startDate: "", endDate: "", maxChallengers: "200" });
      setCreating(false);
      setNote("Round created. It starts as 'open' — switch to 'running' on day 1.");
      reload();
    } catch (e2) {
      setNote(e2 instanceof Error ? e2.message : "Create failed");
    } finally {
      setBusy(null);
    }
  };

  const setStatus = async (id: string, status: string) => {
    setBusy(id + status);
    try {
      await fetchJson("/api/admin/challenge/rounds", {
        method: "PUT",
        body: JSON.stringify({ id, status }),
      });
      reload();
    } finally {
      setBusy(null);
    }
  };

  const toggleVerify = async (id: string, verified: boolean) => {
    setBusy(id);
    try {
      await fetchJson("/api/admin/challenge/checkins", {
        method: "PUT",
        body: JSON.stringify({ id, verified }),
      });
      cReload();
    } finally {
      setBusy(null);
    }
  };

  const activeRound = rounds.find((r) => r.id === activeRoundId);
  return (
    <div className="space-y-6">
      <PageHeader
        title="30-Day Challenge"
        subtitle="Rounds, signups, strikes and daily check-ins"
        actions={<Btn onClick={() => setCreating((v) => !v)}>{creating ? "Close" : "New round"}</Btn>}
      />
      {note && <AdminNote>{note}</AdminNote>}
      <ApiErrorNote error={error} />

      {creating && (
        <Card title="Create a round">
          <form onSubmit={createRound} className="grid gap-4 md:grid-cols-2">
            <Field label="Round name">
              <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Winter Glow-Up 2026" required />
            </Field>
            <Field label="Max challengers">
              <TextInput type="number" min={1} value={form.maxChallengers} onChange={(e) => setForm({ ...form, maxChallengers: e.target.value })} required />
            </Field>
            <Field label="Start date" hint="Strikes count from this day.">
              <TextInput type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </Field>
            <Field label="End date">
              <TextInput type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </Field>
            <div className="md:col-span-2">
              <Btn type="submit" tone="primary" disabled={busy === "create"}>
                {busy === "create" ? "Creating…" : "Create round"}
              </Btn>
            </div>
          </form>
        </Card>
      )}

      <Card title="Rounds">
        {!data ? (
          <Loading />
        ) : rounds.length === 0 ? (
          <Empty label="No rounds yet — create the first one." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Dates</th>
                  <th className="py-2 pr-3">Challengers</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rounds.map((r) => (
                  <tr key={r.id} className={`border-t border-slate-100 ${r.id === activeRoundId ? "bg-amber-50/60" : ""}`}>
                    <td className="py-2.5 pr-3 font-medium">{r.name}</td>
                    <td className="py-2.5 pr-3 text-slate-600">{fmtDate(r.startDate)} → {fmtDate(r.endDate)}</td>
                    <td className="py-2.5 pr-3">{r._count.challengers} / {r.maxChallengers}</td>
                    <td className="py-2.5 pr-3"><Pill status={r.status} /></td>
                    <td className="py-2.5 pr-0">
                      <div className="flex justify-end gap-1.5">
                        <Btn onClick={() => setRoundId(r.id)}>View</Btn>
                        {r.status !== "open" && (
                          <Btn onClick={() => setStatus(r.id, "open")} disabled={busy === r.id + "open"}>Reopen</Btn>
                        )}
                        {r.status !== "running" && (
                          <Btn onClick={() => setStatus(r.id, "running")} disabled={busy === r.id + "running"}>Start</Btn>
                        )}
                        {r.status !== "ended" && (
                          <Btn onClick={() => setStatus(r.id, "ended")} disabled={busy === r.id + "ended"}>End</Btn>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {activeRound && (
        <Card
          title={`Challengers — ${activeRound.name}`}
          action={<Btn tone="ghost" onClick={() => cReload()}>Refresh</Btn>}
        >
          <ApiErrorNote error={cError} />
          {!cData ? (
            <Loading />
          ) : challengers.length === 0 ? (
            <Empty label="No challengers in this round yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Phone</th>
                    <th className="py-2 pr-3">Handle</th>
                    <th className="py-2 pr-3">Check-ins</th>
                    <th className="py-2 pr-3">Strikes</th>
                    <th className="py-2 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {challengers.map((c) => (
                    <tr key={c.id} className="border-t border-slate-100 align-top">
                      <td className="py-2.5 pr-3">
                        <div className="font-medium">{c.name}</div>
                        {c.orderNo && <div className="text-xs text-slate-400">Order {c.orderNo}</div>}
                        {c.email && <div className="text-xs text-slate-400">{c.email}</div>}
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-xs">{c.phone}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{c.handle}</td>
                      <td className="py-2.5 pr-3">
                        <span className="font-semibold">{c.verifiedCheckins}</span>
                        <span className="text-slate-400"> / {c.totalCheckins}</span>
                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs text-sky-700">Verify posts</summary>
                          <div className="mt-2 max-w-md space-y-1.5">
                            {c.checkins.map((k) => (
                              <div key={k.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs">
                                <div className="min-w-0">
                                  <span className="font-bold">Day {k.day}</span>
                                  {" · "}
                                  <a href={k.postUrl} target="_blank" rel="noreferrer" className="truncate text-sky-700 underline">
                                    open post
                                  </a>
                                </div>
                                <Btn
                                  onClick={() => toggleVerify(k.id, !k.verified)}
                                  disabled={busy === k.id}
                                  tone={k.verified ? "ghost" : "primary"}
                                  className="!px-2 !py-1 !text-xs"
                                >
                                  {k.verified ? "Verified" : "Verify"}
                                </Btn>
                              </div>
                            ))}
                          </div>
                        </details>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className={`font-bold ${c.strikes >= 3 ? "text-red-600" : c.strikes > 0 ? "text-amber-600" : "text-slate-400"}`}>
                          {c.strikes}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3"><Pill status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

