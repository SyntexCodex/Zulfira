"use client";

import { useState } from "react";
import { asArray, fetchJson, useApi } from "../_components/api";
import {
  AdminNote,
  ApiErrorNote,
  Btn,
  Card,
  Loading,
  PageHeader,
  Select,
} from "../_components/ui";

interface ReviewRow {
  id: string;
  customerName: string;
  rating: number;
  title: string | null;
  comment: string;
  videoUrl: string | null;
  isApproved: boolean;
  createdAt: string;
  product: { name: string; slug: string };
}

interface RewardInfo {
  code: string;
  value: number;
  waLink: string | null;
  existing?: boolean;
}

function Stars({ n }: { n: number }) {
  return (
    <span className="text-amber-500" aria-label={`${n} out of 5 stars`}>
      {"★".repeat(n)}
      <span className="text-slate-300">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export default function ReviewsPage() {
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");
  const { data, error, reload } = useApi<{ reviews: ReviewRow[] }>(
    `/api/admin/reviews?status=${filter}`
  );
  const [busy, setBusy] = useState<string | null>(null);
  // Reward codes issued from this session, keyed by review id (prevents
  // re-issuing from the approve button more than once per review).
  const [rewards, setRewards] = useState<Record<string, RewardInfo>>({});

  const reviews = asArray<ReviewRow>(data?.reviews);

  const setApproval = async (id: string, isApproved: boolean) => {
    setBusy(id);
    try {
      await fetchJson("/api/admin/reviews", {
        method: "PATCH",
        body: JSON.stringify({ id, isApproved }),
      });
      if (isApproved && !rewards[id]) {
        // Issue the review-reward discount code (no-op when the program is
        // disabled or a code was already created today).
        try {
          const res = await fetchJson<{
            rewarded: boolean;
            code?: string;
            value?: number;
            waLink?: string | null;
            existing?: boolean;
          }>("/api/admin/reviews/reward", {
            method: "POST",
            body: JSON.stringify({ reviewId: id }),
          });
          if (res?.rewarded && res.code) {
            setRewards((prev) => ({
              ...prev,
              [id]: {
                code: res.code!,
                value: res.value ?? 0,
                waLink: res.waLink ?? null,
                existing: res.existing,
              },
            }));
          }
        } catch {
          // Reward failure must not block the approval itself.
        }
      }
      reload();
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    setBusy(id);
    try {
      await fetchJson(`/api/admin/reviews?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      reload();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Reviews"
        subtitle="Approve customer reviews before they appear on product pages."
        actions={
          <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="pending">Pending approval</option>
            <option value="approved">Approved</option>
            <option value="all">All</option>
          </Select>
        }
      />

      {error ? (
        <ApiErrorNote error={error} />
      ) : !data ? (
        <Loading />
      ) : reviews.length === 0 ? (
        <Card>
          <AdminNote>
            {filter === "pending"
              ? "No reviews waiting for approval."
              : "No reviews yet."}
          </AdminNote>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars n={r.rating} />
                    <span className="font-semibold text-slate-900">{r.customerName}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                        r.isApproved
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {r.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {r.product.name} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  {r.title && <p className="mt-2 font-semibold text-slate-900">{r.title}</p>}
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{r.comment}</p>
                  {r.videoUrl && (
                    <p className="mt-2 text-[13px]">
                      <span className="font-bold text-slate-900">Video review:</span>{" "}
                      <a
                        href={r.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-[#8a6d1b] underline hover:text-[#6b5414]"
                      >
                        {r.videoUrl}
                      </a>
                    </p>
                  )}
                  {rewards[r.id] && (
                    <div className="mt-3 rounded-2xl border border-[#C9A227] bg-[#C9A227]/10 p-4">
                      <p className="text-[13px] font-bold text-[#0B0B0B]">
                        Reward issued:{" "}
                        <span className="rounded bg-[#0B0B0B] px-2 py-0.5 font-mono text-[13px] text-[#C9A227]">
                          {rewards[r.id].code}
                        </span>{" "}
                        — Rs {rewards[r.id].value} off
                        {rewards[r.id].existing ? " (already created earlier today)" : ""}
                      </p>
                      {rewards[r.id].waLink ? (
                        <a
                          href={rewards[r.id].waLink!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#0B0B0B] px-4 py-2 text-[13px] font-bold text-white hover:opacity-90"
                        >
                          Send via WhatsApp
                        </a>
                      ) : (
                        <p className="mt-1 text-[12px] text-slate-500">
                          No customer phone on the order — share the code manually.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {!r.isApproved && (
                  <Btn
                    disabled={busy === r.id}
                    onClick={() => setApproval(r.id, true)}
                  >
                    {busy === r.id ? "Working…" : "Approve"}
                  </Btn>
                )}
                {r.isApproved && (
                  <Btn
                    tone="ghost"
                    disabled={busy === r.id}
                    onClick={() => setApproval(r.id, false)}
                  >
                    Unapprove
                  </Btn>
                )}
                <Btn
                  tone="danger"
                  disabled={busy === r.id}
                  onClick={() => remove(r.id)}
                >
                  Delete
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
