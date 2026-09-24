'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { categoriesApi, type BackendCategory } from '@/lib/api';

type Block = {
  key: string;
  href: string;
  title: string;
  subtitle: string;
  image: string;
};

// Fallback blocks used when the backend has no active categories with
// images. Preserves the original curated titles so a fresh database
// doesn't leave this section empty.
const FALLBACK_BLOCKS: Block[] = [
  {
    key: 'kanjeevaram',
    href: '/shop?weave=Kanjivaram',
    title: 'Kanjeevaram Sarees',
    subtitle: 'Silk body · Korvai borders',
    image: '/product/Explore-Kanjeevaram.webp',
  },
  {
    key: 'patola',
    href: '/shop?weave=Patola',
    title: 'Patola Sarees',
    subtitle: 'Double-ikat heritage',
    image: '/product/Explore-patola.webp',
  },
  {
    key: 'mysore',
    href: '/shop?weave=Mysore+Silk',
    title: 'Mysore Silk Sarees',
    subtitle: 'Crepe-soft Mysuru silk',
    image: '/product/Explore-Mysoresilk.webp',
  },
  {
    key: 'pochampally',
    href: '/shop?weave=Pochampally',
    title: 'Pochampally Sarees',
    subtitle: 'Resist-tied ikat geometry',
    image: '/product/Explore-baluchari.webp',
  },
];

function categoryToBlock(c: BackendCategory): Block {
  return {
    key: c.id || c.name,
    href: `/shop?${new URLSearchParams({ weave: c.name }).toString()}`,
    title: `${c.name} Sarees`,
    // Region is the admin-managed subtitle field (e.g. "Kanchipuram").
    // Falls back to a generic phrase when the field isn't filled in
    // so the block still reads cleanly.
    subtitle: c.region || 'Hand-woven heritage',
    image: c.image ?? '',
  };
}

export default function ExploreMore() {
  const [blocks, setBlocks] = useState<Block[]>(FALLBACK_BLOCKS);

  useEffect(() => {
    let cancelled = false;
    categoriesApi
      .list()
      .then((rows) => {
        if (cancelled) return;
        // Blocks need an image to render meaningfully — skip any that
        // were configured without one. Order controls display sequence.
        const withImages = rows
          .filter((c) => c.active !== false && c.image)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .slice(0, 4)
          .map(categoryToBlock);
        if (withImages.length > 0) {
          setBlocks(withImages);
        }
      })
      .catch(() => {
        // Silent — the fallback blocks are already in state.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-white border-t border-gray-200">
      <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <h2 className="text-base md:text-lg font-bold uppercase tracking-wider text-gray-900 mb-4">
          Explore More
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
          {blocks.map((b) => (
            <Link
              key={b.key}
              href={b.href}
              className="group relative block aspect-[4/3] md:aspect-[5/4] overflow-hidden bg-gray-100"
            >
              {b.image && (
                <Image
                  src={b.image}
                  alt={b.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover object-[50%_18%] transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-y-0 left-0 flex flex-col justify-center pl-6 lg:pl-8 max-w-md text-white">
                <div className="text-lg lg:text-xl font-bold mb-1">{b.title}</div>
                <div className="text-sm text-white/85 mb-2.5">{b.subtitle}</div>
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
