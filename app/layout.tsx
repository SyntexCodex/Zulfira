import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zulfira — Natural Hair Care | Hair Oil & Sulphate-Free Shampoo",
  description:
    "Zulfira crafts honest, botanical hair care in Pakistan. Shop the Revitalizing Hair Oil and Sulphate-Free Shampoo with Cash on Delivery nationwide.",
  keywords: ["Zulfira", "hair oil", "sulphate free shampoo", "hair care Pakistan", "cash on delivery"],
  openGraph: {
    title: "Zulfira — Natural Hair Care",
    description: "Revitalizing Hair Oil & Sulphate-Free Shampoo. Cash on Delivery across Pakistan.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-ivory text-ink font-body">
        <CartProvider>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppFloat />
        </CartProvider>
      </body>
    </html>
  );
}
