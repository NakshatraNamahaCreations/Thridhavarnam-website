'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type Saree, formatINR, TIERS, productSlug } from '@/lib/sarees';
import { productsApi, backendToSaree } from '@/lib/api';
import WishlistButton from '@/components/shop/WishlistButton';

// Override images for matched products with the dedicated bestsellers shots.
// Unmatched ids fall back to the catalog's `saree.image`.
const bestSellerImages: Record<string, string> = {
  'banarasi-raktarani': '/bestsellers/raktharani%20banarasi.webp',
  'kanjivaram-mayura': '/bestsellers/Mayura%20kanjee.webp',
  'fancy-haldi': '/Partysarees/P1.webp',
  'patola-rasleela': '/bestsellers/Rasleela%20patola2.webp',
  'mysore-chandrika': '/bestsellers/chandrika%20mysuru.webp',
  'mixedpattu-katha': '/bestsellers/katha%20baluchari.webp',
};

// Rating + review counts — display-only, will move to the saree record
// when the backend lands. MRP comes from the saree itself (saree.mrp).
const productMeta: Record<string, { rating: number; reviews: number }> = {
  'banarasi-raktarani': { rating: 4.9, reviews: 142 },
  'kanjivaram-mayura': { rating: 4.8, reviews: 89 },
  'fancy-haldi': { rating: 4.9, reviews: 76 },
  'patola-rasleela': { rating: 5.0, reviews: 34 },
  'mysore-chandrika': { rating: 4.7, reviews: 121 },
  'mixedpattu-katha': { rating: 4.8, reviews: 56 },
  'mangalagiri-megha': { rating: 4.6, reviews: 98 },
  'pochampally-aakash': { rating: 4.7, reviews: 203 },
  'banarasi-jamawar': { rating: 4.8, reviews: 67 },
  'mysore-tara': { rating: 4.5, reviews: 145 },
};

function ProductCard({ saree, badge }: { saree: Saree; badge?: string }) {
  const meta = productMeta[saree.id] ?? { rating: 4.8, reviews: 50 };
  const tierTitle = (saree.tier in TIERS ? TIERS[saree.tier].title : '') as string;
  const discount =
    saree.mrp > saree.price
      ? Math.round(((saree.mrp - saree.price) / saree.mrp) * 100)
      : 0;
  const outOfStock = typeof saree.stock === 'number' && saree.stock <= 0;

  return (
    <Link
      href={`/shop/${productSlug(saree)}`}
      data-card
      className="group shrink-0 w-[calc((100%-12px)/2)] md:w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)] xl:w-[calc((100%-64px)/5)] snap-start bg-white"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-bone rounded-sm">
        <Image
          src={bestSellerImages[saree.id] ?? saree.image}
          alt={saree.name}
          fill
          sizes="(max-width: 640px) 46vw, (max-width: 768px) 46vw, (max-width: 1024px) 30vw, (max-width: 1280px) 23vw, 18vw"
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${outOfStock ? 'opacity-60 grayscale' : ''}`}
        />
        {outOfStock && (
          <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
            <span className="bg-black/85 text-ivory px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider rounded-sm">
              Out of Stock
            </span>
          </div>
        )}
        {badge && !outOfStock && (
          <div className="absolute top-2.5 left-2.5 bg-maroon text-ivory px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider rounded-sm">
            {badge}
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
      </div>
      <div className="p-3">
        <div className="text-[0.7rem] text-ink/55 mb-1 font-medium">
          {saree.weave}{tierTitle ? ` · ${tierTitle}` : ''}
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
}

export default function BestSellers() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [items, setItems] = useState<Saree[]>([]);

  useEffect(() => {
    let cancelled = false;
    productsApi
      .list()
      .then((rows) => {
        if (cancelled) return;
        const bestsellers = rows
          .map(backendToSaree)
          .filter((s) => Array.isArray(s.flags) && s.flags.includes('bestseller'));
        setItems(bestsellers);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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
    // Advance one full page (rail clientWidth + one gap). Because each
    // card now uses calc((100% - gaps)/N) widths, the rail always shows
    // exactly N full cards — so paging by clientWidth lands cleanly on
    // the next set of N cards, with snap-mandatory aligning the seam.
    el.scrollBy({ left: dir * (el.clientWidth + 16), behavior: 'smooth' });
  };

  if (!items.length) return null;

  return (
    <section className="bg-ivory py-10 md:py-14">
      <div className="max-w-[1720px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between mb-6 md:mb-8 flex-wrap gap-3">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">
            Bestsellers
          </h2>
          <div className="flex items-center gap-4">
            <Link
              href="/shop?sort=bestsellers"
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
          className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2"
        >
          {items.map((saree, i) => (
            <ProductCard
              key={saree.id}
              saree={saree}
              badge={i === 0 ? 'Bestseller' : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
