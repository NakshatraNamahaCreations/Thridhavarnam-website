import { HomeDataProvider, type HomeData } from '@/lib/home-data';
import {
  productsApi,
  storefrontInitApi,
  cloudinaryUrl,
  type BackendProduct,
} from '@/lib/api';
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

// ISR: Netlify / Next caches this page for 60s. After that window, the next
// request triggers a background revalidate while the stale copy ships
// instantly. Keeps TTFB low without pinning the page to stale data.
export const revalidate = 60;

async function loadHome(): Promise<HomeData> {
  const [products, init] = await Promise.all([
    productsApi.list().catch(() => [] as BackendProduct[]),
    storefrontInitApi.get().catch(() => ({
      categories: [],
      occasions: [],
      banners: [],
      priceBuckets: [],
      coupons: [],
    })),
  ]);
  return {
    products,
    categories: init.categories,
    occasions: init.occasions,
    banners: init.banners,
    priceBuckets: init.priceBuckets,
    coupons: init.coupons,
  };
}

export default async function HomePage() {
  // Server-side fetch so the first HTML paint already contains hero,
  // bestsellers, and featured content. Previously the browser had to
  // mount, hydrate, then round-trip to the API before any product
  // card rendered — a visible blank gap on cold loads.
  const initial = await loadHome();

  // First active hero banner — preload it in the document head so the
  // browser starts the Cloudinary fetch during HTML parse, not after
  // React hydrates and the <Image> renders. Shaves 300-800ms off the
  // visible banner paint on cold loads.
  const firstBanner = initial.banners.find(
    (b) => (!b.type || b.type === 'hero') && b.active !== false && b.image,
  );
  const preloadHref = firstBanner?.image ? cloudinaryUrl(firstBanner.image) : null;

  return (
    <HomeDataProvider initial={initial}>
      {preloadHref && (
        <link
          rel="preload"
          as="image"
          href={preloadHref}
          // @ts-expect-error — React 18 typings don't yet include fetchpriority
          fetchpriority="high"
        />
      )}
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
    </HomeDataProvider>
  );
}
