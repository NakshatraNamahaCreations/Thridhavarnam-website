'use client';

import Image from 'next/image';
import Link from 'next/link';

type Tile = {
  href: string;
  title: string;
  caption: string;
  image: string;
  badge?: string;
};

const TILES: Tile[] = [
  {
    href: '/shop?tier=bridal',
    title: 'Bridal Wear',
    caption: 'Wedding-ready bridal silk',
    image: '/product/bridal.webp',
  },
  {
    href: '/shop?tier=festive',
    title: 'Festive Wear',
    caption: 'Festive & reception sarees',
    image: '/product/partywear.webp',
    badge: 'BESTSELLER',
  },
  {
    href: '/shop?weave=Banarasi',
    title: 'Banarasi Sarees',
    caption: 'Pure silk weaves',
    image: '/product/banarasi.webp',
  },
];

export default function CategoryTiles() {
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-bold uppercase tracking-wider text-gray-900">
            Shop by Category
          </h2>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-[#75001F] underline underline-offset-4"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
          {TILES.map((tile) => (
            <Link
              key={tile.href + tile.title}
              href={tile.href}
              className="group relative block aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-gray-100"
            >
              <Image
                src={tile.image}
                alt={tile.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
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
