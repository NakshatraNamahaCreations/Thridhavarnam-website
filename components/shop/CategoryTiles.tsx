'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatINR } from '@/lib/sarees';
import { occasionsApi, type BackendOccasion } from '@/lib/api';

type Tile = {
  key: string;
  href: string;
  title: string;
  caption: string;
  image: string;
  badge?: string;
};

// Fallback tiles used when the backend has no active occasions with
// images. Keeps the shop-page section from going empty on a fresh
// database.
const FALLBACK_TILES: Tile[] = [
  {
    key: 'bridal',
    href: '/shop?tier=bridal',
    title: 'Bridal Wear',
    caption: 'Wedding-ready bridal silk',
    image: '/product/bridal.webp',
  },
  {
    key: 'festive',
    href: '/shop?tier=festive',
    title: 'Festive Wear',
    caption: 'Festive & reception sarees',
    image: '/product/partywear.webp',
    badge: 'BESTSELLER',
  },
  {
    key: 'banarasi',
    href: '/shop?weave=Banarasi',
    title: 'Banarasi Sarees',
    caption: 'Pure silk weaves',
    image: '/product/banarasi.webp',
  },
];

function priceCaption(o: BackendOccasion): string {
  const from = o.fromAmount && o.fromAmount > 0 ? o.fromAmount : 0;
  const to = o.toAmount && o.toAmount > 0 ? o.toAmount : 0;
  if (from && to) return `${formatINR(from)} – ${formatINR(to)}`;
  if (from) return `From ${formatINR(from)}`;
  if (to) return `Up to ${formatINR(to)}`;
  return `Curated ${o.name.toLowerCase()} looks`;
}

function occasionToTile(o: BackendOccasion): Tile {
  return {
    key: o.id || o.name,
    href: `/shop?${new URLSearchParams({ occasion: o.id || o.name }).toString()}`,
    title: o.name,
    caption: priceCaption(o),
    image: o.image ?? '',
  };
}

export default function CategoryTiles() {
  const [tiles, setTiles] = useState<Tile[]>(FALLBACK_TILES);

  useEffect(() => {
    let cancelled = false;
    occasionsApi
      .list()
      .then((rows) => {
        if (cancelled) return;
        // Occasion tiles need an image to render meaningfully — skip
        // any that were configured without one.
        const withImages = rows.filter((o) => o.image);
        if (withImages.length > 0) {
          setTiles(withImages.map(occasionToTile));
        }
      })
      .catch(() => {
        // Silent — the fallback tiles already sit in state.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-bold uppercase tracking-wider text-gray-900">
            Shop by Occasion
          </h2>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-[#75001F] underline underline-offset-4"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
          {tiles.map((tile) => (
            <Link
              key={tile.key}
              href={tile.href}
              className="group relative block aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-gray-100"
            >
              {tile.image && (
                <Image
                  src={tile.image}
                  alt={tile.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {tile.badge && (
                <div className="absolute top-3 left-3 bg-[#75001F] text-white px-2.5 py-1 text-[0.65rem] font-bold tracking-wide">
                  {tile.badge}
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <div className="text-xl lg:text-2xl font-bold mb-0.5">{tile.title}</div>
                <div className="text-sm text-white/85 mb-2">{tile.caption}</div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                  Shop Now
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
