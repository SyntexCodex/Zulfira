import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { SITE_URL } from "@/lib/site";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Zulfira — Natural Hair Care | Hair Oil & Sulphate-Free Shampoo",
    template: "%s | Zulfira",
  },
  description:
    "Zulfira crafts honest, botanical hair care in Pakistan. Shop the Revitalizing Hair Oil (Rs 999), Sulphate-Free Shampoo (Rs 999) and Complete Ritual Bundle (Rs 1,700) with free home delivery and Cash on Delivery nationwide.",
  keywords: [
    "Zulfira",
    "Zulfira hair oil",
    "hair oil Pakistan",
    "sulphate free shampoo",
    "sulphate free shampoo Pakistan",
    "hair care Pakistan",
    "hair fall solution",
    "cash on delivery",
    "natural hair care",
    "argan oil hair",
    "keratin shampoo",
  ],
  authors: [{ name: "Zulfira Hair Care" }],
  creator: "Zulfira Hair Care",
  alternates: { canonical: "/" },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Zulfira — Natural Hair Care",
    description:
      "Revitalizing Hair Oil & Sulphate-Free Shampoo. Free home delivery and Cash on Delivery across Pakistan.",
    url: "/",
    siteName: "Zulfira",
    type: "website",
    locale: "en_PK",
    images: [
      {
        url: "/banners/hero-main.webp",
        width: 1200,
        height: 630,
        alt: "Zulfira natural hair care — hair oil and sulphate-free shampoo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zulfira — Natural Hair Care",
    description:
      "Revitalizing Hair Oil & Sulphate-Free Shampoo. Free home delivery and Cash on Delivery across Pakistan.",
    images: ["/banners/hero-main.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Zulfira Hair Care",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo.webp`,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+92-302-8487658",
    contactType: "customer service",
    areaServed: "PK",
    availableLanguage: ["en", "ur"],
  },
  sameAs: [
    "https://www.facebook.com/profile.php?id=61593966274766",
    "https://www.instagram.com/zulfira_0/",
    "https://www.tiktok.com/@zulfira.pk",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Zulfira",
  url: SITE_URL,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-paper text-ink font-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
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
