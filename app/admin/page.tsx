"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { asArray, formatRs, isoDate, useApi } from "./_components/api";
import type { DashboardStats, Product } from "./_components/types";
import {
  AdminNote,
  ApiErrorNote,
  Btn,
  Card,
  Field,
  Loading,
  PageHeader,
  Select,
  StatCard,
  TextInput,
} from "./_components/ui";

const PIE_COLORS = ["#0f766e", "#0369a1", "#7c3aed", "#d97706", "#dc2626", "#64748b"];

function fmtTick(n: number): string {
  if (Math.abs(n) >= 1000) return `${Math.round(n / 100) / 10}k`;
  return String(Math.round(n));
}

/** Recharts v3 tooltip formatter (accepts the looser ValueType). */
function rsTooltip(value: unknown): string {
  return formatRs(Number(value ?? 0));
}

export default function AdminDashboard() {
  const [from, setFrom] = useState(isoDate(30));
  const [to, setTo] = useState(isoDate(0));
  const [productId, setProductId] = useState("");
  const [applied, setApplied] = useState({ from: isoDate(30), to: isoDate(0), productId: "" });

  const qs = new URLSearchParams({ from: applied.from, to: applied.to });
  if (applied.productId) qs.set("productId", applied.productId);
  const { data, loading, error } = useApi<DashboardStats>(`/api/dashboard/stats?${qs}`);

  const products = useApi<{ items?: Product[] } | Product[]>("/api/products");

  const k = data?.kpis;
  const netTone = (k?.net ?? 0) >= 0 ? "green" : "red";
  const lowStockCount = k?.lowStock?.length ?? 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Business performance at a glance"
        actions={
          <>
            <Field label="From">
              <TextInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="To">
              <TextInput type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
            <Field label="Product">
              <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">All products</option>
                {asArray<Product>(products.data).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="self-end pb-0.5">
              <Btn tone="primary" onClick={() => setApplied({ from, to, productId })}>
                Apply
              </Btn>
            </div>
          </>
        }
      />

      {error && <ApiErrorNote error={error} />}
      {loading && <Loading />}

      {!loading && !error && k && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Revenue (delivered)" value={formatRs(k.revenue)} sub={`Collected: ${formatRs(k.collected)}`} />
            <StatCard label="Expenses" value={formatRs(k.expenses)} />
            <StatCard
              label="Net P&L"
              value={formatRs(k.net)}
              tone={netTone}
              sub={applied.productId ? "Selected product" : "All products"}
            />
            <StatCard label="Orders delivered" value={String(k.deliveredOrders)} />
            <StatCard label="Pipeline value" value={formatRs(k.pipelineValue)} sub="Unfulfilled orders" />
            <StatCard label="Invested" value={formatRs(k.invested)} />
            <StatCard label="Visitors" value={Number(k.visitors).toLocaleString("en-PK")} />
            <StatCard
              label="Low stock"
              value={String(lowStockCount)}
              tone={lowStockCount > 0 ? "warn" : "default"}
              sub={lowStockCount > 0 ? "Needs attention" : "All stocked"}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card title="Revenue vs expenses">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.series.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={24} />
                    <YAxis tickFormatter={fmtTick} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={rsTooltip} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#0f766e" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#dc2626" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Visitor trend">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.visitors}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={24} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="views" name="Views" stroke="#0369a1" fill="#bae6fd" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Profit per product">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.profitByProduct}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} dy={10} height={52} />
                    <YAxis tickFormatter={fmtTick} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={rsTooltip} />
                    <Bar dataKey="net" name="Net">
                      {data.profitByProduct.map((p, i) => (
                        <Cell key={i} fill={p.net >= 0 ? "#0f766e" : "#dc2626"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Order funnel">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.funnel}
                      dataKey="count"
                      nameKey="status"
                      outerRadius={90}
                    >
                      {data.funnel.map((f, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card
            title="Low stock alerts"
            action={
              <span className="text-xs text-slate-500">
                Threshold set per product (lowStockLevel)
              </span>
            }
          >
            {!k.lowStock || k.lowStock.length === 0 ? (
              <div className="text-sm text-slate-500">No low-stock products right now.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-2 pr-4">Product</th>
                      <th className="py-2 pr-4">SKU</th>
                      <th className="py-2 pr-4 text-right">Stock</th>
                      <th className="py-2 text-right">Threshold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {k.lowStock.map((p) => (
                      <tr key={p.id} className="border-t border-slate-100">
                        <td className="py-2 pr-4 font-medium text-slate-900">{p.name}</td>
                        <td className="py-2 pr-4 text-slate-500">{p.sku ?? "—"}</td>
                        <td className="py-2 pr-4 text-right font-bold text-amber-600">
                          {p.stockQty}
                        </td>
                        <td className="py-2 text-right text-slate-500">{p.lowStockLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

