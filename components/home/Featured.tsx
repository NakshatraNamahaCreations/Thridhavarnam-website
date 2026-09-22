'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type Saree, formatINR, TIERS, productSlug } from '@/lib/sarees';
import { productsApi, backendToSaree } from '@/lib/api';
import WishlistButton from '@/components/shop/WishlistButton';
import AddToCartButton from '@/components/shop/AddToCartButton';

type Tab = 'new' | 'bridal' | 'festive' | 'everyday';

// "New In" is driven by the admin's `new_in` flag, everything else by tier
// (which itself is driven by the admin's Occasion tag).
const tabs: { id: Tab; label: string; filter: (s: Saree) => boolean }[] = [
  { id: 'new', label: 'New In', filter: (s) => Array.isArray(s.flags) && s.flags.includes('new_in') },
  { id: 'bridal', label: 'Bridal', filter: (s) => s.tier === 'bridal' },
  { id: 'festive', label: 'Festive', filter: (s) => s.tier === 'festive' },
  { id: 'everyday', label: 'Everyday', filter: (s) => s.tier === 'everyday' },
];

// Per-saree rating + review counts. These are display-only stats — when
// the backend lands, this map gets replaced with values from the API
// (or moved onto the saree record itself, alongside mrp / badges).
// IMPORTANT: never invent display names / prices for catalog sarees
// here — the card's <Link href={`/shop/${productSlug(saree)}`}> binds to the real
// saree, so a fake display name would mismap the card to the wrong
// detail page AND collide with real catalog entries of the same name.
const productMeta: Record<string, { rating: number; reviews: number }> = {
  'banarasi-raktarani': { rating: 4.9, reviews: 142 },
  'kanjivaram-mayura': { rating: 4.8, reviews: 89 },
  'patola-rasleela': { rating: 5.0, reviews: 34 },
  'mixedpattu-katha': { rating: 4.8, reviews: 56 },
  'kanjivaram-neelambari': { rating: 4.8, reviews: 71 },
  'mixedpattu-mor': { rating: 4.9, reviews: 64 },
  'patola-vrindavan': { rating: 4.9, reviews: 48 },
  'mixedpattu-ramayana': { rating: 4.7, reviews: 53 },
  'fancy-haldi': { rating: 4.9, reviews: 76 },
  'mysore-chandrika': { rating: 4.7, reviews: 121 },
  'banarasi-jamawar': { rating: 4.8, reviews: 67 },
  'mangalagiri-megha': { rating: 4.6, reviews: 98 },
  'banarasi-sindhoori': { rating: 4.7, reviews: 82 },
  'kanjivaram-surya': { rating: 4.6, reviews: 74 },
  'mysore-mallika': { rating: 4.6, reviews: 109 },
  'gadwal-konark': { rating: 4.7, reviews: 88 },
  'patola-rangraj': { rating: 4.5, reviews: 41 },
  'gadwal-krishna': { rating: 4.7, reviews: 58 },
  'mangalagiri-chandni': { rating: 4.6, reviews: 73 },
  'pochampally-aakash': { rating: 4.7, reviews: 203 },
  'mangalagiri-tulsi': { rating: 4.5, reviews: 178 },
  'mysore-tara': { rating: 4.5, reviews: 145 },
  'banarasi-saanjh': { rating: 4.6, reviews: 89 },
  'kanjivaram-lavanya': { rating: 4.6, reviews: 96 },
  'pochampally-bandhakala': { rating: 4.7, reviews: 134 },
};

