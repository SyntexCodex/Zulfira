"use client";

import { useEffect, useState } from "react";
import { asArray, fetchJson, useApi } from "../_components/api";
import {
  ApiErrorNote,
  Btn,
  Card,
  Loading,
  PageHeader,
  TextInput,
} from "../_components/ui";

interface ProgramRow {
  key: string;
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
  updatedAt: string;
}

const DESCRIPTIONS: Record<string, string> = {
  reorder_reminders:
    "Day-35 WhatsApp reorder nudge with a personal 10% discount code.",
  subscribe_save:
    "Subscribe & Save: recurring orders on a 45-day cycle with 10% off.",
  review_rewards:
    "Reward reviews with discounts: Rs 75 for a photo, Rs 150 for a video.",
  inbox_upsell:
    "In-box upsell card giving first-time buyers 20% off their next order.",
  challenge_30:
    "30-day hair challenge: daily check-ins, strikes, best transformation wins.",
  gift_trial:
    "Gift-a-trial: free 100ml bottle for a friend, Rs 200 credit for the sender.",
  insiders:
    "Zulfira Insiders: private WhatsApp group for repeat customers (2+ orders).",
  equity_1pct:
    "1% equity slots: profit-share program with monthly payouts.",
};

const GOLD = "#C9A227";

function ConfigInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (typeof value === "boolean") {
    return (
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-5 w-5 accent-[#C9A227]"
        />
      </label>
    );
  }
  if (typeof value === "number") {
    return (
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </span>
        <TextInput
          type="number"
          value={String(value)}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange(Number.isNaN(n) ? 0 : n);
          }}
        />
      </label>
    );
  }
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <TextInput
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export default function LoyaltyPage() {
  const { data, error, loading, reload } =
    useApi<{ programs: ProgramRow[] }>("/api/admin/loyalty");
  const [drafts, setDrafts] = useState<
    Record<string, { enabled: boolean; config: Record<string, unknown> }>
  >({});
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Seed local drafts whenever the server list loads/changes.
  useEffect(() => {
    const programs = asArray<ProgramRow>(data?.programs);
    if (programs.length === 0) return;
    setDrafts((prev) => {
      const next = { ...prev };
      for (const p of programs) {
        if (!next[p.key] || !busyKey) {
          next[p.key] = {
            enabled: p.enabled,
            config: { ...(p.config ?? {}) },
          };
        }
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const programs = asArray<ProgramRow>(data?.programs);

  const putProgram = async (key: string, patch: { enabled?: boolean; config?: Record<string, unknown> }) => {
    setBusyKey(key);
    try {
      await fetchJson<{ program: ProgramRow }>("/api/admin/loyalty", {
        method: "PUT",
        body: JSON.stringify({ key, ...patch }),
      });
      setSavedAt(key);
      setTimeout(() => setSavedAt((s) => (s === key ? null : s)), 2000);
      await reload();
    } finally {
      setBusyKey(null);
    }
  };

  const toggle = async (key: string) => {
    const draft = drafts[key];
    if (!draft || busyKey) return;
    const next = !draft.enabled;
    setDrafts((prev) => ({ ...prev, [key]: { ...prev[key], enabled: next } }));
    try {
      await putProgram(key, { enabled: next });
    } catch {
      // roll back the optimistic flip on failure
      setDrafts((prev) => ({ ...prev, [key]: { ...prev[key], enabled: !next } }));
    }
  };

  const saveSettings = async (key: string) => {
    const draft = drafts[key];
    if (!draft || busyKey) return;
    await putProgram(key, { config: draft.config });
  };

  return (
    <div>
      <PageHeader
        title="Loyalty Programs"
        subtitle="Master switches and settings for every loyalty program."
      />

      <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <b>Note:</b> Disabled programs are completely inert across the site —
        nothing on the storefront or in admin runs for them.
      </div>

      {loading && <Loading />}
      <ApiErrorNote error={error} />

      {!loading && !error && programs.length === 0 && (
        <Card title="No programs">
          <p className="text-sm text-slate-500">No loyalty programs found.</p>
        </Card>
      )}

      <div className="space-y-4">
        {programs.map((p) => {
          const draft = drafts[p.key] ?? {
            enabled: p.enabled,
            config: p.config ?? {},
          };
          const entries = Object.entries(draft.config);
          const open = openKey === p.key;
          const busy = busyKey === p.key;
          return (
            <Card key={p.key} title={p.name}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-slate-600">
                    {DESCRIPTIONS[p.key] ?? "Custom loyalty program."}
                  </p>
                  <p className="mt-1 font-mono text-xs text-slate-400">{p.key}</p>
                  <p
                    className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={
                      draft.enabled
                        ? { backgroundColor: `${GOLD}22`, color: "#8a6f14" }
                        : { backgroundColor: "#e2e8f0", color: "#475569" }
                    }
                  >
                    {draft.enabled ? "ACTIVE" : "DISABLED"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(p.key)}
                  disabled={busy}
                  role="switch"
                  aria-checked={draft.enabled}
                  aria-label={`${p.name} ${draft.enabled ? "on" : "off"}`}
                  className="relative inline-flex h-8 w-16 shrink-0 items-center rounded-full transition disabled:opacity-60"
                  style={{ backgroundColor: draft.enabled ? GOLD : "#cbd5e1" }}
                >
                  <span
                    className="inline-block h-6 w-6 transform rounded-full bg-white shadow transition"
                    style={{ transform: draft.enabled ? "translateX(2.1rem)" : "translateX(0.25rem)" }}
                  />
                </button>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setOpenKey(open ? null : p.key)}
                  className="text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
                >
                  {open ? "Hide settings" : "Show settings"}
                </button>
                {open && (
                  <div className="mt-4">
                    {entries.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        This program has no configurable settings.
                      </p>
                    ) : (
                      <div className="grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
                        {entries.map(([k, v]) => (
                          <ConfigInput
                            key={k}
                            label={k}
                            value={v}
                            onChange={(nv) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [p.key]: {
                                  ...prev[p.key],
                                  config: { ...prev[p.key].config, [k]: nv },
                                },
                              }))
                            }
                          />
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex items-center gap-3">
                      <Btn tone="primary" disabled={busy} onClick={() => saveSettings(p.key)}>
                        {busy ? "Saving…" : savedAt === p.key ? "Saved ✓" : "Save settings"}
                      </Btn>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
