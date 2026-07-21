'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SAREES, formatINR, TIERS, productSlug } from '@/lib/sarees';
import WishlistButton from '@/components/shop/WishlistButton';

// Kept at 10 so the desktop view of 5-per-row scrolls cleanly to a second
// page of 5 without showing the previous page's cards again. (At 8, one
// page-scroll was landing the rail at the end and visibly repeating the
// last two cards from page 1.)
const trendingIds = [
  'banarasi-jamawar',
  'mysore-tara',
  'mangalagiri-megha',
  'patola-rasleela',
  'pochampally-aakash',
  'mixedpattu-katha',
  'banarasi-saanjh',
  'kanjivaram-mayura',
  'gadwal-konark',
  'fancy-cocktail',
];

const stockLeft: Record<string, number> = {
  'banarasi-jamawar': 2,
  'mysore-tara': 4,
  'mangalagiri-megha': 1,
  'patola-rasleela': 1,
  'pochampally-aakash': 6,
  'mixedpattu-katha': 3,
  'banarasi-saanjh': 5,
  'kanjivaram-mayura': 2,
  'gadwal-konark': 2,
  'fancy-cocktail': 1,
};

export default function PressStrip() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateButtons = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateButtons();
    const el = railRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    return () => {
      el.removeEventListener('scroll', updateButtons);
      window.removeEventListener('resize', updateButtons);
    };
  }, [updateButtons]);

  const scrollBy = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    // Each card uses calc((100% - gaps)/N) so the rail always shows
    // exactly N full cards — advancing by clientWidth lands on the
    // next page cleanly.
    el.scrollBy({ left: dir * (el.clientWidth + 16), behavior: 'smooth' });
  };

  const items = trendingIds
    .map((id) => SAREES.find((s) => s.id === id))
    .filter((s): s is (typeof SAREES)[number] => Boolean(s));

  return (
    <section className="bg-ivory py-10 md:py-14">
      <div className="max-w-[1720px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between mb-6 md:mb-8 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">
              Selling fast
            </h2>
            <span className="inline-flex items-center gap-2 bg-maroon/10 text-maroon px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-maroon opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-maroon" />
              </span>
              Low Stock
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/shop?sort=trending"
              className="text-sm font-semibold text-ink hover:text-maroon transition-colors underline underline-offset-4"
            >
              View All
            </Link>
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scrollBy(-1)}
                disabled={!canPrev}
                aria-label="Scroll left"
                className="w-9 h-9 rounded-full border border-ink/20 flex items-center justify-center text-ink hover:bg-maroon-deep hover:text-ivory disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ‹
              </button>
              <button
                onClick={() => scrollBy(1)}
                disabled={!canNext}
                aria-label="Scroll right"
                className="w-9 h-9 rounded-full border border-ink/20 flex items-center justify-center text-ink hover:bg-maroon-deep hover:text-ivory disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        <div
          ref={railRef}
          className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2"
        >
          {items.map((saree) => {
            const stock = stockLeft[saree.id] ?? 5;
            const tier = TIERS[saree.tier];
            return (
              <Link
                key={saree.id}
                href={`/shop/${productSlug(saree)}`}
                data-card
                className="group shrink-0 w-[calc((100%-12px)/2)] md:w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)] xl:w-[calc((100%-64px)/5)] snap-start bg-white"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-bone rounded-sm">
                  <Image
                    src={saree.image}
                    alt={saree.name}
                    fill
                    sizes="(max-width: 640px) 46vw, (max-width: 768px) 46vw, (max-width: 1024px) 30vw, (max-width: 1280px) 23vw, 18vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {stock <= 3 ? (
                    <div className="absolute top-2.5 left-2.5 bg-maroon text-ivory px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider rounded-sm">
                      Only {stock} Left
                    </div>
                  ) : (
                    <div className="absolute top-2.5 left-2.5 bg-ivory/95 no-pattern backdrop-blur-sm text-ink px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide rounded-sm">
                      {tier.title}
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
                </div>
                <div className="p-3">
                  <div className="text-[0.7rem] text-ink/55 font-medium mb-1">
                    {saree.weave}
                  </div>
                  <h3 className="text-sm font-semibold text-ink leading-snug line-clamp-1 mb-2">
                    {saree.name}
                  </h3>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold text-ink">
                      {formatINR(saree.price)}
                    </span>
                    <span className="text-[0.7rem] font-bold text-maroon group-hover:text-ink transition-colors">
                      Shop →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
