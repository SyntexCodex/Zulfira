"use client";

import { useState } from "react";
import {
  ApiError,
  asArray,
  fetchJson,
  formatRs,
  fmtDate,
  useApi,
} from "../_components/api";
import type { Investment, Investor, Product, ProductInvestor } from "../_components/types";
import {
  AdminNote,
  ApiErrorNote,
  Btn,
  Card,
  Field,
  Loading,
  Modal,
  PageHeader,
  Select,
  TextArea,
  TextInput,
} from "../_components/ui";

export default function AdminInvestorsPage() {
  const investors = useApi<Investor[] | { items: Investor[] }>("/api/investors");
  const products = useApi<Product[] | { items: Product[] }>("/api/products");
  const tranches = useApi<Investment[] | { items: Investment[] }>("/api/investments");

  const investorList = asArray<Investor>(investors.data);
  const productList = asArray<Product>(products.data);
  const trancheList = asArray<Investment>(tranches.data);

  return (
    <div className="space-y-8">
      <PageHeader title="Investors" subtitle="Capital, profit-share allocation and tranches" />
      <InvestorCrud investors={investorList} loading={investors.loading} error={investors.error} reload={investors.reload} />
      <Allocation products={productList} investors={investorList} />
      <Tranches tranches={trancheList} loading={tranches.loading} error={tranches.error} reload={tranches.reload} products={productList} investors={investorList} />
    </div>
  );
}

