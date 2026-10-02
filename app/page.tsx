import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Products from "@/components/Products";
import Ritual from "@/components/Ritual";
import Ingredients from "@/components/Ingredients";
import Reviews from "@/components/Reviews";
import OrderSection from "@/components/OrderSection";
import Faq from "@/components/Faq";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Products />
      <Ritual />
      <Ingredients />
      <Reviews />
      <OrderSection />
      <Faq />
      <Contact />
    </>
  );
}
