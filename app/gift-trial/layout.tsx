import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gift a Friend a Free Trial",
  description:
    "Gift a friend a free Zulfira trial bottle — they get 15% off their first order, you earn Rs 200 wallet credit.",
  alternates: { canonical: "/gift-trial" },
};

export default function GiftTrialLayout({ children }: { children: React.ReactNode }) {
  return children;
}
