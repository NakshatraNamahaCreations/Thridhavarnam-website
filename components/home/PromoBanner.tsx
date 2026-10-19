'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SAREES, formatINR } from '@/lib/sarees';
import { cloudinaryUrl, type BackendPriceBucket } from '@/lib/api';
import { useHomeData } from '@/lib/home-data';

// Fallback tiles used when the backend has no active price buckets.
// Each tile declares its own min/max in rupees so the storefront
// filter result matches the label exactly ("Under ₹10,000" → max=10000).
// 0 on either side means "unbounded on that side".
const fallbackBuckets = [
  {
    label: 'Under ₹5,000',
    sub: 'Everyday Drapes',
    minPrice: 0,
    maxPrice: 5000,
    sampleId: 'mangalagiri-tulsi',
  },
  {
    label: 'Under ₹10,000',
    sub: 'Light Festive',
    minPrice: 0,
    maxPrice: 10000,
    sampleId: 'banarasi-saanjh',
  },
  {
    label: 'Under ₹25,000',
    sub: 'Festive Picks',
    minPrice: 0,
    maxPrice: 25000,
    sampleId: 'fancy-haldi',
  },
  {
    label: '₹25,000 & above',
    sub: 'Bridal · Heirloom',
    minPrice: 25000,
    maxPrice: 0,
    sampleId: 'banarasi-raktarani',
  },
];

// Build a /shop URL that filters by the given price range. 0 on
// either side is dropped so the resulting URL stays clean.
function priceHref(minPrice: number, maxPrice: number): string {
  const params = new URLSearchParams();
  if (minPrice > 0) params.set('minPrice', String(minPrice));
  if (maxPrice > 0) params.set('maxPrice', String(maxPrice));
  const qs = params.toString();
  return qs ? `/shop?${qs}` : '/shop';
}

// Buckets created before the min/max fields existed only had a
// free-text `href` like "/shop?bracket=under-5k". Translate those
// legacy ids to the equivalent min/max range so the storefront
// filter still fires until the admin re-saves the bucket.
const LEGACY_BRACKETS: Record<string, { min: number; max: number }> = {
  'under-5k': { min: 0, max: 5000 },
  '5-15k': { min: 5000, max: 15000 },
  '15-30k': { min: 15000, max: 30000 },
  '30-60k': { min: 30000, max: 60000 },
  'above-60k': { min: 60000, max: 0 },
};

function hrefFromLegacy(href: string | undefined): string | null {
  if (!href) return null;
  const q = href.split('?')[1];
  if (!q) return null;
  const params = new URLSearchParams(q);
  const bracket = params.get('bracket');
  if (bracket && LEGACY_BRACKETS[bracket]) {
    const { min, max } = LEGACY_BRACKETS[bracket];
    return priceHref(min, max);
  }
  // Anything else (?tier=bridal, ?weave=...) stays as-is.
  return href;
}

// Uniform tile shape rendered by the JSX. Both backend buckets and the
// static fallbacks map into this so there's one render path.
type TileData = {
  key: string;
  label: string;
  subtitle: string;
  image: string;
  startingPrice: number;
  href: string;
};

function backendToTile(b: BackendPriceBucket): TileData {
  const min = b.minPrice ?? 0;
  const max = b.maxPrice ?? 0;
  // Prefer the admin-set numeric range. Buckets saved under the old
  // schema (no min/max) fall back to the stored href, with legacy
  // ?bracket=<id> translated to the matching min/max query so the
  // storefront filter still fires.
  const href = min > 0 || max > 0 ? priceHref(min, max) : hrefFromLegacy(b.href) ?? '/shop';
  return {
    key: b.id,
    label: b.label ?? '',
    subtitle: b.subtitle ?? '',
    image: b.image ?? '',
    startingPrice: b.startingPrice ?? 0,
    href,
  };
}

export default function PromoBanner() {
  const { products: rawProducts, priceBuckets } = useHomeData();
  const loaded = rawProducts !== null;

  const backendTiles = useMemo<TileData[]>(
    () =>
      priceBuckets
        .filter((b) => b.active !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(backendToTile),
    [priceBuckets],
  );

  const fallbackTiles: TileData[] = fallbackBuckets.map((b) => {
    const sample = SAREES.find((s) => s.id === b.sampleId);
    return {
      key: b.label,
      label: b.label,
      subtitle: b.sub,
      image: sample?.image ?? '',
      startingPrice: sample?.price ?? 0,
      href: priceHref(b.minPrice, b.maxPrice),
    };
  });

  const tiles = backendTiles.length > 0 ? backendTiles : loaded ? fallbackTiles : [];

  return (
    <section className="bg-ivory py-10 md:py-14">
      <div className="max-w-[1720px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between mb-6 md:mb-8 flex-wrap gap-3">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">
            Shop by price
          </h2>
          <Link
            href="/shop"
            className="text-sm font-semibold text-ink hover:text-maroon transition-colors underline underline-offset-4"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {tiles.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              className="group relative aspect-[3/4] overflow-hidden bg-maroon-deep rounded-sm"
            >
              {t.image && (
                <Image
                  src={cloudinaryUrl(t.image, 600)}
                  alt={t.label}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B0E0A]/90 via-[#1B0E0A]/30 to-transparent" />
              <div className="absolute inset-0 p-5 flex flex-col justify-end text-ivory">
                {t.subtitle && (
                  <div className="text-xs font-medium text-ivory/75 mb-1 uppercase tracking-wide">
                    {t.subtitle}
                  </div>
                )}
                <div className="text-xl md:text-2xl font-bold leading-tight mb-3">
                  {t.label}
                </div>
                {t.startingPrice > 0 && (
                  <div className="text-xs text-ivory/85 mb-3">
                    Starting at <span className="font-bold">{formatINR(t.startingPrice)}</span>
                  </div>
                )}
                <span className="inline-flex items-center justify-center bg-ivory no-pattern text-ink px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm self-start group-hover:bg-gold transition-colors">
                  Shop Now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
