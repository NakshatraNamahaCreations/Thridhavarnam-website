'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useShop } from '@/lib/shop-store';
import { getProductHero } from '@/lib/product-images';
import { useScrollLock } from '@/lib/scroll-lock';

/**
 * StockLimitDialog — modal shown when a shopper tries to increase cart
 * quantity past the available stock. Reads `stockLimitAlert` from the shop
 * store so any surface that calls `updateCartQty` / `addToCart` triggers
 * the same popup without needing a local prop drill.
 */
export default function StockLimitDialog() {
  const { stockLimitAlert, dismissStockLimit, getProduct } = useShop();
  const open = Boolean(stockLimitAlert);

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissStockLimit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dismissStockLimit]);

  if (!stockLimitAlert) return null;

  const product = getProduct(stockLimitAlert.productId);
  const { maxQty } = stockLimitAlert;
  const unitLabel = maxQty === 1 ? 'unit' : 'units';

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="stock-limit-title"
      aria-describedby="stock-limit-desc"
      data-lenis-prevent
    >
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismissStockLimit}
        className="absolute inset-0 bg-[#1B0E0A]/70 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-sm bg-bone no-pattern shadow-2xl rounded-2xl p-6 md:p-7">
        <div className="flex items-start gap-3">
          <div
            aria-hidden
            className="shrink-0 w-10 h-10 rounded-full bg-maroon/10 text-maroon flex items-center justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 id="stock-limit-title" className="text-base font-semibold text-ink">
              Stock limit reached
            </h2>
            <p id="stock-limit-desc" className="mt-1.5 text-sm text-ink/70">
              Only <span className="font-semibold text-ink">{maxQty} {unitLabel}</span> left in stock
              {product?.name ? <> for <span className="font-semibold text-ink">{product.name}</span></> : null}.
              You cannot add more than that.
            </p>
          </div>
        </div>

        {product && (
          <div className="mt-4 flex items-center gap-3 bg-ivory/70 border border-ink/10 rounded-md p-3">
            <div
              className="relative w-12 h-14 shrink-0 bg-bone rounded-sm overflow-hidden"
              style={{ aspectRatio: '3 / 4' }}
            >
              <Image
                src={getProductHero(product)}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-ink/55 font-semibold">
                {product.weave}
              </div>
              <div className="text-sm font-semibold text-ink truncate">{product.name}</div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end">
          <button
            type="button"
            onClick={dismissStockLimit}
            autoFocus
            className="px-5 py-2.5 text-sm font-semibold text-ivory bg-maroon-deep hover:bg-maroon transition-colors rounded-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
