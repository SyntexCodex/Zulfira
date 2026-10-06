"use client";

import { useState } from "react";
import { asArray, fetchJson, useApi } from "../_components/api";
import {
  AdminNote,
  ApiErrorNote,
  Btn,
  Card,
  Loading,
  PageHeader,
  Select,
} from "../_components/ui";

interface SubscriptionRow {
  id: string;
  customerName: string;
  phone: string;
  productId: string;
  intervalDays: number;
  nextShipDate: string;
  status: string;
  createdAt: string;
  product: { name: string; slug: string; salePrice: number };
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "active"
      ? "bg-emerald-100 text-emerald-800"
      : status === "paused"
        ? "bg-amber-100 text-amber-800"
        : "bg-slate-200 text-slate-600";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${tone}`}>
      {status}
    </span>
  );
}

export default function SubscriptionsPage() {
  const [filter, setFilter] = useState<string>("");
  const { data, error, reload } = useApi<{ subscriptions: SubscriptionRow[] }>(
    `/api/admin/subscriptions${filter ? `?status=${filter}` : ""}`
  );
  const [busy, setBusy] = useState<string | null>(null);

  const subscriptions = asArray<SubscriptionRow>(data?.subscriptions);

  const setStatus = async (id: string, status: string) => {
    if (status === "cancelled" && !confirm("Cancel this subscription? No more refills will be created.")) return;
    setBusy(id);
    try {
      await fetchJson("/api/admin/subscriptions", {
        method: "PUT",
        body: JSON.stringify({ id, status }),
      });
      reload();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscribe & Save"
        subtitle="Recurring refills — auto-orders are created by the subscriptions cron."
        actions={
          <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        }
      />

      {error ? (
        <ApiErrorNote error={error} />
      ) : !data ? (
        <Loading />
      ) : subscriptions.length === 0 ? (
        <Card>
          <AdminNote>No subscriptions yet.</AdminNote>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[12px] uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2.5">Customer</th>
                  <th className="px-3 py-2.5">Phone</th>
                  <th className="px-3 py-2.5">Product</th>
                  <th className="px-3 py-2.5">Cycle</th>
                  <th className="px-3 py-2.5">Next refill</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2.5 font-semibold text-slate-900">{s.customerName}</td>
                    <td className="px-3 py-2.5 text-slate-600">{s.phone}</td>
                    <td className="px-3 py-2.5 text-slate-700">{s.product.name}</td>
                    <td className="px-3 py-2.5 text-slate-600">{s.intervalDays} days</td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {new Date(s.nextShipDate).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-2">
                        {s.status !== "active" && (
                          <Btn disabled={busy === s.id} onClick={() => setStatus(s.id, "active")}>
                            Resume
                          </Btn>
                        )}
                        {s.status === "active" && (
                          <Btn tone="ghost" disabled={busy === s.id} onClick={() => setStatus(s.id, "paused")}>
                            Pause
                          </Btn>
                        )}
                        {s.status !== "cancelled" && (
                          <Btn tone="danger" disabled={busy === s.id} onClick={() => setStatus(s.id, "cancelled")}>
                            Cancel
                          </Btn>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
