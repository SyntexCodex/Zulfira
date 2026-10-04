import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import { FlashSaleBar, AnnouncementBar } from "@/components/layout/TopBars";
import CartDrawer from "@/components/CartDrawer";
import VisitorPing from "@/components/VisitorPing";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zulfira — Natural Hair Care | Hair Oil & Sulphate-Free Shampoo",
  description:
    "Zulfira crafts honest, botanical hair care in Pakistan. Shop the Revitalizing Hair Oil and Sulphate-Free Shampoo with Cash on Delivery nationwide.",
  keywords: ["Zulfira", "hair oil", "sulphate free shampoo", "hair care Pakistan", "cash on delivery"],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Zulfira — Natural Hair Care",
    description: "Revitalizing Hair Oil & Sulphate-Free Shampoo. Cash on Delivery across Pakistan.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-paper text-ink font-body">
        <CartProvider>
          <VisitorPing />
          <FlashSaleBar />
          <AnnouncementBar />
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
