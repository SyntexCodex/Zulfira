"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../_components/auth";
import {
  ApiError,
  asArray,
  fetchJson,
  fmtDateTime,
  useApi,
} from "../_components/api";
import type { AdminUser } from "../_components/types";
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
  TextInput,
} from "../_components/ui";

const ALERTS = [
  { key: "alert_new_order", label: "New order alert" },
  { key: "alert_low_stock", label: "Low stock alert" },
  { key: "alert_daily_summary", label: "Daily summary" },
  { key: "alert_returns", label: "Return alert" },
] as const;

type Settings = Record<string, string>;

export default function AdminSettingsPage() {
  const { session } = useAuth();
  const settings = useApi<Settings | { settings: Settings }>("/api/settings");
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);

  const raw = settings.data;
  const map: Settings =
    raw && typeof raw === "object" && "settings" in raw
      ? (raw.settings as Settings)
      : ((raw ?? {}) as Settings);

  async function putSettings(patch: Settings, label: string) {
    setSavingKey(label);
    setSaveErr(null);
    setSaveOk(null);
    try {
      await fetchJson("/api/settings", {
        method: "PUT",
        body: JSON.stringify({ settings: patch }),
      });
      setSaveOk(`${label} saved.`);
      settings.reload();
    } catch (e) {
      setSaveErr(e instanceof ApiError ? e.message : String(e));
    } finally {
      setSavingKey(null);
    }
  }

  const isOwner = session?.role === "OWNER";

  // business profile local draft
  const [biz, setBiz] = useState({ business_name: "", whatsapp: "", currency: "" });
  const [bizInit, setBizInit] = useState(false);
  useEffect(() => {
    if (settings.data && !bizInit) {
      setBiz({
        business_name: map.business_name ?? "",
        whatsapp: map.whatsapp ?? "",
        currency: map.currency ?? "Rs",
      });
      setBizInit(true);
    }
  }, [settings.data, bizInit, map.business_name, map.whatsapp, map.currency]);

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" subtitle="Alerts, business profile and staff access" />

      {settings.error && <ApiErrorNote error={settings.error} />}
      {saveErr && <AdminNote tone="error">{saveErr}</AdminNote>}
      {saveOk && <AdminNote>{saveOk}</AdminNote>}

      {settings.loading && <Loading />}

      {!settings.loading && !settings.error && (
        <>
          <Card title="Telegram alerts">
            <p className="mb-4 text-sm text-slate-500">
              Toggle which events post to the connected Telegram chat.
            </p>
            <div className="space-y-3">
              {ALERTS.map((a) => {
                const on = map[a.key] === "1";
                return (
                  <div key={a.key} className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-800">{a.label}</span>
                    <button
                      onClick={() => putSettings({ [a.key]: on ? "0" : "1" }, a.label)}
                      disabled={savingKey !== null}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        on ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                      aria-label={a.label}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          on ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Business profile">
            <div className="grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Business name">
                <TextInput
                  value={biz.business_name}
                  onChange={(e) => setBiz((p) => ({ ...p, business_name: e.target.value }))}
                />
              </Field>
              <Field label="WhatsApp number" hint="e.g. 923028487658">
                <TextInput
                  value={biz.whatsapp}
                  onChange={(e) => setBiz((p) => ({ ...p, whatsapp: e.target.value }))}
                />
              </Field>
              <Field label="Currency symbol">
                <TextInput
                  value={biz.currency}
                  onChange={(e) => setBiz((p) => ({ ...p, currency: e.target.value }))}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Btn
                tone="primary"
                disabled={savingKey !== null}
                onClick={() =>
                  putSettings(
                    {
                      business_name: biz.business_name,
                      whatsapp: biz.whatsapp,
                      currency: biz.currency,
                    },
                    "Business profile"
                  )
                }
              >
                {savingKey ? "Saving…" : "Save profile"}
              </Btn>
            </div>
          </Card>

          <StaffSection isOwner={isOwner} />
        </>
      )}
    </div>
  );
}

/* ================= staff accounts (OWNER only) ================= */
function StaffSection({ isOwner }: { isOwner: boolean }) {
  const { data, loading, error, reload } = useApi<AdminUser[] | { items: AdminUser[] }>(
    isOwner ? "/api/admin-users" : null
  );
  const users = asArray<AdminUser>(data);

  const [modal, setModal] = useState<{ open: boolean; user?: AdminUser }>({ open: false });
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STAFF" as "OWNER" | "STAFF" });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  if (!isOwner) {
    return (
      <Card title="Staff accounts">
        <AdminNote>Only owners can view and manage staff accounts.</AdminNote>
      </Card>
    );
  }

  function open(user?: AdminUser) {
    setForm({
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      role: user?.role ?? "STAFF",
    });
    setFormErr(null);
    setModal({ open: true, user });
  }

  async function save() {
    if (!form.email.trim()) return setFormErr("Email is required.");
    if (!modal.user && !form.password) return setFormErr("Password is required for new accounts.");
    setSaving(true);
    setFormErr(null);
    try {
      const payload: Record<string, string> = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
      };
      if (form.password) payload.password = form.password;
      if (modal.user) {
        await fetchJson(`/api/admin-users/${modal.user.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchJson("/api/admin-users", { method: "POST", body: JSON.stringify(payload) });
      }
      setModal({ open: false });
      reload();
    } catch (e) {
      setFormErr(e instanceof ApiError ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove(u: AdminUser) {
    if (!window.confirm(`Delete admin account ${u.email}?`)) return;
    try {
      await fetchJson(`/api/admin-users/${u.id}`, { method: "DELETE" });
      reload();
    } catch {
      /* surface via reload */
    }
  }

  return (
    <Card
      title="Staff accounts"
      action={
        <Btn tone="primary" onClick={() => open()}>
          + Add account
        </Btn>
      }
    >
      {error && <ApiErrorNote error={error} />}
      {loading && <Loading />}
      {!loading && !error && (
        <>
          {users.length === 0 ? (
            <div className="py-4 text-sm text-slate-500">No admin accounts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Created</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-slate-100">
                      <td className="py-2.5 pr-4 font-medium text-slate-900">{u.name || "—"}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{u.email}</td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            u.role === "OWNER" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-500">{fmtDateTime(u.createdAt)}</td>
                      <td className="py-2.5 text-right">
                        <div className="flex justify-end gap-2">
                          <Btn tone="ghost" onClick={() => open(u)}>
                            Edit
                          </Btn>
                          <Btn tone="danger" onClick={() => remove(u)}>
                            Delete
                          </Btn>
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
        <Modal title={modal.user ? "Edit account" : "Add account"} onClose={() => setModal({ open: false })}>
          {formErr && (
            <div className="mb-4">
              <AdminNote tone="error">{formErr}</AdminNote>
            </div>
          )}
          <div className="space-y-4">
            <Field label="Name">
              <TextInput value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </Field>
            <Field label="Email *">
              <TextInput
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                disabled={!!modal.user}
              />
            </Field>
            <Field
              label={modal.user ? "New password" : "Password *"}
              hint={modal.user ? "Leave blank to keep the current password." : undefined}
            >
              <TextInput
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                autoComplete="new-password"
              />
            </Field>
            <Field label="Role">
              <Select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as "OWNER" | "STAFF" }))}>
                <option value="STAFF">STAFF</option>
                <option value="OWNER">OWNER</option>
              </Select>
            </Field>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Btn tone="ghost" onClick={() => setModal({ open: false })}>
              Cancel
            </Btn>
            <Btn tone="primary" disabled={saving} onClick={save}>
              {saving ? "Saving…" : "Save"}
            </Btn>
          </div>
        </Modal>
      )}
    </Card>
  );
}
