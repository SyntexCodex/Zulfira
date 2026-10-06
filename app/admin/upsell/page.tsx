"use client";

import { useState } from "react";
import { asArray, fetchJson, useApi, fmtDate, formatRs } from "../_components/api";
import {
  AdminNote,
  ApiErrorNote,
  Btn,
  Card,
  Field,
  Empty,
  Loading,
  PageHeader,
  TextInput,
  StatCard,
} from "../_components/ui";

interface Code {
  id: string;
  code: string;
  kind: string;
  value: number;
  usedCount: number;
  maxUses: number | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUpsellPage() {
  const { data, error, reload } = useApi<{ codes: Code[]; summary: { total: number; used: number } }>(
    "/api/admin/inbox-codes"
  );
  const [count, setCount] = useState("50");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const codes = asArray<Code>(data?.codes);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNote("");
    try {
      const body = await fetchJson<{ created: number; message: string }>("/api/admin/inbox-codes", {
        method: "POST",
        body: JSON.stringify({ count: Number(count) }),
      });
      setNote(body.message);
      reload();
    } catch (e2) {
      setNote(e2 instanceof Error ? e2.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Inbox Upsell Codes" subtitle="INBOX20 discount codes for the gold/black in-box cards" />
      {note && <AdminNote>{note}</AdminNote>}
      <ApiErrorNote error={error} />

      <AdminNote>
        Print these on the <span className="font-semibold">gold/black in-box cards</span>: each code is single-use,
        percent-off, and expires {30} days after generation.
      </AdminNote>

      <Card title="Generate a batch">
        <form onSubmit={generate} className="flex flex-wrap items-end gap-4">
          <Field label="How many codes? (1–500)">
            <TextInput
              type="number"
              min={1}
              max={500}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="!w-40"
              required
            />
          </Field>
          <Btn type="submit" tone="primary" disabled={busy}>
            {busy ? "Generating…" : "Generate batch"}
          </Btn>
        </form>
      </Card>

      {data?.summary && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total codes" value={String(data.summary.total)} />
          <StatCard label="Redeemed" value={String(data.summary.used)} />
          <StatCard
            label="Redemption rate"
            value={data.summary.total ? `${Math.round((data.summary.used / data.summary.total) * 100)}%` : "—"}
          />
        </div>
      )}

      <Card title="Latest codes (100)">
        {!data ? (
          <Loading />
        ) : codes.length === 0 ? (
          <Empty label="No codes yet — generate your first batch." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Code</th>
                  <th className="py-2 pr-3">Off</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Expires</th>
                  <th className="py-2 pr-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => {
                  const used = c.usedCount > 0;
                  const expired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
                  return (
                    <tr key={c.id} className="border-t border-slate-100">
                      <td className="py-2.5 pr-3 font-mono font-semibold">{c.code}</td>
                      <td className="py-2.5 pr-3">{c.kind === "percent" ? `${Number(c.value)}%` : formatRs(Number(c.value))}</td>
                      <td className="py-2.5 pr-3">
                        {used ? (
                          <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">redeemed</span>
                        ) : !c.isActive ? (
                          <span className="inline-block rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">inactive</span>
                        ) : expired ? (
                          <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">expired</span>
                        ) : (
                          <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">unused</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-600">{fmtDate(c.expiresAt)}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{fmtDate(c.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
