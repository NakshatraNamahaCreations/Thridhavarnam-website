'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SAREES, formatINR, productSlug } from '@/lib/sarees';
import { getProductHero } from '@/lib/product-images';
import { useShop } from '@/lib/shop-store';
import { useLoginModal } from '@/lib/login-modal';
import { useCheckoutModal } from '@/lib/checkout-modal';
import { useAuth } from '@/lib/auth';
import { couponsApi, calcCouponDiscount, type BackendCoupon } from '@/lib/api';

export default function BagPanel({
  heading,
}: {
  heading: { title: string; sub: string };
}) {
  const {
    cart, hydrated, cartSubtotal, updateCartQty, removeFromCart, clearCart, getProduct,
  } = useShop();
  const { openLogin } = useLoginModal();
  const { openCheckout } = useCheckoutModal();
  const { user, hydrated: authHydrated } = useAuth();

  // Gated checkout: if the user is not signed in, open login first and
  // resume the checkout via the post-login callback.
  const handleCheckout = () => {
    if (!authHydrated) return;
    if (!user) {
      openLogin(() => openCheckout());
      return;
    }
    openCheckout();
  };

  const items = cart
    .map((c) => {
      const saree = getProduct(c.productId);
      return saree ? { saree, qty: c.quantity } : null;
    })
    .filter((x): x is { saree: (typeof SAREES)[number]; qty: number } => Boolean(x));

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  const [coupons, setCoupons] = useState<BackendCoupon[]>([]);
  useEffect(() => {
    let cancelled = false;
    couponsApi
      .list()
      .then((rows) => {
        if (cancelled) return;
        const now = Date.now();
        setCoupons(
          rows.filter((c) => {
            if (c.active === false) return false;
            if (c.expiryDate) {
              const t = new Date(c.expiryDate).getTime();
              if (!Number.isNaN(t) && t < now) return false;
            }
            return true;
          }),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Empty state owns the full viewport in Kalki style — centered headline +
  // big CTA + login prompt. No breadcrumb / header chrome that would weigh
  // down a zero-state page.
  if (hydrated && items.length === 0) {
    return <EmptyState openLogin={openLogin} />;
  }

  return (
    <div className="bg-ivory min-h-screen text-ink">
      <header className="border-b border-ink/10">
        <div className="max-w-[1720px] mx-auto px-6 lg:px-10 py-6 lg:py-8">
          <nav aria-label="Breadcrumb" className="text-xs text-ink/55 mb-3">
            <Link href="/home" className="hover:text-ink">Home</Link>
            <span className="mx-1.5">/</span>
            <Link href="/shop" className="hover:text-ink">All Sarees</Link>
            <span className="mx-1.5">/</span>
            <span className="text-ink">Shopping Bag</span>
          </nav>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-ink leading-tight">
              {heading.title}
              <span className="ml-3 text-base text-ink/55 font-normal tabular-nums">
                ({hydrated ? itemCount : 0} {itemCount === 1 ? 'item' : 'items'})
              </span>
            </h1>
            {hydrated && items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-semibold text-maroon hover:underline"
              >
                Remove all
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[1720px] mx-auto px-6 lg:px-10 py-6 lg:py-8">
        {!hydrated ? (
          <ListSkeleton />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <ul className="flex-1 border border-ink/10 divide-y divide-ink/10 bg-ivory">
              {items.map(({ saree, qty }) => (
                <li key={saree.id} className="flex gap-4 lg:gap-6 p-4 lg:p-6">
                  <Link
                    href={`/shop/${productSlug(saree)}`}
                    className="relative w-24 h-32 lg:w-28 lg:h-36 shrink-0 overflow-hidden bg-bone"
                  >
                    <Image
                      src={getProductHero(saree)}
                      alt={saree.name}
                      fill
                      sizes="140px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="text-xs text-ink/55 mb-1 font-medium">
                      {saree.weave}
                    </div>
                    <Link
                      href={`/shop/${productSlug(saree)}`}
                      className="text-sm md:text-base font-semibold text-ink hover:text-maroon transition-colors leading-snug mb-1"
                    >
                      {saree.name}
                    </Link>
                    <div className="text-xs text-ink/55 mb-3">{saree.region}</div>

                    <div className="flex items-end justify-between gap-3 mt-auto flex-wrap">
                      <QtyStepper
                        qty={qty}
                        onMinus={() => updateCartQty(saree.id, qty - 1)}
                        onPlus={() => updateCartQty(saree.id, qty + 1)}
                      />
                      <div className="flex items-baseline gap-4">
                        <span className="text-base font-bold text-ink tabular-nums">
                          {formatINR(saree.price * qty)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(saree.id)}
                          aria-label={`Remove ${saree.name}`}
                          className="text-xs font-medium text-ink/55 hover:text-maroon underline underline-offset-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="w-full lg:w-[340px] shrink-0 space-y-4 lg:sticky lg:top-20 lg:self-start">
              {coupons.length > 0 && (
                <div className="border border-ink/15 bg-bone/30 p-5 lg:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-maroon" aria-hidden>
                      <path d="M20 12 13 5H4v9l7 7Z" />
                      <circle cx="8" cy="9" r="1" />
                    </svg>
                    <h2 className="text-base font-bold text-ink">Available coupons</h2>
                  </div>
                  <ul className="space-y-2">
                    {coupons.map((c) => {
                      const discount = calcCouponDiscount(c, cartSubtotal);
                      const eligible = discount > 0;
                      return (
                        <li
                          key={c.id}
                          className={`border border-dashed p-3 flex items-start justify-between gap-3 ${eligible ? 'border-maroon/40 bg-ivory' : 'border-ink/15 bg-bone/20 opacity-70'}`}
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-ink tabular-nums tracking-wider">{c.code}</div>
                            {c.description && (
                              <div className="text-[11px] text-ink/65 mt-0.5 leading-snug">{c.description}</div>
                            )}
                            <div className="text-[11px] text-ink/55 mt-1">
                              {c.type === 'percent'
                                ? `${c.value}% off${c.maxDiscount ? ` (max ${formatINR(c.maxDiscount)})` : ''}`
                                : `${formatINR(c.value)} off`}
                              {c.minOrder ? ` · Min ${formatINR(c.minOrder)}` : ''}
                            </div>
                          </div>
                          {eligible ? (
                            <span className="shrink-0 text-[11px] font-bold text-peacock tabular-nums">
                              − {formatINR(discount)}
                            </span>
                          ) : c.minOrder && cartSubtotal < c.minOrder ? (
                            <span className="shrink-0 text-[10px] text-ink/55 uppercase tracking-wider">
                              Add {formatINR(c.minOrder - cartSubtotal)}
                            </span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-3 text-[11px] text-ink/55">Apply your code at checkout.</p>
                </div>
              )}

              <div className="border border-ink/15 bg-bone/30 p-5 lg:p-6">
                <h2 className="text-base font-bold text-ink mb-4">Order Summary</h2>
                <Row
                  label={`Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`}
                  value={formatINR(cartSubtotal)}
                />
                <Row label="Shipping" value="FREE" highlight />
                <Row label="Estimated tax" value="At checkout" muted />
                <div className="h-px bg-ink/15 my-3" />
                <Row label="Total" value={formatINR(cartSubtotal)} strong />

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="mt-5 block w-full bg-maroon-deep text-ivory py-3 text-sm font-semibold tracking-wide hover:bg-maroon transition-colors text-center"
                >
                  Proceed to Checkout
                </button>

                <Link
                  href="/shop"
                  className="mt-3 block text-center text-sm font-medium text-ink/65 hover:text-ink underline underline-offset-2 py-1"
                >
                  Continue shopping
                </Link>

                <div className="mt-5 pt-4 border-t border-ink/10 space-y-2">
                  <InfoRow icon="truck" label="Free shipping across India on every order" />
                  <InfoRow icon="shield" label="Insured & tracked dispatch in 5–7 days" />
                  <InfoRow icon="return" label="Exchange & returns within 48 Hrs of delivery" />
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ openLogin }: { openLogin: () => void }) {
  return (
    <div className="bg-ivory min-h-screen text-ink">
      <header className="border-b border-ink/10">
        <div className="max-w-[1720px] mx-auto px-6 lg:px-10 py-6 lg:py-8">
          <nav aria-label="Breadcrumb" className="text-xs text-ink/55 mb-3">
            <Link href="/home" className="hover:text-ink">Home</Link>
            <span className="mx-1.5">/</span>
            <Link href="/shop" className="hover:text-ink">All Sarees</Link>
            <span className="mx-1.5">/</span>
            <span className="text-ink">Shopping Bag</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-ink leading-tight">
            Shopping Bag
            <span className="ml-3 text-base text-ink/55 font-normal tabular-nums">(0 items)</span>
          </h1>
        </div>
      </header>

      <div className="max-w-[1720px] mx-auto px-6 lg:px-10 py-6 lg:py-8">
        <div className="border border-ink/15 bg-bone/30 p-6 lg:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-ink">Your bag is empty.</div>
            <p className="mt-1 text-xs text-ink/65">
              Browse the catalogue or{' '}
              <button
                type="button"
                onClick={() => openLogin()}
                className="underline underline-offset-2 text-ink hover:text-maroon font-semibold"
              >
                login
              </button>{' '}
              to restore a saved bag.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-block bg-maroon-deep text-ivory px-6 py-2.5 text-xs font-semibold tracking-wide hover:bg-maroon transition-colors text-center"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

function QtyStepper({
  qty,
  onMinus,
  onPlus,
}: {
  qty: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="inline-flex items-center border border-ink/20">
      <button
        type="button"
        onClick={onMinus}
        aria-label="Decrease quantity"
        className="w-8 h-8 flex items-center justify-center text-ink hover:bg-maroon-deep hover:text-ivory transition-colors text-base"
      >
        −
      </button>
      <span className="w-9 text-center text-sm font-medium tabular-nums">{qty}</span>
      <button
        type="button"
        onClick={onPlus}
        aria-label="Increase quantity"
        className="w-8 h-8 flex items-center justify-center text-ink hover:bg-maroon-deep hover:text-ivory transition-colors text-base"
      >
        +
      </button>
    </div>
  );
}

function Row({
  label,
  value,
  muted = false,
  strong = false,
  highlight = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between py-1.5">
      <span className={`text-sm ${muted ? 'text-ink/55' : 'text-ink/80'}`}>{label}</span>
      <span
        className={`tabular-nums ${
          strong
            ? 'text-lg font-bold text-ink'
            : highlight
            ? 'text-sm font-bold text-peacock'
            : muted
            ? 'text-xs text-ink/55'
            : 'text-sm font-semibold text-ink'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function InfoRow({ icon, label }: { icon: 'truck' | 'shield' | 'return'; label: string }) {
  return (
    <div className="flex items-start gap-2 text-xs text-ink/70">
      <span className="text-ink/45 shrink-0 mt-0.5">
        {icon === 'truck' && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M3 7h11v9H3zM14 11h4l3 3v2h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" />
          </svg>
        )}
        {icon === 'shield' && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M12 3 4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6z" />
          </svg>
        )}
        {icon === 'return' && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M3 12a9 9 0 1 0 3-6.7" strokeLinecap="round" /><path d="M3 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span>{label}</span>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border border-ink/10">
          <div className="w-28 h-36 bg-bone animate-pulse" />
          <div className="flex-1 space-y-3 py-2">
            <div className="h-3 bg-bone w-1/4 animate-pulse" />
            <div className="h-5 bg-bone w-1/2 animate-pulse" />
            <div className="h-3 bg-bone w-1/3 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
