import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Track your Zulfira order status — enter your order number to see where your parcel is.",
  alternates: { canonical: "/track-order" },
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
