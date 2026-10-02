'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BADGE_LABEL, getColorways, type Saree } from '@/lib/sarees';
import { productsApi, backendToSaree, type BackendProduct } from '@/lib/api';
import { getColorwayGallery } from '@/lib/product-images';
import { useRecentlyViewed } from '@/lib/recently-viewed';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductAccordion from './ProductAccordion';
import ProductRail from './ProductRail';
import ProductReviews from './ProductReviews';
import StickyBuyBar from './StickyBuyBar';
import SaleHero from './SaleHero';

export default function ProductDetail({ saree, backendProduct, similar: serverSimilar }: { saree: Saree; backendProduct?: BackendProduct; similar?: Saree[] }) {
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

  // "Similar Products" — prefer other pieces in the same weave/category.
  // Initialised with the server-computed list so the rail is visible on
  // first paint with no client fetch. The useEffect only runs as a
  // fallback when the page is used standalone (no server prop supplied).
  const [similar, setSimilar] = useState<Saree[]>(serverSimilar ?? []);
  const [simPage, setSimPage] = useState(0);
  const SIM_PAGE_SIZE = 6;

  useEffect(() => {
    if (serverSimilar) return; // server already computed this — skip client fetch
    let cancelled = false;
    productsApi
      .list()
      .then((rows) => {
        if (cancelled) return;
        const all = rows.map((p) => backendToSaree(p)).filter((s) => s.id !== saree.id);
        const sameCategory = saree.weave
          ? all.filter((s) => s.weave === saree.weave)
          : [];
        const bestsellers = all.filter(
          (s) => Array.isArray(s.flags) && s.flags.includes('bestseller'),
        );
        setSimilar(sameCategory.length > 0 ? sameCategory : bestsellers);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [saree.id, saree.weave, serverSimilar]);

  // Reset to first page whenever the product or similar list changes.
  useEffect(() => { setSimPage(0); }, [saree.id, similar.length]);

  const totalSimPages = Math.ceil(similar.length / SIM_PAGE_SIZE);
  const simPageItems = similar.slice(simPage * SIM_PAGE_SIZE, (simPage + 1) * SIM_PAGE_SIZE);

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
        <ProductAccordion saree={saree} backendProduct={backendProduct} />
      </div>

      {/* Similar products — sourced from admin-flagged bestsellers */}
      {similar.length > 0 && (
        <>
          <ProductRail title="Similar Products" sarees={simPageItems} />
          {totalSimPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-5 bg-white border-t border-gray-200">
              <button
                disabled={simPage === 0}
                onClick={() => setSimPage((p) => p - 1)}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 text-gray-600 disabled:opacity-30 hover:border-[#75001F] hover:text-[#75001F] transition-colors"
                aria-label="Previous page"
              >
                ‹
              </button>
              {Array.from({ length: totalSimPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setSimPage(i)}
                  className={`w-9 h-9 flex items-center justify-center border text-sm font-medium transition-colors ${
                    i === simPage
                      ? 'border-[#75001F] bg-[#75001F] text-white'
                      : 'border-gray-300 text-gray-600 hover:border-[#75001F] hover:text-[#75001F]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={simPage === totalSimPages - 1}
                onClick={() => setSimPage((p) => p + 1)}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 text-gray-600 disabled:opacity-30 hover:border-[#75001F] hover:text-[#75001F] transition-colors"
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          )}
        </>
      )}

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
