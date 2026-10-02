import type { Metadata } from "next";
import { Syne, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ScrollProgress from "@/components/ScrollProgress";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZULFIRA — Futuristic Hair Care | Hair Oil & Shampoo",
  description:
    "Zulfira is next-generation hair care. Signature Hair Oil and Shampoo crafted for the future — order online with Cash on Delivery or online payment, delivered across Pakistan.",
  keywords: ["Zulfira", "hair oil", "shampoo", "hair care", "Pakistan", "cash on delivery"],
  openGraph: {
    title: "ZULFIRA — Futuristic Hair Care",
    description: "Signature Hair Oil & Shampoo. Order with Cash on Delivery or online payment.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${syne.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-void text-cream font-body">
        <ScrollProgress />
        <Nav />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
