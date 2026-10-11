import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You — Order Placed",
  description: "Thank you for your Zulfira order — your order has been received.",
  alternates: { canonical: "/thank-you" },
  robots: { index: false, follow: false },
};

export default function ThankYouLayout({ children }: { children: React.ReactNode }) {
  return children;
}
