import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "30-Day Hair Challenge — Win a Free Bundle",
  description:
    "Join Zulfira's 30-day hair challenge — post your ritual daily, finishers win a free Complete Ritual Bundle, best transformation wins a 1-year supply.",
  alternates: { canonical: "/challenge" },
};

export default function ChallengeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
