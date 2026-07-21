'use client';

import { useEffect, useRef, useState } from 'react';
import { SAREES } from '@/lib/sarees';
import ProductCard from './ProductCard';

export default function ProductRail({
  title,
  ids,
}: {
  title: string;
  ids: string[];
}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const items = ids
    .map((id) => SAREES.find((s) => s.id === id))
    .filter((s): s is (typeof SAREES)[number] => Boolean(s));

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const update = () => {
      setCanPrev(el.scrollLeft > 4);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [items.length]);

  if (items.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector('[data-rail-card]') as HTMLElement | null;
    const step = (card?.offsetWidth ?? 240) + 16;
    el.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
  };

  return (
    <section className="bg-white border-t border-gray-200">
      <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-8 lg:py-10">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">{title}</h2>
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={!canPrev}
              aria-label="Scroll left"
              className="w-9 h-9 border border-gray-300 flex items-center justify-center text-gray-900 hover:bg-gray-900 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={!canNext}
              aria-label="Scroll right"
              className="w-9 h-9 border border-gray-300 flex items-center justify-center text-gray-900 hover:bg-gray-900 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
          </div>
        </div>

        <div
          ref={railRef}
          className="flex gap-3 lg:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2"
        >
          {items.map((saree) => (
            <div
              key={saree.id}
              data-rail-card
              className="shrink-0 w-[200px] md:w-[230px] lg:w-[260px] snap-start"
            >
              <ProductCard saree={saree} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