/* ================= (a) investors CRUD ================= */
function InvestorCrud({
  investors,
  loading,
  error,
  reload,
}: {
  investors: Investor[];
  loading: boolean;
  error: ApiError | null;
  reload: () => void;
}) {
  const [modal, setModal] = useState<{ open: boolean; inv?: Investor }>({ open: false });
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  function open(inv?: Investor) {
    setForm({
      name: inv?.name ?? "",
      phone: inv?.phone ?? "",
      email: inv?.email ?? "",
      notes: inv?.notes ?? "",
    });
    setFormErr(null);
    setModal({ open: true, inv });
  }

  async function save() {
    if (!form.name.trim()) return setFormErr("Name is required.");
    setSaving(true);
    setFormErr(null);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        notes: form.notes.trim() || null,
      };
      if (modal.inv) {
        await fetchJson(`/api/investors/${modal.inv.id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await fetchJson("/api/investors", { method: "POST", body: JSON.stringify(payload) });
      }
      setModal({ open: false });
      reload();
    } catch (e) {
      setFormErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove(inv: Investor) {
    if (!window.confirm(`Delete investor "${inv.name}"?`)) return;
    await fetchJson(`/api/investors/${inv.id}`, { method: "DELETE" }).catch(() => {});
    reload();
  }

  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <Card
      title="Investors"
      action={
        <Btn tone="primary" onClick={() => open()}>
          + Add investor
        </Btn>
      }
    >
      {error && <ApiErrorNote error={error} />}
      {loading && <Loading />}
      {!loading && !error && (
        <>
          {investors.length === 0 ? (
            <div className="py-4 text-sm text-slate-500">No investors yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Phone</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Notes</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {investors.map((inv) => (
                    <tr key={inv.id} className="border-t border-slate-100">
                      <td className="py-2.5 pr-4 font-medium text-slate-900">{inv.name}</td>
                      <td className="py-2.5 pr-4 text-slate-500">{inv.phone || "—"}</td>
                      <td className="py-2.5 pr-4 text-slate-500">{inv.email || "—"}</td>
                      <td className="py-2.5 pr-4 text-slate-500">{inv.notes || "—"}</td>
                      <td className="py-2.5 text-right">
                        <div className="flex justify-end gap-2">
                          <Btn tone="ghost" onClick={() => open(inv)}>Edit</Btn>
                          <Btn tone="danger" onClick={() => remove(inv)}>Delete</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {modal.open && (
        <Modal title={modal.inv ? "Edit investor" : "Add investor"} onClose={() => setModal({ open: false })}>
          {formErr && (
            <div className="mb-4">
              <AdminNote tone="error">{formErr}</AdminNote>
            </div>
          )}
          <div className="space-y-4">
            <Field label="Name *">
              <TextInput value={form.name} onChange={setF("name")} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone">
                <TextInput value={form.phone} onChange={setF("phone")} />
              </Field>
              <Field label="Email">
                <TextInput type="email" value={form.email} onChange={setF("email")} />
              </Field>
            </div>
            <Field label="Notes">
              <TextArea value={form.notes} onChange={setF("notes")} />
            </Field>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Btn tone="ghost" onClick={() => setModal({ open: false })}>Cancel</Btn>
            <Btn tone="primary" disabled={saving} onClick={save}>
              {saving ? "Saving…" : "Save"}
            </Btn>
          </div>
        </Modal>
      )}
    </Card>
  );
}

/* ================= (b) per-product allocation ================= */
interface AllocRow {
  linkId?: string;
  investorId: string;
  name: string;
  pct: string;
}

function Allocation({ products, investors }: { products: Product[]; investors: Investor[] }) {
  const [productId, setProductId] = useState("");
  const [rows, setRows] = useState<AllocRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [addId, setAddId] = useState("");

  const product = products.find((p) => p.id === productId);

  async function load(pid: string) {
    setProductId(pid);
    if (!pid) {
      setRows([]);
      setLoaded(false);
      return;
    }
    setErr(null);
    try {
      const raw = await fetchJson<unknown>(`/api/product-investors?productId=${pid}`);
      const links = asArray<ProductInvestor>(raw);
      setRows(
        links.map((l) => ({
          linkId: l.id,
          investorId: l.investorId,
          name: l.investor?.name ?? investors.find((i) => i.id === l.investorId)?.name ?? "—",
          pct: String(l.profitSharePct ?? 0),
        }))
      );
      setLoaded(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  const total = rows.reduce((s, r) => s + (Number(r.pct) || 0), 0);
  const unlinked = investors.filter((i) => !rows.some((r) => r.investorId === i.id));

  function addInvestor() {
    if (!addId) return;
    const inv = investors.find((i) => i.id === addId);
    if (!inv) return;
    setRows((prev) => [...prev, { investorId: inv.id, name: inv.name, pct: "0" }]);
    setAddId("");
  }

  async function save() {
    setErr(null);
    if (Math.abs(total - 100) > 0.001) {
      setErr(`Shares must total exactly 100% (currently ${total.toFixed(2)}%).`);
      return;
    }
    if (rows.some((r) => Number.isNaN(Number(r.pct)) || Number(r.pct) < 0)) {
      setErr("All percentages must be valid non-negative numbers.");
      return;
    }
    setSaving(true);
    try {
      for (const r of rows) {
        if (r.linkId) {
          await fetchJson(`/api/product-investors/${r.linkId}`, {
            method: "PUT",
            body: JSON.stringify({ profitSharePct: Number(r.pct) }),
          });
        } else {
          await fetchJson("/api/product-investors", {
            method: "POST",
            body: JSON.stringify({ productId, investorId: r.investorId, profitSharePct: Number(r.pct) }),
          });
        }
      }
      await load(productId);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function removeRow(r: AllocRow) {
    if (r.linkId) {
      if (!window.confirm(`Remove ${r.name} from this product's allocation?`)) return;
      try {
        await fetchJson(`/api/product-investors/${r.linkId}`, { method: "DELETE" });
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
        return;
      }
    }
    setRows((prev) => prev.filter((x) => x !== r));
  }

  return (
    <Card title="Profit-share allocation (per product)">
      <div className="mb-4 max-w-sm">
        <Field label="Product">
          <Select value={productId} onChange={(e) => load(e.target.value)}>
            <option value="">Select a product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      {productId && !loaded && <Loading label="Loading allocation…" />}
      {err && (
        <div className="mb-4">
          <AdminNote tone="error">{err}</AdminNote>
        </div>
      )}
      {loaded && (
        <div>
          <AdminNote>
            Shares for <b>{product?.name}</b> must total exactly 100% before saving.
          </AdminNote>
          <div className="mt-4 space-y-2">
            {rows.map((r) => (
              <div key={r.investorId} className="flex items-center gap-3">
                <span className="w-48 truncate text-sm font-medium text-slate-800">{r.name}</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={r.pct}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((x) => (x === r ? { ...x, pct: e.target.value } : x))
                    )
                  }
                  className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
                <span className="text-sm text-slate-500">%</span>
                <Btn tone="ghost" onClick={() => removeRow(r)}>
                  Remove
                </Btn>
              </div>
            ))}
            {rows.length === 0 && (
              <div className="text-sm text-slate-500">No investors allocated yet.</div>
            )}
          </div>

          <div className="mt-4 flex max-w-md items-end gap-2">
            <div className="flex-1">
              <Field label="Add investor">
                <Select value={addId} onChange={(e) => setAddId(e.target.value)}>
                  <option value="">Select…</option>
                  {unlinked.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Btn tone="ghost" onClick={addInvestor} disabled={!addId}>
              Add
            </Btn>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div
              className={`text-lg font-bold ${Math.abs(total - 100) < 0.001 ? "text-emerald-700" : "text-red-600"}`}
            >
              Total: {total.toFixed(2)}%
            </div>
            <Btn tone="primary" disabled={saving || Math.abs(total - 100) > 0.001} onClick={save}>
              {saving ? "Saving…" : "Save allocation"}
            </Btn>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ================= (c) investment tranches ================= */
function Tranches({
  tranches,
  loading,
  error,
  reload,
  products,
  investors,
}: {
  tranches: Investment[];
  loading: boolean;
  error: ApiError | null;
  reload: () => void;
  products: Product[];
  investors: Investor[];
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ investorId: "", productId: "", amount: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  async function save() {
    if (!form.investorId || !form.productId) return setFormErr("Investor and product are required.");
    const amount = Number(form.amount);
    if (Number.isNaN(amount) || amount <= 0) return setFormErr("Amount must be a positive number.");
    setSaving(true);
    setFormErr(null);
    try {
      await fetchJson("/api/investments", {
        method: "POST",
        body: JSON.stringify({
          investorId: form.investorId,
          productId: form.productId,
          amount,
          notes: form.notes.trim() || undefined,
        }),
      });
      setOpen(false);
      setForm({ investorId: "", productId: "", amount: "", notes: "" });
      reload();
    } catch (e) {
      setFormErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  const invName = (t: Investment) =>
    t.investor?.name ?? investors.find((i) => i.id === t.investorId)?.name ?? "—";
  const prodName = (t: Investment) =>
    t.product?.name ?? products.find((p) => p.id === t.productId)?.name ?? "—";

  return (
    <Card
      title="Investment tranches"
      action={
        <Btn tone="primary" onClick={() => { setFormErr(null); setOpen(true); }}>
          + Record investment
        </Btn>
      }
    >
      {error && <ApiErrorNote error={error} />}
      {loading && <Loading />}
      {!loading && !error && (
        <>
          {tranches.length === 0 ? (
            <div className="py-4 text-sm text-slate-500">No investments recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Investor</th>
                    <th className="py-2 pr-4">Product</th>
                    <th className="py-2 pr-4 text-right">Amount</th>
                    <th className="py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {tranches.map((t) => (
                    <tr key={t.id} className="border-t border-slate-100">
                      <td className="py-2.5 pr-4 text-slate-500">{fmtDate(t.investedAt ?? t.createdAt)}</td>
                      <td className="py-2.5 pr-4 font-medium text-slate-900">{invName(t)}</td>
                      <td className="py-2.5 pr-4 text-slate-700">{prodName(t)}</td>
                      <td className="py-2.5 pr-4 text-right font-medium">{formatRs(t.amount)}</td>
                      <td className="py-2.5 text-slate-500">{t.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {open && (
        <Modal title="Record investment" onClose={() => setOpen(false)}>
          {formErr && (
            <div className="mb-4">
              <AdminNote tone="error">{formErr}</AdminNote>
            </div>
          )}
          <div className="space-y-4">
            <Field label="Investor *">
              <Select value={form.investorId} onChange={setF("investorId")}>
                <option value="">Select…</option>
                {investors.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Product *">
              <Select value={form.productId} onChange={setF("productId")}>
                <option value="">Select…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Amount (Rs) *">
              <TextInput type="number" min="0" step="any" value={form.amount} onChange={setF("amount")} />
            </Field>
            <Field label="Notes">
              <TextArea value={form.notes} onChange={setF("notes")} />
            </Field>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Btn tone="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
            <Btn tone="primary" disabled={saving} onClick={save}>
              {saving ? "Saving…" : "Save"}
            </Btn>
          </div>
        </Modal>
      )}
    </Card>
  );
}
