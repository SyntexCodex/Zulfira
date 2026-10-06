"use client";

import { useState } from "react";
import { asArray, fetchJson, useApi, fmtDateTime } from "../_components/api";
import {
  AdminNote,
  ApiErrorNote,
  Btn,
  Card,
  Empty,
  Loading,
  PageHeader,
} from "../_components/ui";

interface Trial {
  id: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string | null;
  friendName: string;
  friendPhone: string;
  friendEmail: string | null;
  friendAddress: string;
  friendCity: string;
  status: string;
  creditIssued: boolean;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  shipped: "bg-sky-100 text-sky-800",
  delivered: "bg-emerald-100 text-emerald-800",
  ordered: "bg-violet-100 text-violet-800",
};

function Pill({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] ?? "bg-slate-200 text-slate-700"}`}>
      {status}
    </span>
  );
}

const NEXT: Record<string, string> = { pending: "shipped", shipped: "delivered" };

export default function AdminGiftTrialsPage() {
  const { data, error, reload } = useApi<{ trials: Trial[] }>("/api/admin/gift-trials");
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const trials = asArray<Trial>(data?.trials);

  const advance = async (id: string, status: string) => {
    setBusy(id);
    setNote("");
    try {
      await fetchJson("/api/admin/gift-trials", {
        method: "PUT",
        body: JSON.stringify({ id, status }),
      });
      setNote(`Trial marked as "${status}".`);
      reload();
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gift-a-Trial"
        subtitle="Free 100ml trial bottles — ship the bottle, mark delivered, cron credits the sender when the friend orders"
        actions={<Btn tone="ghost" onClick={() => reload()}>Refresh</Btn>}
      />
      {note && <AdminNote>{note}</AdminNote>}
      <ApiErrorNote error={error} />

      <Card title="Nominations">
        {!data ? (
          <Loading />
        ) : trials.length === 0 ? (
          <Empty label="No gift trials yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Sender</th>
                  <th className="py-2 pr-3">Friend</th>
                  <th className="py-2 pr-3">Address</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Credit</th>
                  <th className="py-2 pr-3">Created</th>
                  <th className="py-2 pr-0 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trials.map((t) => (
                  <tr key={t.id} className="border-t border-slate-100 align-top">
                    <td className="py-2.5 pr-3">
                      <div className="font-medium">{t.senderName}</div>
                      <div className="font-mono text-xs text-slate-500">{t.senderPhone}</div>
                      {t.senderEmail && <div className="text-xs text-slate-400">{t.senderEmail}</div>}
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="font-medium">{t.friendName}</div>
                      <div className="font-mono text-xs text-slate-500">{t.friendPhone}</div>
                      {t.friendEmail && <div className="text-xs text-slate-400">{t.friendEmail}</div>}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-600">
                      {t.friendAddress}, {t.friendCity}
                    </td>
                    <td className="py-2.5 pr-3"><Pill status={t.status} /></td>
                    <td className="py-2.5 pr-3">
                      {t.creditIssued ? (
                        <span className="text-xs font-semibold text-emerald-700">Rs 200 issued</span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-600">{fmtDateTime(t.createdAt)}</td>
                    <td className="py-2.5 pr-0">
                      <div className="flex justify-end gap-1.5">
                        {NEXT[t.status] && (
                          <Btn
                            tone="primary"
                            onClick={() => advance(t.id, NEXT[t.status])}
                            disabled={busy === t.id}
                          >
                            Mark {NEXT[t.status]}
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
    </div>
  );
}
