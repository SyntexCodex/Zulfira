"use client";

import { useMemo, useState } from "react";
import { fetchJson, useApi, formatRs, fmtDate } from "../_components/api";
import {
  AdminNote,
  ApiErrorNote,
  Btn,
  Card,
  Empty,
  Field,
  Loading,
  PageHeader,
  TextInput,
} from "../_components/ui";

interface Payout {
  id: string;
  quarter: string;
  profit: number | string;
  payout: number | string;
  paidAt: string | null;
}

interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  cnic: string | null;
  slots: number;
  amountPaid: number | string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  payouts: Payout[];
}

interface EquityData {
  enabled: boolean;
  config: Record<string, unknown>;
  owners: Owner[];
  summary: { slotsTaken: number; slotsRemaining: number; totalSlots: number };
}

const num = (v: number | string | null | undefined) => Number(v ?? 0) || 0;

const STATUS_CLS: Record<string, string> = {
  applied: "bg-sky-100 text-sky-800",
  approved: "bg-violet-100 text-violet-800",
  active: "bg-emerald-100 text-emerald-800",
  ended: "bg-slate-200 text-slate-700",
  rejected: "bg-red-100 text-red-700",
};

function Pill({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLS[status] ?? "bg-slate-200 text-slate-700"}`}
    >
      {status}
    </span>
  );
}

export default function EquityAdminPage() {
  const { data, loading, error, reload } = useApi<EquityData>("/api/admin/equity");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tone: "info" | "error"; text: string } | null>(null);

  // activate modal state
  const [activating, setActivating] = useState<Owner | null>(null);
  const [amountPaid, setAmountPaid] = useState("");

  // payout calculator
  const [quarter, setQuarter] = useState("2026-Q3");
  const [profit, setProfit] = useState("");
  const [previewOn, setPreviewOn] = useState(false);

  const slotPct = Number(data?.config?.slotPct ?? 1);
  const pricePerSlot = Number(data?.config?.pricePerSlot ?? 50000);
  const profitNum = Number(profit) || 0;

  const applied = useMemo(() => data?.owners.filter((o) => o.status === "applied") ?? [], [data]);
  const approved = useMemo(() => data?.owners.filter((o) => o.status === "approved") ?? [], [data]);
  const actives = useMemo(() => data?.owners.filter((o) => o.status === "active") ?? [], [data]);
  const allPayouts = useMemo(
    () =>
      (data?.owners ?? []).flatMap((o) =>
        o.payouts.map((p) => ({ ...p, ownerName: o.name, ownerSlots: o.slots }))
      ),
    [data]
  );
  const preview = useMemo(
    () =>
      actives.map((o) => ({
        ...o,
        perOwner: Math.round(((profitNum * o.slots * slotPct) / 100) * 100) / 100,
      })),
    [actives, profitNum, slotPct]
  );
  const previewTotal = preview.reduce((s, p) => s + p.perOwner, 0);

  const run = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    setMsg(null);
    try {
      const res = (await fn()) as { discountCode?: string } | null;
      if (res && typeof res === "object" && "discountCode" in res && (res as { discountCode?: string }).discountCode) {
        setMsg({ tone: "info", text: `Done. Owner's lifetime 20% code: ${(res as { discountCode: string }).discountCode}` });
      }
      await reload();
    } catch (e) {
      setMsg({ tone: "error", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  };

  const doAction = (id: string, action: string, extra?: Record<string, unknown>) =>
    fetchJson("/api/admin/equity", {
      method: "PUT",
      body: JSON.stringify({ id, action, ...extra }),
    });

  const activate = () =>
    run(`activate-${activating?.id}`, async () => {
      const res = await doAction(activating!.id, "activate", {
        amountPaid: Number(amountPaid),
      });
      setActivating(null);
      setAmountPaid("");
      return res;
    });

  const confirmPayout = () =>
    run("payout", () =>
      fetchJson("/api/admin/equity", {
        method: "PUT",
        body: JSON.stringify({ action: "payout", quarter: quarter.trim(), profit: profitNum }),
      }).then((r) => {
        setPreviewOn(false);
        setProfit("");
        return r;
      })
    );

  if (loading) return <Loading label="Loading equity data…" />;
  if (error || !data)
    return (
      <>
        <PageHeader title="1% Equity" subtitle="Manage applications, owners and payouts" />
        <ApiErrorNote error={error} />
      </>
    );

  return (
    <>
      <PageHeader
        title="1% Equity"
        subtitle="1-year profit-share program — applications, owners & quarterly payouts"
        actions={<Btn tone="ghost" onClick={() => reload()}>Refresh</Btn>}
      />

      {msg && <div className="mb-4"><AdminNote tone={msg.tone === "error" ? "error" : "info"}>{msg.text}</AdminNote></div>}

      {!data.enabled && (
        <div className="mb-4">
          <AdminNote tone="warn">
            The program is currently <strong>disabled</strong> (LoyaltyProgram key <code>equity_1pct</code>).
            Enable it in the admin settings to open applications on the public /equity page.
          </AdminNote>
        </div>
      )}

      {/* (a) summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Slots taken", value: String(data.summary.slotsTaken), sub: `of ${data.summary.totalSlots} total` },
          { label: "Slots remaining", value: String(data.summary.slotsRemaining), sub: "open for applications" },
          { label: "Price per slot (1%)", value: formatRs(pricePerSlot), sub: "one-off, per slot" },
          { label: "Max raise", value: formatRs(pricePerSlot * data.summary.totalSlots), sub: `${data.summary.totalSlots} slots` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.label}</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="mt-1 text-xs text-slate-500">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* (b) applications */}
      <Card title={`Applications (${applied.length})`} className="mb-6">
        {applied.length === 0 ? (
          <Empty label="No pending applications." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Phone</th>
                  <th className="py-2 pr-3">CNIC / Why</th>
                  <th className="py-2 pr-3">Slots</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applied.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100">
                    <td className="py-2.5 pr-3 font-medium text-slate-900">{o.name}</td>
                    <td className="py-2.5 pr-3 text-slate-600">{o.phone}</td>
                    <td className="py-2.5 pr-3 text-xs text-slate-500">{o.cnic || "—"}</td>
                    <td className="py-2.5 pr-3">{o.slots}</td>
                    <td className="py-2.5 text-right">
                      <div className="flex justify-end gap-2">
                        <Btn
                          tone="primary"
                          disabled={busy === `approve-${o.id}`}
                          onClick={() => run(`approve-${o.id}`, () => doAction(o.id, "approve"))}
                        >
                          Approve
                        </Btn>
                        <Btn
                          tone="danger"
                          disabled={busy === `reject-${o.id}`}
                          onClick={() => run(`reject-${o.id}`, () => doAction(o.id, "reject"))}
                        >
                          Reject
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* (c) approved + active owners */}
      <Card title="Owners" className="mb-6">
        {data.owners.filter((o) => o.status === "approved" || o.status === "active").length === 0 ? (
          <Empty label="No approved or active owners yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Phone / Email</th>
                  <th className="py-2 pr-3">Slots</th>
                  <th className="py-2 pr-3">Paid</th>
                  <th className="py-2 pr-3">Term</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...approved, ...actives].map((o) => (
                  <tr key={o.id} className="border-b border-slate-100">
                    <td className="py-2.5 pr-3 font-medium text-slate-900">{o.name}</td>
                    <td className="py-2.5 pr-3 text-slate-600">
                      {o.phone}
                      {o.email && <div className="text-xs text-slate-400">{o.email}</div>}
                    </td>
                    <td className="py-2.5 pr-3">{o.slots}</td>
                    <td className="py-2.5 pr-3">{formatRs(num(o.amountPaid))}</td>
                    <td className="py-2.5 pr-3 text-xs text-slate-500">
                      {o.startDate && o.endDate
                        ? `${fmtDate(o.startDate)} → ${fmtDate(o.endDate)}`
                        : "—"}
                    </td>
                    <td className="py-2.5 pr-3"><Pill status={o.status} /></td>
                    <td className="py-2.5 text-right">
                      <div className="flex justify-end gap-2">
                        {o.status === "approved" && (
                          <Btn tone="primary" onClick={() => { setActivating(o); setAmountPaid(String(pricePerSlot * o.slots)); }}>
                            Activate
                          </Btn>
                        )}
                        {o.status === "active" && (
                          <Btn
                            tone="ghost"
                            disabled={busy === `end-${o.id}`}
                            onClick={() => run(`end-${o.id}`, () => doAction(o.id, "end"))}
                          >
                            End
                          </Btn>
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

      {/* activate modal */}
      {activating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setActivating(null)}>
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Activate {activating.name}
            </h3>
            <Field label="Amount paid (Rs)">
              <TextInput
                type="number"
                min={0}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="e.g. 50000"
              />
            </Field>
            <p className="mt-2 text-xs text-slate-500">
              Activating sets the 12-month term starting today and issues the
              owner&rsquo;s lifetime 20% personal discount code.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Btn tone="ghost" onClick={() => setActivating(null)}>Cancel</Btn>
              <Btn tone="primary" disabled={busy === `activate-${activating.id}`} onClick={activate}>
                Confirm activation
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* (d) payout calculator */}
      <Card title="Quarterly payout calculator" className="mb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label='Quarter (e.g. "2026-Q3")'>
            <TextInput value={quarter} onChange={(e) => setQuarter(e.target.value)} />
          </Field>
          <Field label="Quarter profit (Rs)">
            <TextInput
              type="number"
              min={0}
              value={profit}
              onChange={(e) => setProfit(e.target.value)}
              placeholder="e.g. 500000"
            />
          </Field>
          <div className="flex items-end">
            <Btn
              tone="primary"
              disabled={actives.length === 0 || profitNum <= 0}
              onClick={() => setPreviewOn(true)}
            >
              Preview payouts
            </Btn>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Each owner&rsquo;s payout = profit × slots × {slotPct}% ÷ 100. {actives.length} active owner(s).
        </p>

        {previewOn && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Owner</th>
                  <th className="py-2 pr-3">Slots</th>
                  <th className="py-2 pr-3 text-right">Payout</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3 font-medium text-slate-900">{p.name}</td>
                    <td className="py-2 pr-3">{p.slots}</td>
                    <td className="py-2 text-right">{formatRs(p.perOwner)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2} className="py-2 pr-3 font-semibold text-slate-900">Total</td>
                  <td className="py-2 text-right font-bold text-slate-900">{formatRs(previewTotal)}</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-4 flex justify-end gap-2">
              <Btn tone="ghost" onClick={() => setPreviewOn(false)}>Cancel</Btn>
              <Btn tone="primary" disabled={busy === "payout"} onClick={confirmPayout}>
                Confirm — create {quarter.trim()} payouts
              </Btn>
            </div>
          </div>
        )}
      </Card>

      {/* (e) payouts */}
      <Card title={`Payouts (${allPayouts.length})`}>
        {allPayouts.length === 0 ? (
          <Empty label="No payouts created yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Quarter</th>
                  <th className="py-2 pr-3">Owner</th>
                  <th className="py-2 pr-3">Slots</th>
                  <th className="py-2 pr-3">Profit</th>
                  <th className="py-2 pr-3">Payout</th>
                  <th className="py-2 pr-3">Paid</th>
                  <th className="py-2 pr-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {allPayouts.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-2.5 pr-3 font-medium text-slate-900">{p.quarter}</td>
                    <td className="py-2.5 pr-3">{p.ownerName}</td>
                    <td className="py-2.5 pr-3">{p.ownerSlots}</td>
                    <td className="py-2.5 pr-3">{formatRs(num(p.profit))}</td>
                    <td className="py-2.5 pr-3 font-semibold">{formatRs(num(p.payout))}</td>
                    <td className="py-2.5 pr-3 text-xs text-slate-500">
                      {p.paidAt ? fmtDate(p.paidAt) : <span className="text-amber-600 font-semibold">Pending</span>}
                    </td>
                    <td className="py-2.5 text-right">
                      {!p.paidAt && (
                        <Btn
                          tone="primary"
                          disabled={busy === `paid-${p.id}`}
                          onClick={() =>
                            run(`paid-${p.id}`, () =>
                              fetchJson("/api/admin/equity", {
                                method: "PUT",
                                body: JSON.stringify({ action: "markPaid", payoutId: p.id }),
                              })
                            )
                          }
                        >
                          Mark paid
                        </Btn>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
