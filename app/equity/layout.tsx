import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zulfira Equity — Own a Share of the Brand",
  description:
    "Zulfira's 1% equity program — how community members can own a share of the brand's growth.",
  alternates: { canonical: "/equity" },
};

export default function EquityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
