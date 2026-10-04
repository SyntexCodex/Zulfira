"use client";

import { useState } from "react";
import { asArray, fetchJson, useApi } from "../_components/api";
import type { Product } from "../_components/types";
import {
  AdminNote,
  ApiErrorNote,
  Btn,
  Card,
  Field,
  Loading,
  Modal,
  PageHeader,
  TextInput,
} from "../_components/ui";

interface ProductForm {
  name: string;
  slug: string;
  sku: string;
  tagline: string;
  size: string;
  salePrice: string;
  compareAt: string;
  unitCost: string;
  stockQty: string;
  lowStockLevel: string;
  image: string;
  isActive: boolean;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  slug: "",
  sku: "",
  tagline: "",
  size: "",
  salePrice: "",
  compareAt: "",
  unitCost: "",
  stockQty: "",
  lowStockLevel: "10",
  image: "",
  isActive: true,
};

function toForm(p?: Product): ProductForm {
  if (!p) return { ...EMPTY_FORM };
  return {
    name: p.name ?? "",
    slug: p.slug ?? "",
    sku: p.sku ?? "",
    tagline: p.tagline ?? "",
    size: p.size ?? "",
    salePrice: String(p.salePrice ?? ""),
    compareAt: p.compareAt != null ? String(p.compareAt) : "",
    unitCost: String(p.unitCost ?? ""),
    stockQty: String(p.stockQty ?? ""),
    lowStockLevel: String(p.lowStockLevel ?? ""),
    image: p.image ?? "",
    isActive: p.isActive ?? true,
  };
}

export default function AdminProductsPage() {
  const { data, loading, error, reload } = useApi<Product[] | { items: Product[] }>(
    "/api/products"
  );
  const [modal, setModal] = useState<{ open: boolean; product?: Product }>({ open: false });
  const [form, setForm] = useState<ProductForm>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const products = asArray<Product>(data);

  function openModal(product?: Product) {
    setForm(toForm(product));
    setFormErr(null);
    setModal({ open: true, product });
  }

  const setF = (k: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  async function save() {
    setFormErr(null);
    if (!form.name.trim()) return setFormErr("Name is required.");
    const num = (v: string) => (v.trim() === "" ? null : Number(v));
    const salePrice = Number(form.salePrice);
    const unitCost = Number(form.unitCost);
    const stockQty = Number(form.stockQty);
    const lowStockLevel = Number(form.lowStockLevel);
    if ([salePrice, unitCost, stockQty, lowStockLevel].some((n) => Number.isNaN(n)))
      return setFormErr("Price, cost, stock and low-stock level must be numbers.");

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        sku: form.sku.trim() || undefined,
        tagline: form.tagline.trim() || null,
        size: form.size.trim() || null,
        salePrice,
        compareAt: num(form.compareAt),
        unitCost,
        stockQty,
        lowStockLevel,
        image: form.image.trim() || null,
        isActive: form.isActive,
      };
      if (modal.product) {
        await fetchJson(`/api/products/${modal.product.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchJson("/api/products", { method: "POST", body: JSON.stringify(payload) });
      }
      setModal({ open: false });
      reload();
    } catch (e) {
      setFormErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(p: Product) {
    setBusyId(p.id);
    try {
      await fetchJson(`/api/products/${p.id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      reload();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(p: Product) {
    if (!window.confirm(`Delete product "${p.name}"?`)) return;
    setBusyId(p.id);
    try {
      await fetchJson(`/api/products/${p.id}`, { method: "DELETE" });
      reload();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Catalog, pricing and stock"
        actions={
          <Btn tone="primary" onClick={() => openModal()}>
            + Add product
          </Btn>
        }
      />

      {error && <ApiErrorNote error={error} />}
      {loading && <Loading />}

      {!loading && !error && (
        <Card>
          {products.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-500">
              No products yet. Add your first product to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">SKU</th>
                    <th className="py-2 pr-4 text-right">Sale price</th>
                    <th className="py-2 pr-4 text-right">Unit cost</th>
                    <th className="py-2 pr-4 text-right">Stock</th>
                    <th className="py-2 pr-4">Active</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const low = p.stockQty <= (p.lowStockLevel ?? 0);
                    return (
                      <tr key={p.id} className="border-t border-slate-100">
                        <td className="py-2.5 pr-4">
                          <div className="font-medium text-slate-900">{p.name}</div>
                          {p.size && <div className="text-xs text-slate-400">{p.size}</div>}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-500">{p.sku || "—"}</td>
                        <td className="py-2.5 pr-4 text-right">
                          Rs {Number(p.salePrice).toLocaleString("en-PK")}
                        </td>
                        <td className="py-2.5 pr-4 text-right text-slate-500">
                          Rs {Number(p.unitCost).toLocaleString("en-PK")}
                        </td>
                        <td
                          className={`py-2.5 pr-4 text-right font-semibold ${low ? "text-amber-600" : ""}`}
                        >
                          {p.stockQty}
                          {low && <span className="ml-1 text-xs">(low)</span>}
                        </td>
                        <td className="py-2.5 pr-4">
                          <button
                            onClick={() => toggleActive(p)}
                            disabled={busyId === p.id}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                              p.isActive ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                            aria-label={p.isActive ? "Deactivate" : "Activate"}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                p.isActive ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="flex justify-end gap-2">
                            <Btn tone="ghost" disabled={busyId === p.id} onClick={() => openModal(p)}>
                              Edit
                            </Btn>
                            <Btn tone="danger" disabled={busyId === p.id} onClick={() => remove(p)}>
                              Delete
                            </Btn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {modal.open && (
        <Modal title={modal.product ? "Edit product" : "Add product"} onClose={() => setModal({ open: false })}>
          {formErr && (
            <div className="mb-4">
              <AdminNote tone="error">{formErr}</AdminNote>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name *">
              <TextInput value={form.name} onChange={setF("name")} />
            </Field>
            <Field label="Slug" hint="Auto from name if empty">
              <TextInput value={form.slug} onChange={setF("slug")} />
            </Field>
            <Field label="SKU">
              <TextInput value={form.sku} onChange={setF("sku")} />
            </Field>
            <Field label="Size">
              <TextInput value={form.size} onChange={setF("size")} placeholder="e.g. 100 ml" />
            </Field>
            <div className="col-span-2">
              <Field label="Tagline">
                <TextInput value={form.tagline} onChange={setF("tagline")} />
              </Field>
            </div>
            <Field label="Sale price *">
              <TextInput type="number" min="0" step="any" value={form.salePrice} onChange={setF("salePrice")} />
            </Field>
            <Field label="Compare-at price" hint="Optional, for discounts">
              <TextInput type="number" min="0" step="any" value={form.compareAt} onChange={setF("compareAt")} />
            </Field>
            <Field label="Unit cost *">
              <TextInput type="number" min="0" step="any" value={form.unitCost} onChange={setF("unitCost")} />
            </Field>
            <Field label="Stock qty *">
              <TextInput type="number" step="1" value={form.stockQty} onChange={setF("stockQty")} />
            </Field>
            <Field label="Low-stock level *">
              <TextInput type="number" step="1" min="0" value={form.lowStockLevel} onChange={setF("lowStockLevel")} />
            </Field>
            <Field label="Image URL">
              <TextInput value={form.image} onChange={setF("image")} placeholder="/images/…" />
            </Field>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.isActive} onChange={setF("isActive")} />
              Active
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Btn tone="ghost" onClick={() => setModal({ open: false })}>
              Cancel
            </Btn>
            <Btn tone="primary" disabled={saving} onClick={save}>
              {saving ? "Saving…" : modal.product ? "Save changes" : "Add product"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
