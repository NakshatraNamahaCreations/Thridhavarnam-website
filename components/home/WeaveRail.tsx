'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SAREES } from '@/lib/sarees';

// Count of pieces per weave (for the "X pieces" badge)
const weaveCounts: Record<string, number> = {};
SAREES.forEach((s) => {
  weaveCounts[s.weave] = (weaveCounts[s.weave] ?? 0) + 1;
});

// Weave catalog for the home rail. Mirrors the navbar order. Image is
// optional — categories without paired photography on disk fall back to
// a brand-toned placeholder tile (see render block below).
// Spelling on disk: kanjeevaram.png, Mysore silk.png, Patola.png — encoded
// so the path stays correct.
type Weave = {
  id: string;
  name: string;
  weaveKey: string; // matches the catalog's `weave` field
  image?: string;
  place: string;
};

const weaves: Weave[] = [
  {
    id: 'kanjivaram',
    name: 'Kanjeevaram',
    weaveKey: 'Kanjivaram',
    image: '/Byweaves/kanjeevaram.webp',
    place: 'Kanchipuram',
  },
  {
    id: 'banarasi',
    name: 'Banarasi',
    weaveKey: 'Banarasi',
    image: '/Byweaves/banarasi.webp',
    place: 'Varanasi',
  },
  {
    id: 'mysore',
    name: 'Mysore Silk',
    weaveKey: 'Mysore Silk',
    image: '/Byweaves/Mysore%20silk.webp',
    place: 'Mysuru',
  },
  {
    id: 'mangalagiri',
    name: 'Mangalagiri',
    weaveKey: 'Mangalagiri',
    image: '/Byweaves/mangalagiri.webp',
    place: 'Andhra Pradesh',
  },
  {
    id: 'pochampally',
    name: 'Pochampally',
    weaveKey: 'Pochampally',
    image: '/Byweaves/Pochampally.webp',
    place: 'Telangana',
  },
  {
    id: 'gadwal',
    name: 'Gadwal',
    weaveKey: 'Gadwal',
    image: '/Byweaves/Gadwal.webp',
    place: 'Telangana',
  },
  {
    id: 'patola',
    name: 'Patola',
    weaveKey: 'Patola',
    image: '/Byweaves/Patola.webp',
    place: 'Patan',
  },
  {
    id: 'fancy',
    name: 'Fancy Sarees',
    weaveKey: 'Fancy Sarees',
    image: '/Byweaves/fancy-saree.webp',
    place: 'Contemporary',
  },
  {
    id: 'mixed-pattu',
    name: 'Mixed Pattu Sarees',
    weaveKey: 'Mixed Pattu Sarees',
    image: '/Byweaves/Mixed-pattu.webp',
    place: 'Fusion drapes',
  },
];

export default function WeaveRail() {
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
            const count = weaveCounts[w.weaveKey] ?? 0;
            return (
              <Link
                key={w.id}
                href={`/shop?weave=${encodeURIComponent(w.weaveKey)}`}
                data-card
                className="group shrink-0 w-[calc((100%-12px)/2)] md:w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)] xl:w-[calc((100%-64px)/5)] snap-start"
              >
                <div className="relative aspect-square overflow-hidden bg-ivory no-pattern rounded-sm">
                  {w.image ? (
                    <Image
                      src={w.image}
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
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-[0.7rem] text-ink/55">{w.place}</div>
                    <div className="text-[0.7rem] font-semibold text-ink/65">
                      {count} {count === 1 ? 'piece' : 'pieces'}
                    </div>
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
