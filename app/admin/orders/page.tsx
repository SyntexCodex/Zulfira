"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fmtDateTime, useApi } from "../_components/api";
import type { Order } from "../_components/types";
import {
  ApiErrorNote,
  Btn,
  Card,
  Field,
  Loading,
  PageHeader,
  Pagination,
  Select,
  StatusPill,
  TextInput,
} from "../_components/ui";

const LIMIT = 20;
const STATUSES = ["", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "RETURNED", "CANCELLED"];
const PAYMENTS = ["", "COD", "ONLINE"];

interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [f, setF] = useState({ status: "", q: "", from: "", to: "", payment: "" });
  const [applied, setApplied] = useState(f);
  const [page, setPage] = useState(1);

  const qs = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (applied.status) qs.set("status", applied.status);
  if (applied.q) qs.set("q", applied.q);
  if (applied.from) qs.set("from", applied.from);
  if (applied.to) qs.set("to", applied.to);
  if (applied.payment) qs.set("payment", applied.payment);

  const { data, loading, error } = useApi<OrdersResponse>(`/api/orders?${qs}`);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  function apply() {
    setApplied(f);
    setPage(1);
  }

  const itemCount = (o: Order) =>
    o.itemsCount ?? o.items?.reduce((s, i) => s + (i.qty ?? 0), 0) ?? 0;

  return (
    <div>
      <PageHeader title="Orders" subtitle="Order pipeline and fulfilment" />

      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <Field label="Status">
            <Select value={f.status} onChange={set("status")}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "" ? "All" : s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Search">
            <TextInput
              value={f.q}
              onChange={set("q")}
              placeholder="Order no, name, phone…"
              onKeyDown={(e) => e.key === "Enter" && apply()}
            />
          </Field>
          <Field label="Payment">
            <Select value={f.payment} onChange={set("payment")}>
              {PAYMENTS.map((p) => (
                <option key={p} value={p}>
                  {p === "" ? "All" : p}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="From">
            <TextInput type="date" value={f.from} onChange={set("from")} />
          </Field>
          <Field label="To">
            <TextInput type="date" value={f.to} onChange={set("to")} />
          </Field>
          <div className="self-end pb-0.5">
            <Btn tone="primary" onClick={apply} className="w-full">
              Filter
            </Btn>
          </div>
        </div>
      </Card>

      {error && <ApiErrorNote error={error} />}
      {loading && <Loading />}

      {!loading && !error && data && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-4">Order</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">City</th>
                  <th className="py-2 pr-4 text-right">Items</th>
                  <th className="py-2 pr-4 text-right">Total</th>
                  <th className="py-2 pr-4">Payment</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr
                    key={o.id}
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                    onClick={() => router.push(`/admin/orders/${o.id}`)}
                  >
                    <td className="py-2.5 pr-4 font-semibold text-slate-900">{o.orderNo}</td>
                    <td className="py-2.5 pr-4 text-slate-500">{fmtDateTime(o.createdAt)}</td>
                    <td className="py-2.5 pr-4 text-slate-800">
                      {o.customerName || o.name || "—"}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-500">{o.city || "—"}</td>
                    <td className="py-2.5 pr-4 text-right">{itemCount(o)}</td>
                    <td className="py-2.5 pr-4 text-right font-medium">
                      Rs {Number(o.total).toLocaleString("en-PK")}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-500">
                      {(o.payment || o.paymentMethod || "—").toUpperCase()}
                    </td>
                    <td className="py-2.5">
                      <StatusPill status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.orders.length === 0 && (
            <div className="py-6 text-center text-sm text-slate-500">No orders found.</div>
          )}
          <Pagination page={data.page ?? page} total={data.total ?? 0} limit={LIMIT} onPage={setPage} />
        </Card>
      )}
    </div>
  );
}

