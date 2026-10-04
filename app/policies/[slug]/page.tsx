import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { POLICIES, policyBySlug } from "@/lib/site";

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = policyBySlug(slug);
  return p ? { title: `${p.title} — Zulfira` } : {};
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = policyBySlug(slug);
  if (!policy) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow-red">Zulfira Hair Care</p>
      <h1 className="section-title mt-3 text-4xl sm:text-5xl">{policy.title}</h1>
      <p className="mt-2 text-[13px] text-muted">{policy.updated}</p>
      <div className="mt-8 space-y-5">
        {policy.body.map((para, i) => (
          <p key={i} className="text-[15px] leading-[1.9] text-ink/80">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}
