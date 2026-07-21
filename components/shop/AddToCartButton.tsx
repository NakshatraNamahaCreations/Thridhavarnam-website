'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { useShop } from '@/lib/shop-store';

type Variant = 'primary' | 'secondary' | 'compact';

export default function AddToCartButton({
  productId,
  variant = 'primary',
  className = '',
  qty = 1,
  children,
}: {
  productId: string;
  variant?: Variant;
  className?: string;
  qty?: number;
  children?: React.ReactNode;
}) {
  const { addToCart, inCart, hydrated } = useShop();
  const [justAdded, setJustAdded] = useState(false);
  const alreadyInCart = hydrated && inCart(productId);

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(productId, qty);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  };

  const label = justAdded
    ? 'Added ✓'
    : alreadyInCart
    ? 'Add Another'
    : children ?? 'Add to Bag';

  const base =
    'inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors whitespace-nowrap';

  const styles: Record<Variant, string> = {
    primary: 'bg-maroon-deep text-ivory px-7 py-3.5 hover:bg-maroon',
    secondary: 'bg-ivory text-ink border border-ink/30 px-6 py-3 hover:border-ink hover:bg-maroon-deep hover:text-ivory',
    compact: 'bg-maroon-deep text-ivory px-3 py-2 hover:bg-maroon',
  };

  return (
    <button
      type="button"
      onClick={handle}
      className={clsx(
        base,
        styles[variant],
        justAdded && 'bg-emerald-700 hover:bg-emerald-700',
        className,
      )}
    >
      {!justAdded && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 7h14l-1 14H6L5 7Z" />
          <path d="M9 7V5a3 3 0 0 1 6 0v2" />
        </svg>
      )}
      {label}
    </button>
  );
}
