import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import Mission from "@/components/home/Mission";
import Categories from "@/components/home/Categories";
import TopPicks from "@/components/home/TopPicks";
import Spotlight from "@/components/home/Spotlight";
import LifestyleBanner from "@/components/home/LifestyleBanner";
import Bestsellers from "@/components/home/Bestsellers";
import Instagram from "@/components/home/Instagram";
import PromoPopup from "@/components/home/PromoPopup";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Mission />
      <Categories />
      <TopPicks />
      <Spotlight />
      <LifestyleBanner />
      <Bestsellers />
      <Instagram />
      <PromoPopup />
    </>
  );
}
