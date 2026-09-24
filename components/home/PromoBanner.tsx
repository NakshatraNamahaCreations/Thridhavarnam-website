'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SAREES, formatINR } from '@/lib/sarees';
import { priceBucketsApi, type BackendPriceBucket } from '@/lib/api';

// Fallback tiles used when the backend has no active price buckets.
// Static IDs resolve against SAREES for the tile image + starting price.
const fallbackBuckets = [
  {
    label: 'Under ₹5,000',
    sub: 'Everyday Drapes',
    href: '/shop?bracket=under-5k',
    sampleId: 'mangalagiri-tulsi',
  },
  {
    label: 'Under ₹10,000',
    sub: 'Light Festive',
    href: '/shop?bracket=5-15k',
    sampleId: 'banarasi-saanjh',
  },
  {
    label: 'Under ₹25,000',
    sub: 'Festive Picks',
    href: '/shop?bracket=15-30k',
    sampleId: 'fancy-haldi',
  },
  {
    label: '₹25,000 & above',
    sub: 'Bridal · Heirloom',
    href: '/shop?tier=bridal',
    sampleId: 'banarasi-raktarani',
  },
];

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
  return {
    key: b.id,
    label: b.label ?? '',
    subtitle: b.subtitle ?? '',
    image: b.image ?? '',
    startingPrice: b.startingPrice ?? 0,
    href: b.href || '/shop',
  };
}

export default function PromoBanner() {
  const [backendTiles, setBackendTiles] = useState<TileData[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    priceBucketsApi
      .list()
      .then((rows) => {
        if (cancelled) return;
        const active = rows
          .filter((b) => b.active !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map(backendToTile);
        setBackendTiles(active);
      })
      .catch(() => {
        if (!cancelled) setBackendTiles([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const useBackend = (backendTiles?.length ?? 0) > 0;
  const fallbackTiles: TileData[] = fallbackBuckets.map((b) => {
    const sample = SAREES.find((s) => s.id === b.sampleId);
    return {
      key: b.label,
      label: b.label,
      subtitle: b.sub,
      image: sample?.image ?? '',
      startingPrice: sample?.price ?? 0,
      href: b.href,
    };
  });

  const tiles = useBackend ? (backendTiles as TileData[]) : fallbackTiles;

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
                  src={t.image}
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
