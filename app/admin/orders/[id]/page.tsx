"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchJson, fmtDateTime, useApi } from "../../_components/api";
import type { Order, OrderStatus } from "../../_components/types";
import { useAuth } from "../../_components/auth";
import {
  AdminNote,
  ApiErrorNote,
  Btn,
  Card,
  Field,
  Loading,
  PageHeader,
  StatusPill,
  TextArea,
  TextInput,
} from "../../_components/ui";
const TERMINAL: OrderStatus[] = ["DELIVERED", "RETURNED", "CANCELLED"];

function nextActions(status: OrderStatus): { label: string; to: OrderStatus; needsReason: boolean }[] {
  switch (status) {
    case "PENDING":
      return [
        { label: "Confirm", to: "CONFIRMED", needsReason: false },
        { label: "Cancel", to: "CANCELLED", needsReason: true },
      ];
    case "CONFIRMED":
      return [
        { label: "Ship", to: "SHIPPED", needsReason: false },
        { label: "Cancel", to: "CANCELLED", needsReason: true },
      ];
    case "SHIPPED":
      return [
        { label: "Deliver", to: "DELIVERED", needsReason: false },
        { label: "Return", to: "RETURNED", needsReason: true },
      ];
    case "DELIVERED":
      return [{ label: "Return", to: "RETURNED", needsReason: true }];
    default:
      return [];
  }
}

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { session } = useAuth();
  const { data: order, loading, error, reload } = useApi<Order>(`/api/orders/${id}`);

  const [busy, setBusy] = useState(false);
  const [actionErr, setActionErr] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    label: string;
    to: OrderStatus;
    needsReason: boolean;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  async function runStatus() {
    if (!pendingAction || !order) return;
    if (pendingAction.needsReason && !reason.trim()) {
      setActionErr("Please enter a reason.");
      return;
    }
    setBusy(true);
    setActionErr(null);
    try {
      await fetchJson(`/api/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: pendingAction.to,
          ...(pendingAction.needsReason ? { reason: reason.trim() } : {}),
          ...(pendingAction.to === "SHIPPED"
            ? {
                ...(courierName.trim() ? { courierName: courierName.trim() } : {}),
                ...(trackingNumber.trim() ? { trackingNumber: trackingNumber.trim() } : {}),
              }
            : {}),
        }),
      });
      setPendingAction(null);
      setReason("");
      setCourierName("");
      setTrackingNumber("");
      reload();
    } catch (e) {
      setActionErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function deleteOrder() {
    if (!order) return;
    if (!window.confirm(`Delete order ${order.orderNo}? This cannot be undone.`)) return;
    setBusy(true);
    setActionErr(null);
    try {
      await fetchJson(`/api/orders/${id}`, { method: "DELETE" });
      router.push("/admin/orders");
    } catch (e) {
      setActionErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const timeline = order?.timeline ?? order?.history ?? [];

  return (
    <div>
      <PageHeader
        title={order ? `Order ${order.orderNo}` : "Order detail"}
        subtitle={order ? fmtDateTime(order.createdAt) : undefined}
        actions={
          <Btn tone="ghost" onClick={() => router.push("/admin/orders")}>
            ← All orders
          </Btn>
        }
      />

      {error && <ApiErrorNote error={error} />}
      {loading && <Loading />}

      {!loading && !error && order && (
        <div className="space-y-6">
          {actionErr && <AdminNote tone="error">{actionErr}</AdminNote>}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card title="Customer">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Name</dt>
                  <dd className="font-medium text-slate-900">{order.customerName || order.name || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Phone</dt>
                  <dd className="text-slate-900">{order.phone || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">City</dt>
                  <dd className="text-slate-900">{order.city || "—"}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-slate-500">Address</dt>
                  <dd className="text-slate-900">{order.address || "—"}</dd>
                </div>
                {order.notes && (
                  <div>
                    <dt className="mb-1 text-slate-500">Notes</dt>
                    <dd className="text-slate-900">{order.notes}</dd>
                  </div>
                )}
              </dl>
            </Card>

            <Card title="Totals">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Subtotal</dt>
                  <dd className="text-slate-900">Rs {Number(order.subtotal ?? 0).toLocaleString("en-PK")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Delivery</dt>
                  <dd className="text-slate-900">Rs {Number(order.deliveryCharge ?? 0).toLocaleString("en-PK")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Discount</dt>
                  <dd className="text-slate-900">Rs {Number(order.discount ?? 0).toLocaleString("en-PK")}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base">
                  <dt className="font-semibold text-slate-700">Total</dt>
                  <dd className="font-bold text-slate-900">Rs {Number(order.total).toLocaleString("en-PK")}</dd>
                </div>
                <div className="flex justify-between pt-1">
                  <dt className="text-slate-500">Payment</dt>
                  <dd className="text-slate-900">{(order.payment || order.paymentMethod || "—").toUpperCase()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Status</dt>
                  <dd>
                    <StatusPill status={order.status} />
                  </dd>
                </div>
                {(order.courierName || order.trackingNumber) && (
                  <>
                    <div className="flex justify-between border-t border-slate-200 pt-2">
                      <dt className="text-slate-500">Courier</dt>
                      <dd className="font-medium text-slate-900">{order.courierName || "—"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Tracking #</dt>
                      <dd className="font-medium text-slate-900">{order.trackingNumber || "—"}</dd>
                    </div>
                  </>
                )}
              </dl>
            </Card>

            <Card title="Status actions">
              {TERMINAL.includes(order.status) ? (
                <div className="text-sm text-slate-500">
                  This order is <b>{order.status}</b> — a terminal state. No further actions.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {nextActions(order.status).map((a) => (
                    <Btn
                      key={a.to}
                      tone={a.to === "CANCELLED" || a.to === "RETURNED" ? "danger" : "primary"}
                      disabled={busy}
                      onClick={() => {
                        setPendingAction(a);
                        setReason("");
                        setActionErr(null);
                      }}
                    >
                      {a.label}
                    </Btn>
                  ))}
                </div>
              )}
              {pendingAction && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 text-sm font-medium text-slate-800">
                    {pendingAction.label} this order?
                  </div>
                  {pendingAction.needsReason && (
                    <Field label="Reason (required)">
                      <TextArea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. customer refused delivery" />
                    </Field>
                  )}
                  {pendingAction.to === "SHIPPED" && (
                    <>
                      <Field label="Delivery partner">
                        <TextInput
                          value={courierName}
                          onChange={(e) => setCourierName(e.target.value)}
                          placeholder="e.g. TCS, Leopards, PostEx"
                        />
                      </Field>
                      <Field label="Tracking number">
                        <TextInput
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="e.g. 1234567890"
                        />
                      </Field>
                    </>
                  )}
                  <div className="mt-3 flex gap-2">
                    <Btn
                      tone={pendingAction.to === "CANCELLED" || pendingAction.to === "RETURNED" ? "danger" : "primary"}
                      disabled={busy}
                      onClick={runStatus}
                    >
                      {busy ? "Working…" : `Confirm ${pendingAction.label}`}
                    </Btn>
                    <Btn tone="ghost" disabled={busy} onClick={() => setPendingAction(null)}>
                      Back
                    </Btn>
                  </div>
                </div>
              )}
              {session?.role === "OWNER" && (
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <Btn tone="danger" disabled={busy} onClick={deleteOrder}>
                    Delete order
                  </Btn>
                  <p className="mt-1 text-xs text-slate-400">Owner only. Permanent.</p>
                </div>
              )}
            </Card>
          </div>

          <Card title="Items">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Product</th>
                    <th className="py-2 pr-4 text-right">Qty</th>
                    <th className="py-2 pr-4 text-right">Unit price</th>
                    <th className="py-2 text-right">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items ?? []).map((it, i) => (
                    <tr key={it.id ?? i} className="border-t border-slate-100">
                      <td className="py-2.5 pr-4 font-medium text-slate-900">
                        {it.productName || it.name || it.productId || "—"}
                      </td>
                      <td className="py-2.5 pr-4 text-right">{it.qty}</td>
                      <td className="py-2.5 pr-4 text-right">
                        Rs {Number(it.unitPrice).toLocaleString("en-PK")}
                      </td>
                      <td className="py-2.5 text-right font-medium">
                        Rs {(Number(it.unitPrice) * (it.qty ?? 0)).toLocaleString("en-PK")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {timeline.length > 0 && (
            <Card title="Status timeline">
              <ol className="space-y-3">
                {timeline.map((ev, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5">
                      <StatusPill status={ev.status} />
                    </span>
                    <span className="text-slate-500">{fmtDateTime(ev.at ?? ev.createdAt)}</span>
                    {ev.reason && <span className="text-slate-700">— {ev.reason}</span>}
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
