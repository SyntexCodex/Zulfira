"use client";

import { useState } from "react";
import {
  asArray,
  formatRs,
  isoDate,
  useApi,
} from "../_components/api";
import type { GlobalPnl, Product, ProductPnl } from "../_components/types";
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
} from "../_components/ui";

function PnlRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2 text-sm last:border-0">
      <dt className={`text-slate-600 ${bold ? "font-semibold text-slate-800" : ""}`}>{label}</dt>
      <dd className={`text-slate-900 ${bold ? "font-bold" : ""}`}>{value}</dd>
    </div>
  );
}

function isGlobal(d: ProductPnl | GlobalPnl | null): d is GlobalPnl {
  return !!d && "products" in d;
}

export default function AdminReportsPage() {
  const [productId, setProductId] = useState("");
  const [from, setFrom] = useState(isoDate(30));
  const [to, setTo] = useState(isoDate(0));
  const [applied, setApplied] = useState({ productId: "", from: isoDate(30), to: isoDate(0) });

  const products = useApi<Product[] | { items: Product[] }>("/api/products");
  const productList = asArray<Product>(products.data);

  const qs = new URLSearchParams({ from: applied.from, to: applied.to });
  if (applied.productId) qs.set("productId", applied.productId);
  const { data, loading, error } = useApi<ProductPnl | GlobalPnl>(`/api/reports/pnl?${qs}`);

  const csvUrl = `/api/reports/pnl?${qs}&format=csv`;

  function renderPnl(p: ProductPnl) {
    return (
      <Card title={`P&L — ${p.productName}`}>
        <dl>
          <PnlRow label="Invested" value={formatRs(p.invested)} />
          <PnlRow label="Revenue (delivered items)" value={formatRs(p.revenue)} />
          <PnlRow label="Delivery charges collected" value={formatRs(p.deliveryCollected)} />
          <PnlRow label="Discounts given" value={formatRs(-p.discounts)} />
          <PnlRow label="Collected (revenue + delivery − discounts)" value={formatRs(p.collected)} />
          <PnlRow label="Direct expenses (product-linked)" value={formatRs(-p.expensesDirect)} />
          {Object.entries(p.expensesByCategory ?? {}).map(([cat, amt]) => (
            <PnlRow key={cat} label={`&nbsp;&nbsp;· ${cat.replaceAll("_", " ")}`} value={formatRs(-amt)} />
          ))}
          <PnlRow label="General expenses allocated" value={formatRs(-p.expensesGeneralAllocated)} />
          <PnlRow label="Total expenses" value={formatRs(-p.expensesTotal)} />
          <PnlRow label="Returns loss" value={formatRs(-p.returnsLoss)} />
          <PnlRow
            label="NET P&L"
            value={formatRs(p.net)}
            bold
          />
          <PnlRow label="Operating profit (excl. invested)" value={formatRs(p.operatingProfit)} />
          <PnlRow
            label="Margin %"
            value={p.marginPct == null ? "—" : `${p.marginPct.toFixed(1)}%`}
          />
          <PnlRow label="ROI %" value={p.roiPct == null ? "—" : `${p.roiPct.toFixed(1)}%`} />
          <PnlRow
            label="Break-even units"
            value={p.breakEvenUnits == null ? "—" : String(p.breakEvenUnits)}
          />
        </dl>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Delivered units" value={String(p.deliveredUnits)} />
          <StatCard label="Delivered orders" value={String(p.deliveredOrders)} />
          <StatCard label="Returned units" value={String(p.returnedUnits)} />
          <StatCard label="Pipeline value" value={formatRs(p.pipelineValue)} />
        </div>

        <h3 className="mt-6 mb-2 text-sm font-semibold text-slate-800">Investor payouts</h3>
        {p.investors.length === 0 ? (
          <div className="text-sm text-slate-500">No investors allocated to this product.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-4">Investor</th>
                  <th className="py-2 pr-4 text-right">Invested</th>
                  <th className="py-2 pr-4 text-right">Share %</th>
                  <th className="py-2 text-right">Payout (net × share)</th>
                </tr>
              </thead>
              <tbody>
                {p.investors.map((i) => (
                  <tr key={i.investorId} className="border-t border-slate-100">
                    <td className="py-2.5 pr-4 font-medium text-slate-900">{i.name}</td>
                    <td className="py-2.5 pr-4 text-right">{formatRs(i.amountInvested)}</td>
                    <td className="py-2.5 pr-4 text-right">{i.sharePct}%</td>
                    <td
                      className={`py-2.5 text-right font-semibold ${i.payout >= 0 ? "text-emerald-700" : "text-red-600"}`}
                    >
                      {formatRs(i.payout)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Profit & loss statement"
        actions={
          <>
            <Field label="Product">
              <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">All products</option>
                {productList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="From">
              <TextInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="To">
              <TextInput type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
            <div className="flex items-end gap-2 pb-0.5">
              <Btn tone="primary" onClick={() => setApplied({ productId, from, to })}>
                Apply
              </Btn>
              <a
                href={csvUrl}
                download
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Download CSV
              </a>
            </div>
          </>
        }
      />

      {error && <ApiErrorNote error={error} />}
      {loading && <Loading />}

      {!loading && !error && data && (
        <div className="space-y-6">
          {isGlobal(data) ? (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Total invested" value={formatRs(data.totals.invested)} />
                <StatCard label="Total expenses" value={formatRs(data.totals.expenses)} />
                <StatCard label="Total collected" value={formatRs(data.totals.collected)} />
                <StatCard
                  label="Total NET"
                  value={formatRs(data.totals.net)}
                  tone={data.totals.net >= 0 ? "green" : "red"}
                />
                <StatCard label="Revenue" value={formatRs(data.totals.revenue)} />
                <StatCard label="Returns loss" value={formatRs(data.totals.returnsLoss)} />
                <StatCard label="Delivered orders" value={String(data.totals.deliveredOrders)} />
                <StatCard label="Pipeline value" value={formatRs(data.totals.pipelineValue)} />
              </div>
              <Card title="Per-product breakdown">
                {data.products.length === 0 ? (
                  <div className="py-4 text-sm text-slate-500">No products with activity in this range.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                          <th className="py-2 pr-4">Product</th>
                          <th className="py-2 pr-4 text-right">Invested</th>
                          <th className="py-2 pr-4 text-right">Expenses</th>
                          <th className="py-2 pr-4 text-right">Collected</th>
                          <th className="py-2 pr-4 text-right">Returns loss</th>
                          <th className="py-2 pr-4 text-right">Margin %</th>
                          <th className="py-2 text-right">Net</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.products.map((p) => (
                          <tr key={p.productId} className="border-t border-slate-100">
                            <td className="py-2.5 pr-4 font-medium text-slate-900">{p.productName}</td>
                            <td className="py-2.5 pr-4 text-right">{formatRs(p.invested)}</td>
                            <td className="py-2.5 pr-4 text-right">{formatRs(p.expensesTotal)}</td>
                            <td className="py-2.5 pr-4 text-right">{formatRs(p.collected)}</td>
                            <td className="py-2.5 pr-4 text-right">{formatRs(p.returnsLoss)}</td>
                            <td className="py-2.5 pr-4 text-right">
                              {p.marginPct == null ? "—" : `${p.marginPct.toFixed(1)}%`}
                            </td>
                            <td
                              className={`py-2.5 text-right font-bold ${p.net >= 0 ? "text-emerald-700" : "text-red-600"}`}
                            >
                              {formatRs(p.net)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </>
          ) : (
            renderPnl(data)
          )}

          <AdminNote>
            <span className="font-semibold">Allocation rule:</span> expenses linked to a product
            count against that product directly. General (product-less) expenses are allocated to
            each product by its share of delivered revenue in the period — or split equally across
            active products when there is no delivered revenue yet. NET = collected (delivered
            items + delivery charges − discounts) − invested − expenses − returns loss.
          </AdminNote>
        </div>
      )}
    </div>
  );
}