export default function Featured() {
  const [tab, setTab] = useState<Tab>('new');
  const [catalog, setCatalog] = useState<Saree[]>([]);

  useEffect(() => {
    let cancelled = false;
    productsApi
      .list()
      .then((rows) => {
        if (!cancelled) setCatalog(rows.map(backendToSaree));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const items = catalog.filter(tabs.find((t) => t.id === tab)!.filter).slice(0, 8);

  return (
    <section className="bg-bone py-10 md:py-14">
      <div className="max-w-[1720px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">
            New arrivals
          </h2>
          <Link
            href="/shop"
            className="text-sm font-semibold text-ink hover:text-maroon transition-colors underline underline-offset-4"
          >
            View All
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 md:mb-8 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-sm px-5 py-2.5 rounded-full font-semibold transition-colors ${
                tab === t.id
                  ? 'bg-maroon-deep text-ivory'
                  : 'bg-ivory no-pattern text-ink border border-ink/15 hover:border-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {items.map((saree) => {
            const tierTitle = saree.tier in TIERS ? TIERS[saree.tier].title : '';
            const meta = productMeta[saree.id] ?? { rating: 4.7, reviews: 50 };
            const discount =
              saree.mrp > saree.price
                ? Math.round(((saree.mrp - saree.price) / saree.mrp) * 100)
                : 0;
            const outOfStock = typeof saree.stock === 'number' && saree.stock <= 0;
            return (
              <Link
                key={saree.id}
                href={`/shop/${productSlug(saree)}`}
                className="group block bg-white rounded-sm overflow-hidden"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-bone">
                  <Image
                    src={saree.image}
                    alt={saree.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className={`object-cover transition-transform duration-500 group-hover:scale-105 ${outOfStock ? 'opacity-60 grayscale' : ''}`}
                  />
                  {outOfStock && (
                    <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
                      <span className="bg-black/85 text-ivory px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider rounded-sm">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {!outOfStock && (
                    <div className="absolute top-2.5 left-2.5 bg-ivory/95 no-pattern backdrop-blur-sm px-2 py-1 text-[0.65rem] font-semibold text-ink uppercase tracking-wide rounded-sm">
                      {tierTitle || saree.weave}
                    </div>
                  )}
                  {discount > 0 && !outOfStock && (
                    <div className="absolute top-2.5 right-2.5 bg-maroon-deep text-ivory px-2 py-1 text-[0.65rem] font-bold rounded-sm">
                      {discount}% OFF
                    </div>
                  )}
                  <WishlistButton
                    productId={saree.id}
                    className="absolute bottom-2.5 right-2.5 w-9 h-9"
                    size={14}
                  />
                  {/* Brand watermark — cream T+V monogram, bottom-left corner. */}
                  <img
                    src="/brand/logomark-cream.svg"
                    alt=""
                    aria-hidden
                    draggable={false}
                    className="absolute bottom-2.5 left-2.5 w-5 h-5 md:w-6 md:h-6 opacity-75 pointer-events-none select-none z-10"
                  />
                  {/* Hover Add-to-Bag bar */}
                  {!outOfStock && (
                    <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="pointer-events-auto">
                        <AddToCartButton
                          productId={saree.id}
                          variant="primary"
                          className="w-full !px-3 !py-2.5"
                        >
                          Add to Bag
                        </AddToCartButton>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-3.5">
                  <div className="text-[0.7rem] text-ink/55 font-medium mb-1">
                    {saree.weave}
                  </div>
                  <h3 className="text-sm font-semibold text-ink leading-snug line-clamp-1 mb-2">
                    {saree.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center gap-1 bg-bone text-ink px-1.5 py-0.5 rounded-sm">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-gold-deep" aria-hidden>
                        <path d="m12 2 2.9 6.9L22 10l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.2L2 10l7.1-1.1L12 2Z" />
                      </svg>
                      <span className="text-[0.7rem] font-semibold">{meta.rating}</span>
                    </div>
                    <span className="text-[0.7rem] text-ink/55">({meta.reviews})</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-ink">{formatINR(saree.price)}</span>
                    {saree.mrp > saree.price && (
                      <span className="text-xs text-ink/45 line-through">{formatINR(saree.mrp)}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-maroon-deep text-ivory px-8 py-3 text-sm font-bold uppercase tracking-wider rounded-sm hover:bg-maroon transition-colors"
          >
            View All Sarees
          </Link>
        </div>
      </div>
    </section>
  );
}
