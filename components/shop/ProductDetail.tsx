'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SAREES, BADGE_LABEL, getColorways } from '@/lib/sarees';
import { getColorwayGallery } from '@/lib/product-images';
import { useRecentlyViewed } from '@/lib/recently-viewed';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductAccordion from './ProductAccordion';
import ProductRail from './ProductRail';
import ProductReviews from './ProductReviews';
import StickyBuyBar from './StickyBuyBar';
import SaleHero from './SaleHero';

type Saree = (typeof SAREES)[number];

export default function ProductDetail({ saree }: { saree: Saree }) {
  const { mrp, badges } = saree;
  // The detail page shows at most ONE pill above the price — pick the
  // most urgent ribbon (last > fast > ready) when several apply.
  const badge =
    badges.find((b) => b === 'last') ??
    badges.find((b) => b === 'fast') ??
    badges.find((b) => b === 'ready');
  const badgeLabel = badge ? BADGE_LABEL[badge] : undefined;

  // Recently-viewed: push current id, read the rest from storage.
  const recentIds = useRecentlyViewed(saree.id);

  // Similar = same weave OR same tier, excluding the current piece.
  const similarIds = SAREES
    .filter((s) => s.id !== saree.id && (s.weave === saree.weave || s.tier === saree.tier))
    .slice(0, 8)
    .map((s) => s.id);

  // Deterministic numbers derived from the id so the page is stable on reload
  // without needing a backend yet.
  const seed = saree.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const viewers = 30 + (seed % 80);
  const deliveryDate = computeDeliveryDate(5 + (seed % 5));

  // Color state is owned HERE (not in ProductInfo) so the gallery on the
  // left can react to colour changes — picking a swatch swaps the
  // thumbnails to images of sarees in that colour.
  const colorways = getColorways(saree);
  const [colorId, setColorId] = useState(colorways[0]?.id ?? '');
  const galleryImages = getColorwayGallery(saree, colorId);

  return (
    <div className="bg-white min-h-screen text-gray-900">
      <SaleHero />

      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-3 text-xs text-gray-500">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap">
            <Link href="/home" className="hover:text-gray-900">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-gray-900">All Sarees</Link>
            <span>/</span>
            <Link
              href={`/shop?weave=${encodeURIComponent(saree.weave)}`}
              className="hover:text-gray-900"
            >
              {saree.weave}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{saree.name}</span>
          </nav>
        </div>
      </div>

      {/* Main grid: gallery + info */}
      <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <ProductGallery
            key={colorId}
            images={galleryImages}
            alt={saree.name}
          />
          <ProductInfo
            saree={saree}
            mrp={mrp}
            badge={badgeLabel}
            viewers={viewers}
            deliveryDate={deliveryDate}
            colorId={colorId}
            onColorChange={setColorId}
          />
        </div>
      </div>

      {/* Long-form details */}
      <div className="max-w-[1720px] mx-auto px-4 lg:px-8 pb-8">
        <ProductAccordion saree={saree} />
      </div>

      {/* Similar products */}
      {similarIds.length > 0 && <ProductRail title="Similar Products" ids={similarIds} />}

      {/* Recently viewed */}
      {recentIds.length > 0 && <ProductRail title="Recently Viewed" ids={recentIds} />}

      {/* Customer reviews */}
      <ProductReviews productId={saree.id} productName={saree.name} />

      {/* Sticky bottom bar */}
      <StickyBuyBar saree={saree} mrp={mrp} />
    </div>
  );
}

function computeDeliveryDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const weekday = d.toLocaleDateString('en-IN', { weekday: 'long' });
  const day = d.getDate();
  const month = d.toLocaleDateString('en-IN', { month: 'short' });
  const year = d.getFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
}
