import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Hero from "@/components/home/Hero";
import TrustBadges from "@/components/TrustBadges";
import ProductCard from "@/components/ProductCard";
import MarketingBanners from "@/components/home/MarketingBanners";
import Philosophy from "@/components/home/Philosophy";
import WhyUs from "@/components/home/WhyUs";
import Reviews from "@/components/home/Reviews";
import FaqSection from "@/components/home/FaqSection";
import Newsletter from "@/components/home/Newsletter";
import Reveal, { SectionHeading } from "@/components/Reveal";
import { PRODUCTS } from "@/lib/site";

const MARQUEE_ITEMS = [
  "Anti Hair Fall", "Deep Nourishment", "Sulphate Free", "Silk Shine",
  "Scalp Hydration", "Non-Greasy", "Paraben Free", "Promotes Growth",
];

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBadges />

      {/* featured products */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading
            align="left"
            eyebrow="Bestsellers"
            title={<>Loved by thousands.</>}
          />
          <Reveal delay={0.1} className="hidden sm:block">
            <Link href="/shop" className="btn-outline inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link href="/shop" className="btn-outline inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">
            View all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* benefit marquee */}
      <div className="overflow-hidden border-y border-ink/8 bg-pine py-4">
        <div className="mask-fade-x">
          <div className="flex w-max animate-marquee gap-0">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((t, i) => (
              <span key={i} className="flex items-center gap-8 pr-8">
                <span className="whitespace-nowrap text-sm font-bold uppercase tracking-[0.22em] text-ivory">
                  {t}
                </span>
                <span className="h-1.5 w-1.5 rotate-45 bg-gold-soft" />
              </span>
            ))}
          </div>
        </div>
      </div>

      <MarketingBanners />
      <Philosophy />
      <WhyUs />
      <Reviews />
      <FaqSection />
      <Newsletter />
    </>
  );
}
