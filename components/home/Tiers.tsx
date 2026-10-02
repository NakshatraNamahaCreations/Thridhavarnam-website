'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TIERS, SAREES, formatINR, type Tier } from '@/lib/sarees';
import { type BackendOccasion } from '@/lib/api';
import { useHomeData } from '@/lib/home-data';

const tierImages: Partial<Record<Tier, string>> = {
  everyday: '/images/aangan.jpg',
  festive: '/newarrivals/sindhoori%20banarasi.jpg',
};

const tierImageFor = (tier: Tier) =>
  tierImages[tier] ??
  SAREES.find((s) => s.tier === tier)?.image ??
  '/images/c2.jpg';

const fallbackOrder: Tier[] = ['everyday', 'festive', 'bridal'];

type TileData = {
  key: string;
  title: string;
  image: string;
  priceLine: string;
  href: string;
};

function occasionPriceLine(o: BackendOccasion): string {
  const from = o.fromAmount && o.fromAmount > 0 ? o.fromAmount : 0;
  const to = o.toAmount && o.toAmount > 0 ? o.toAmount : 0;
  if (from && to) return `${formatINR(from)} – ${formatINR(to)}`;
  if (from) return `From ${formatINR(from)}`;
  if (to) return `Up to ${formatINR(to)}`;
  return '';
}

function occasionToTile(o: BackendOccasion): TileData {
  return {
    key: o.id || o.name,
    title: o.name,
    image: o.image ?? '/images/c2.jpg',
    priceLine: occasionPriceLine(o),
    href: `/shop?${new URLSearchParams({ occasion: o.id || o.name }).toString()}`,
  };
}

function tierToTile(tierId: Tier): TileData {
  const t = TIERS[tierId];
  return {
    key: t.id,
    title: t.title,
    image: tierImageFor(tierId),
    priceLine: t.range,
    href: `/shop?tier=${t.id}`,
  };
}

export default function Tiers() {
  const { occasions, products } = useHomeData();

  const tiles = useMemo<TileData[]>(() => {
    const withImages = occasions.filter((o) => o.image);
    return withImages.map(occasionToTile);
  }, [occasions]);

  // Still loading, or no occasions configured in admin — hide the section.
  if (products === null || tiles.length === 0) return null;

  return (
    <section className="bg-ivory py-10 md:py-14">
      <div className="max-w-[1720px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between mb-6 md:mb-8 flex-wrap gap-3">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">
            Shop by occasion
          </h2>
          <Link
            href="/shop"
            className="text-sm font-semibold text-ink hover:text-maroon transition-colors underline underline-offset-4"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiles.map((tile) => (
            <Link
              href={tile.href}
              key={tile.key}
              className="group relative block overflow-hidden bg-bone rounded-sm"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={tile.image}
                  alt={tile.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B0E0A]/90 via-[#1B0E0A]/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-ivory">
                  <h3 className="text-2xl md:text-3xl font-bold mb-3">
                    {tile.title}
                  </h3>
                  {tile.priceLine && (
                    <div className="text-sm text-ivory/90 font-medium mb-4">
                      {tile.priceLine}
                    </div>
                  )}
                  <span className="inline-flex items-center justify-center bg-ivory no-pattern text-ink px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm group-hover:bg-gold transition-colors">
                    Shop Now
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
