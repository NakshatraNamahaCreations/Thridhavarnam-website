'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { type SAREES, formatINR } from '@/lib/sarees';
import { getProductHero } from '@/lib/product-images';
import { useShop } from '@/lib/shop-store';

type Saree = (typeof SAREES)[number];

/**
 * StickyBuyBar — appears at the bottom of the viewport once the user has
 * scrolled past the primary CTAs, so the visitor can always Add to Cart
 * without scrolling back up. Mirrors Kalki's product-page sticky bar.
 */
export default function StickyBuyBar({
  saree,
  mrp,
}: {
  saree: Saree;
  mrp?: number;
}) {
  const { addToCart } = useShop();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const discount = mrp ? Math.round(((mrp - saree.price) / mrp) * 100) : 0;

  return (
    <div
      data-sticky-buybar
      data-visible={visible ? '1' : '0'}
      className={`fixed inset-x-0 bottom-0 z-30 bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-4">
        <div className="relative w-12 h-16 shrink-0 overflow-hidden bg-gray-100">
          <Image src={getProductHero(saree)} alt="" fill sizes="48px" className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 line-clamp-1">{saree.name}</div>
          <div className="flex items-baseline gap-2 flex-wrap mt-0.5">
            <span className="text-base font-bold text-gray-900 tabular-nums">
              {formatINR(saree.price)}
            </span>
            {mrp && (
              <>
                <span className="text-xs text-gray-500 line-through tabular-nums">
                  {formatINR(mrp)}
                </span>
                <span className="text-xs font-bold text-[#75001F] tabular-nums">
                  {discount}% Off
                </span>
              </>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => addToCart(saree.id, 1)}
          className="shrink-0 border-2 border-gray-900 text-gray-900 bg-white px-5 lg:px-8 py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-900 hover:text-white transition-colors flex items-center gap-2"
        >
          <span>Add to Cart</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline tabular-nums">{formatINR(saree.price)}</span>
        </button>
      </div>
    </div>
  );
}
