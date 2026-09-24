'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { bannersApi, categoriesApi, type BackendCategory } from '@/lib/api';

type Weave = {
  id: string;
  name: string;
  weaveKey: string; // matches the catalog's `weave` field
  image?: string;
  place: string;
};

export default function WeaveRail() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const [categories, setCategories] = useState<BackendCategory[]>([]);

  // Admin-uploaded weave-tile image overrides from the Banners tab.
  // Keyed by weave name — wins over the Category's own `image` field so
  // marketing can rotate the tile without editing the Category record.
  const [weaveImages, setWeaveImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      categoriesApi.list().catch(() => [] as BackendCategory[]),
      bannersApi.list().catch(() => []),
    ]).then(([cats, banners]) => {
      if (cancelled) return;
      setCategories(cats);
      const map: Record<string, string> = {};
      for (const b of banners) {
        if (b.type === 'weave' && b.active !== false && b.weave && b.image) {
          map[b.weave] = b.image;
        }
      }
      setWeaveImages(map);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const weaves = useMemo<Weave[]>(
    () =>
      categories
        .filter((c) => c.active !== false && c.name)
        .map((c) => ({
          id: c.id,
          name: c.name,
          weaveKey: c.name,
          image: c.image || undefined,
          place: c.region || '',
        })),
    [categories],
  );

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
  }, [updateButtons, weaves.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    // Each tile uses calc((100% - gaps)/N) so the rail always shows
    // exactly N full tiles — advancing by clientWidth lands on the
    // next page cleanly.
    el.scrollBy({ left: dir * (el.clientWidth + 16), behavior: 'smooth' });
  };

  return (
    <section className="bg-bone py-10 md:py-14">
      <div className="max-w-[1720px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between mb-6 md:mb-8 flex-wrap gap-3">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">
            Shop by weave
          </h2>
          <div className="flex items-center gap-4">
            <Link
              href="/shop"
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
          {weaves.map((w) => {
            // Banner override wins over the Category's own tile image.
            const image = weaveImages[w.weaveKey] ?? weaveImages[w.name] ?? w.image;
            return (
              <Link
                key={w.id}
                href={`/shop?weave=${encodeURIComponent(w.weaveKey)}`}
                data-card
                className="group shrink-0 w-[calc((100%-12px)/2)] md:w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)] xl:w-[calc((100%-64px)/5)] snap-start"
              >
                <div className="relative aspect-square overflow-hidden bg-ivory no-pattern rounded-sm">
                  {image ? (
                    <Image
                      src={image}
                      alt={w.name}
                      fill
                      sizes="(max-width: 640px) 46vw, (max-width: 768px) 46vw, (max-width: 1024px) 30vw, (max-width: 1280px) 23vw, 18vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-maroon-deep via-maroon to-maroon-deep flex items-center justify-center p-4 transition-transform duration-500 group-hover:scale-105">
                      <span className="font-display text-ivory/95 text-lg md:text-xl text-center leading-tight">
                        {w.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="pt-3">
                  <div className="text-base md:text-lg font-bold text-ink leading-tight">
                    {w.name}
                  </div>
                  {w.place && (
                    <div className="text-[0.7rem] text-ink/55 mt-1">{w.place}</div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
