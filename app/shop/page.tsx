import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import ShopView from '@/components/shop/ShopView';
import ProductCard from '@/components/shop/ProductCard';
import {
  productsApi,
  storefrontInitApi,
  backendToSaree,
  type BackendProduct,
} from '@/lib/api';
import type { Saree } from '@/lib/sarees';

export const metadata: Metadata = {
  title: 'Shop · Thridha Varnam',
  description:
    'Hand-woven heirloom sarees — Kanjeevaram, Banarasi, Mysore Silk, Mangalagiri, Pochampally, Gadwal, Patola, Fancy Sarees and Mixed Pattu drapes. Filter by collection, weave or price.',
};

// ISR: cached for 60s per URL. First paint already contains the product
// grid, so the "No results found" flash while the client-side fetch
// resolves is gone.
export const revalidate = 60;

async function loadShop(): Promise<{
  catalog: Saree[];
  occasions: Awaited<ReturnType<typeof storefrontInitApi.get>>['occasions'];
  priceBuckets: Awaited<ReturnType<typeof storefrontInitApi.get>>['priceBuckets'];
}> {
  const [rows, init] = await Promise.all([
    productsApi.list().catch(() => [] as BackendProduct[]),
    storefrontInitApi.get().catch(() => ({
      categories: [],
      occasions: [],
      banners: [],
      priceBuckets: [],
      coupons: [],
    })),
  ]);
  const categoryMap: Record<string, string> = {};
  for (const c of init.categories) {
    if (c.id && c.name) categoryMap[c.id] = c.name;
  }
  return {
    catalog: rows.map((p) => backendToSaree(p, categoryMap)),
    occasions: init.occasions,
    priceBuckets: init.priceBuckets,
  };
}

/**
 * SSR fallback used by the Suspense boundary around ShopView.
 *
 * ShopView calls useSearchParams(), which forces its subtree to be
 * client-rendered — so during static generation only this fallback
 * lands in the HTML. Without this component the fallback was an empty
 * `<div>`, leaving visitors staring at a cream void for the duration
 * of hydration (several seconds on 961 cards). Now the first paint
 * already contains breadcrumb, count, and the product grid; ShopView
 * seamlessly takes over once hydrated to add filters, sort and chips.
 */
function ShopFallback({ catalog }: { catalog: Saree[] }) {
  // Only render the first N cards above the fold — Next's lazy loading
  // means off-screen `<img>` elements don't eat bandwidth, but rendering
  // 961 cards server-side bloats the HTML to ~1 MB and slows TTFB.
  // ShopView will fill in the rest after hydration.
  const visible = catalog.slice(0, 48);
  return (
    <div className="bg-white min-h-screen text-gray-900">
      <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-4 lg:py-5">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-2">
          <Link href="/home" className="hover:text-gray-900">Home</Link>
          <span className="mx-1.5">/</span>
          <span className="text-gray-900">All Sarees</span>
        </nav>
        <div className="flex items-baseline gap-3 mb-6">
          <h1 className="font-display text-3xl md:text-4xl text-gray-900">
            All Sarees
          </h1>
          <span className="text-gray-500 text-base">
            ({catalog.length} {catalog.length === 1 ? 'item' : 'items'})
          </span>
        </div>
      </div>
      <div className="max-w-[1720px] mx-auto px-4 lg:px-8 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {visible.map((saree, i) => (
            <ProductCard key={saree.id} saree={saree} priority={i < 4} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * /shop — the catalogue.
 *
 * A single URL handles every category state via search params:
 *   ?tier=bridal | festive | everyday          (comma-separated multi)
 *   ?weave=Banarasi | Kanjivaram | ...        (comma-separated multi)
 *   ?minPrice=5000&maxPrice=15000             (price range in rupees; either side optional)
 *   ?sale=1                                   (atelier sale)
 *   ?sort=price-asc | price-desc | name
 *   ?wishlist=1                               (wishlist mode)
 *   ?bag=1                                    (bag/cart mode)
 *
 * ShopView uses useSearchParams, which requires a Suspense boundary at
 * the route entry. The fallback above renders the real grid server-side
 * so the first HTML paint already contains the product cards.
 */
export default async function ShopPage() {
  const { catalog, occasions, priceBuckets } = await loadShop();
  return (
    <Suspense fallback={<ShopFallback catalog={catalog} />}>
      <ShopView
        initialCatalog={catalog}
        initialOccasions={occasions}
        initialPriceBuckets={priceBuckets}
      />
    </Suspense>
  );
}
