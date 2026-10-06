"use client";

import { useState } from "react";
import { fmtDateTime, fetchJson, useApi } from "../_components/api";
import {
  AdminNote,
  ApiErrorNote,
  Btn,
  Card,
  Empty,
  Loading,
  PageHeader,
  Select,
  TextInput,
} from "../_components/ui";

interface EmailRow {
  id: string;
  to: string;
  subject: string;
  template: string | null;
  status: string;
  error: string | null;
  createdAt: string;
}

interface EmailsData {
  logs: EmailRow[];
  counts: Record<string, number>;
  unsubscribed: { email: string; updatedAt: string }[];
}

const STATUS_STYLES: Record<string, string> = {
  sent: "bg-emerald-100 text-emerald-800",
  skipped: "bg-slate-200 text-slate-600",
  failed: "bg-red-100 text-red-800",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] ?? "bg-slate-200 text-slate-700"}`}
    >
      {status}
    </span>
  );
}

export default function EmailsPage() {
  const [tab, setTab] = useState<"log" | "unsubscribed">("log");
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");

  const qs = new URLSearchParams({ take: "100" });
  if (status !== "all") qs.set("status", status);
  if (appliedQ) qs.set("q", appliedQ);

  const { data, loading, error, reload } = useApi<EmailsData>(
    `/api/admin/emails?${qs.toString()}`
  );

  const logs = data?.logs ?? [];
  const counts = data?.counts ?? {};
  const unsubscribed = data?.unsubscribed ?? [];

  return (
    <div>
      <PageHeader
        title="Emails"
        subtitle="Every send attempt is logged here — sent, skipped (no API key / unsubscribed / no address), or failed."
        actions={
          <div className="flex gap-2">
            <Btn
              tone={tab === "log" ? "primary" : "default"}
              onClick={() => setTab("log")}
            >
              Send log
            </Btn>
            <Btn
              tone={tab === "unsubscribed" ? "primary" : "default"}
              onClick={() => setTab("unsubscribed")}
            >
              Unsubscribed ({unsubscribed.length})
            </Btn>
          </div>
        }
      />

      {tab === "log" && (
        <>
          <div className="mb-4 grid grid-cols-3 gap-3">
            {["sent", "skipped", "failed"].map((s) => (
              <Card key={s} className="px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  {s}
                </div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {counts[s] ?? 0}
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <form
              className="mb-4 flex flex-wrap items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                setAppliedQ(q.trim());
              }}
            >
              <label className="text-sm">
                <span className="mb-1 block text-xs font-medium text-slate-500">
                  Status
                </span>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="sent">Sent</option>
                  <option value="skipped">Skipped</option>
                  <option value="failed">Failed</option>
                </Select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-xs font-medium text-slate-500">
                  Search (to / subject / template)
                </span>
                <TextInput
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="ayesha@example.com"
                  className="w-64"
                />
              </label>
              <Btn type="submit">Search</Btn>
              {(status !== "all" || appliedQ) && (
                <Btn
                  tone="ghost"
                  onClick={() => {
                    setStatus("all");
                    setQ("");
                    setAppliedQ("");
                  }}
                >
                  Clear
                </Btn>
              )}
            </form>

            {loading && <Loading />}
            {error && <ApiErrorNote error={error} />}
            {!loading && !error && logs.length === 0 && (
              <Empty label="No email log entries yet." />
            )}
            {!loading && !error && logs.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-2 pr-3">To</th>
                      <th className="py-2 pr-3">Subject</th>
                      <th className="py-2 pr-3">Template</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-slate-100 align-top last:border-0"
                      >
                        <td className="py-2.5 pr-3 font-medium text-slate-900">
                          {r.to}
                        </td>
                        <td className="py-2.5 pr-3 text-slate-700">
                          {r.subject}
                          {r.error && (
                            <div className="mt-1 max-w-md truncate text-xs text-red-600">
                              {r.error}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 pr-3 text-slate-500">
                          {r.template ?? "—"}
                        </td>
                        <td className="py-2.5 pr-3">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="py-2.5 pr-3 whitespace-nowrap text-slate-500">
                          {fmtDateTime(r.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div className="mt-4">
            <AdminNote>
            Emails log as <strong>skipped</strong> until RESEND_API_KEY and a
            verified sending domain are configured in Vercel env vars.
            <button
              className="ml-2 text-xs font-semibold text-slate-600 underline"
              onClick={() => reload()}
            >
              Refresh
            </button>
          </AdminNote>
          </div>
        </>
      )}

      {tab === "unsubscribed" && (
        <Card>
          <p className="mb-4 text-sm text-slate-600">
            Customers who clicked an unsubscribe link. Marketing emails
            (reorder reminders, promos, 7-day follow-ups, Insiders invites,
            friend welcome) are never sent to these addresses.
          </p>
          {unsubscribed.length === 0 ? (
            <Empty label="No unsubscribes yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Unsubscribed on</th>
                  </tr>
                </thead>
                <tbody>
                  {unsubscribed.map((u) => (
                    <tr
                      key={u.email}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-2.5 pr-3 font-medium text-slate-900">
                        {u.email}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-500">
                        {fmtDateTime(u.updatedAt)}
                      </td>
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
