import Hero from '@/components/home/Hero';
import Tiers from '@/components/home/Tiers';
import BestSellers from '@/components/home/BestSellers';
import Featured from '@/components/home/Featured';
import PromoBanner from '@/components/home/PromoBanner';
import WeaveRail from '@/components/home/WeaveRail';
import ParallaxBanner from '@/components/home/ParallaxBanner';
import CraftStory from '@/components/home/CraftStory';
import Testimonials from '@/components/home/Testimonials';
import PressStrip from '@/components/home/PressStrip';
import InstagramFeed from '@/components/home/InstagramFeed';
import Worldwide from '@/components/home/Worldwide';
import BrandVerse from '@/components/home/BrandVerse';
import SectionOrnament from '@/components/ui/SectionOrnament';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Tiers />
      <BestSellers />
      <Featured />
      <SectionOrnament />
      <PromoBanner />
      <WeaveRail />
      <ParallaxBanner />
      <BrandVerse />
      <CraftStory />
      <SectionOrnament />
      <Testimonials />
      <PressStrip />
      <InstagramFeed />
      <Worldwide />
    </>
  );
}
