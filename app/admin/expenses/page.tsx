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
import type { Expense, ExpenseCategory, Product } from "../_components/types";
import {
  AdminNote,
  ApiErrorNote,
  Btn,
  Card,
  Field,
  Loading,
  Modal,
  PageHeader,
  Pagination,
  Select,
  TextArea,
  TextInput,
} from "../_components/ui";

const CATEGORIES: ExpenseCategory[] = [
  "RAW_MATERIAL",
  "PACKAGING",
  "DELIVERY",
  "MARKETING",
  "SALARY",
  "UTILITIES",
  "OTHER",
];

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  RAW_MATERIAL: "Raw material",
  PACKAGING: "Packaging",
  DELIVERY: "Delivery",
  MARKETING: "Marketing",
  SALARY: "Salary",
  UTILITIES: "Utilities",
  OTHER: "Other",
};

const LIMIT = 50;

interface FormState {
  category: ExpenseCategory;
  productId: string; // "" = general
  amount: string;
  date: string;
  note: string;
}

const EMPTY: FormState = {
  category: "OTHER",
  productId: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

export default function AdminExpensesPage() {
  const [f, setF] = useState({ category: "", productId: "", from: "", to: "" });
  const [applied, setApplied] = useState(f);
  const [page, setPage] = useState(1);

  const qs = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (applied.category) qs.set("category", applied.category);
  if (applied.productId) qs.set("productId", applied.productId);
  if (applied.from) qs.set("from", applied.from);
  if (applied.to) qs.set("to", applied.to);

  const { data, loading, error, reload } = useApi<{ items?: Expense[]; total?: number } | Expense[]>(
    `/api/expenses?${qs}`
  );
  const products = useApi<Product[] | { items: Product[] }>("/api/products");

  const expenses = asArray<Expense>(data);
  const productList = asArray<Product>(products.data);
  const total = Array.isArray(data) ? data.length : (data?.total ?? expenses.length);

  const [modal, setModal] = useState<{ open: boolean; exp?: Expense }>({ open: false });
  const [form, setForm] = useState<FormState>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  function apply() {
    setApplied(f);
    setPage(1);
  }

  function open(exp?: Expense) {
    setForm(
      exp
        ? {
            category: exp.category,
            productId: exp.productId ?? "",
            amount: String(exp.amount),
            date: (exp.date ?? "").slice(0, 10),
            note: exp.note ?? "",
          }
        : { ...EMPTY }
    );
    setFormErr(null);
    setModal({ open: true, exp });
  }

  const setF2 = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  async function save() {
    const amount = Number(form.amount);
    if (Number.isNaN(amount) || amount <= 0) return setFormErr("Amount must be a positive number.");
    if (!form.date) return setFormErr("Date is required.");
    setSaving(true);
    setFormErr(null);
    try {
      const payload = {
        category: form.category,
        productId: form.productId || null,
        amount,
        date: form.date,
        note: form.note.trim() || undefined,
      };
      if (modal.exp) {
        await fetchJson(`/api/expenses/${modal.exp.id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await fetchJson("/api/expenses", { method: "POST", body: JSON.stringify(payload) });
      }
      setModal({ open: false });
      reload();
    } catch (e) {
      setFormErr(e instanceof ApiError ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!modal.exp) return;
    if (!window.confirm("Delete this expense?")) return;
    setDeleting(true);
    try {
      await fetchJson(`/api/expenses/${modal.exp.id}`, { method: "DELETE" });
      setModal({ open: false });
      reload();
    } catch (e) {
      setFormErr(e instanceof ApiError ? e.message : String(e));
    } finally {
      setDeleting(false);
    }
  }

  const prodName = (e: Expense) =>
    e.product?.name ?? productList.find((p) => p.id === e.productId)?.name ?? "General";

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Business spending, linked to products or general"
        actions={
          <Btn tone="primary" onClick={() => open()}>
            + Add expense
          </Btn>
        }
      />

      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Field label="Category">
            <Select value={f.category} onChange={set("category")}>
              <option value="">All</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Product">
            <Select value={f.productId} onChange={set("productId")}>
              <option value="">All (incl. general)</option>
              <option value="general">General only</option>
              {productList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
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

      {!loading && !error && (
        <Card>
          {expenses.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-500">No expenses found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Product</th>
                    <th className="py-2 pr-4 text-right">Amount</th>
                    <th className="py-2">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr
                      key={e.id}
                      className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                      onClick={() => open(e)}
                    >
                      <td className="py-2.5 pr-4 text-slate-500">{fmtDate(e.date)}</td>
                      <td className="py-2.5 pr-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {CATEGORY_LABELS[e.category] ?? e.category}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-700">{prodName(e)}</td>
                      <td className="py-2.5 pr-4 text-right font-medium">{formatRs(e.amount)}</td>
                      <td className="py-2.5 text-slate-500">{e.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={page} total={total} limit={LIMIT} onPage={setPage} />
        </Card>
      )}

      {modal.open && (
        <Modal title={modal.exp ? "Edit expense" : "Add expense"} onClose={() => setModal({ open: false })}>
          {formErr && (
            <div className="mb-4">
              <AdminNote tone="error">{formErr}</AdminNote>
            </div>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category *">
                <Select value={form.category} onChange={setF2("category")}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Product" hint="Empty = general expense">
                <Select value={form.productId} onChange={setF2("productId")}>
                  <option value="">General</option>
                  {productList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Amount (Rs) *">
                <TextInput type="number" min="0" step="any" value={form.amount} onChange={setF2("amount")} />
              </Field>
              <Field label="Date *">
                <TextInput type="date" value={form.date} onChange={setF2("date")} />
              </Field>
            </div>
            <Field label="Note">
              <TextArea value={form.note} onChange={setF2("note")} />
            </Field>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div>
              {modal.exp && (
                <Btn tone="danger" disabled={deleting || saving} onClick={remove}>
                  {deleting ? "Deleting…" : "Delete"}
                </Btn>
              )}
            </div>
            <div className="flex gap-2">
              <Btn tone="ghost" onClick={() => setModal({ open: false })}>
                Cancel
              </Btn>
              <Btn tone="primary" disabled={saving} onClick={save}>
                {saving ? "Saving…" : "Save"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
