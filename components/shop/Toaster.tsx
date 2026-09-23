'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useShop } from '@/lib/shop-store';

export default function Toaster() {
  const { toasts, dismissToast, getProduct } = useShop();

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((t) => {
        const product = getProduct(t.productId);
        const isAdd = t.kind === 'cart-add' || t.kind === 'wishlist-add';
        const isCart = t.kind === 'cart-add' || t.kind === 'cart-remove';
        const isBlocked = t.kind === 'wishlist-blocked';
        const accent = isBlocked
          ? 'border-l-amber-600'
          : isAdd
          ? isCart
            ? 'border-l-emerald-600'
            : 'border-l-maroon'
          : 'border-l-ink/60';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto bg-ivory no-pattern border border-ink/15 border-l-4 ${accent} shadow-lg rounded-sm flex items-center gap-3 p-3 pr-4 animate-[slideInRight_0.3s_ease-out]`}
            role="status"
          >
            {product && (
              <div className="relative w-12 h-14 shrink-0 bg-bone rounded-sm overflow-hidden">
                <Image
                  src={product.image}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[0.7rem] text-ink/55 uppercase tracking-wide font-semibold mb-0.5">
                {isBlocked
                  ? 'Out of Stock'
                  : isCart
                  ? isAdd
                    ? 'Added to Bag'
                    : 'Removed from Bag'
                  : isAdd
                  ? 'Saved to Wishlist'
                  : 'Removed from Wishlist'}
              </div>
              <div className="text-sm font-semibold text-ink truncate">
                {product?.name ?? 'Saree'}
              </div>
              {isCart && isAdd && (
                <Link
                  href="/shop?bag=1"
                  className="inline-block mt-1 text-[0.7rem] font-bold uppercase tracking-wider text-maroon hover:text-ink underline underline-offset-2"
                >
                  View Bag →
                </Link>
              )}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="text-ink/40 hover:text-ink shrink-0 self-start"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
