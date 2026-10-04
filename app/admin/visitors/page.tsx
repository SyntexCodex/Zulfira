"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { isoDate, useApi } from "../_components/api";
import type { DashboardStats } from "../_components/types";
import {
  AdminNote,
  ApiErrorNote,
  Btn,
  Card,
  Field,
  Loading,
  PageHeader,
  StatCard,
  TextInput,
} from "../_components/ui";

export default function AdminVisitorsPage() {
  const [from, setFrom] = useState(isoDate(30));
  const [to, setTo] = useState(isoDate(0));
  const [applied, setApplied] = useState({ from: isoDate(30), to: isoDate(0) });

  const { data, loading, error } = useApi<DashboardStats>(
    `/api/dashboard/stats?from=${applied.from}&to=${applied.to}`
  );

  const series = data?.visitors ?? [];
  const totalViews = series.reduce((s, v) => s + (v.views ?? 0), 0);
  const peak = series.reduce((m, v) => Math.max(m, v.views ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Visitors"
        subtitle="Storefront page-view tracking"
        actions={
          <>
            <Field label="From">
              <TextInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="To">
              <TextInput type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
            <div className="self-end pb-0.5">
              <Btn tone="primary" onClick={() => setApplied({ from, to })}>
                Apply
              </Btn>
            </div>
          </>
        }
      />

      {error && <ApiErrorNote error={error} />}
      {loading && <Loading />}

      {!loading && !error && data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total views" value={totalViews.toLocaleString("en-PK")} />
            <StatCard label="Peak day" value={peak.toLocaleString("en-PK")} />
            <StatCard
              label="Avg / day"
              value={(series.length ? Math.round(totalViews / series.length) : 0).toLocaleString("en-PK")}
            />
            <StatCard label="Days tracked" value={String(series.length)} />
          </div>

          <Card title="View trend">
            {series.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-500">
                No visitor data in this range.
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={24} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="views" name="Views" stroke="#0369a1" fill="#bae6fd" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card title="Top pages">
            <AdminNote>
              Page-level breakdown is not exposed by the reporting API yet — this table will
              populate once per-page tracking is enabled on the backend.
            </AdminNote>
          </Card>
        </div>
      )}
    </div>
  );
}
