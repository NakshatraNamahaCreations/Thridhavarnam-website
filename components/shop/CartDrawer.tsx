'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { SAREES, formatINR, productSlug } from '@/lib/sarees';
import { getProductHero } from '@/lib/product-images';
import { useShop } from '@/lib/shop-store';
import { useCartDrawer } from '@/lib/cart-drawer';
import { useCheckoutModal } from '@/lib/checkout-modal';
import { useLoginModal } from '@/lib/login-modal';
import { useAuth } from '@/lib/auth';
import { useScrollLock } from '@/lib/scroll-lock';

export default function CartDrawer() {
  const { open, closeCart } = useCartDrawer();
  const { open: checkoutOpen, openCheckout } = useCheckoutModal();
  const { openLogin } = useLoginModal();
  const { user, hydrated: authHydrated } = useAuth();
  const {
    cart, hydrated, cartSubtotal, updateCartQty, removeFromCart, getProduct,
  } = useShop();

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeCart]);

  const items = cart
    .map((c) => {
      const saree = getProduct(c.productId);
      return saree ? { saree, qty: c.quantity } : null;
    })
    .filter((x): x is { saree: (typeof SAREES)[number]; qty: number } => Boolean(x));

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  // Don't close the drawer when launching checkout — Kalki keeps the cart
  // visible on the right while the centered popup opens beside it.
  // Gated: if the user is not signed in, open the login modal first and
  // resume the checkout via the post-login callback.
  const handleCheckout = () => {
    if (!authHydrated) return; // wait for auth state to settle
    if (!user) {
      openLogin(() => openCheckout());
      return;
    }
    openCheckout();
  };

  // When the checkout popup is open, the drawer needs to sit ABOVE the
  // popup's backdrop so it stays fully visible (not dimmed). We also hide
  // the drawer's own backdrop in that case so we don't stack two dims.
  //
  // IMPORTANT: the drawer's full-viewport container must NOT intercept
  // pointer events when the popup is open. Otherwise its z-[110] above
  // the popup (z-[100]) swallows wheel / click events over the popup
  // area and the popup becomes unscrollable / unclickable. Only the
  // visible panel on the right should be interactive in that state.
  return (
    <div
      className={`fixed inset-0 ${checkoutOpen ? 'z-[110]' : 'z-[90]'}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-labelledby="cart-drawer-title"
      style={{ pointerEvents: open && !checkoutOpen ? 'auto' : 'none' }}
      data-lenis-prevent
    >
      {!checkoutOpen && (
        <button
          type="button"
          aria-label="Close cart"
          onClick={closeCart}
          className={`absolute inset-0 bg-ink/30 transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      <div
        className={`absolute top-0 right-0 h-full w-full max-w-[440px] bg-ivory no-pattern shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        } ${
          // On mobile the drawer is full-width — slide it off-screen when
          // checkout opens so the centered popup gets the full viewport
          // instead of fighting a 390px-wide drawer for space. On md+ the
          // drawer is 440px wide with room beside it, so the side-by-side
          // pattern (Kalki style) still works.
          open && checkoutOpen ? 'max-md:translate-x-full' : ''
        }`}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10 shrink-0">
          <h2 id="cart-drawer-title" className="text-lg font-bold text-ink">
            Your Cart
            <span className="ml-2 text-sm font-normal text-ink/55 tabular-nums">
              Items {hydrated ? itemCount : 0}
            </span>
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center text-ink hover:text-maroon"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {!hydrated ? (
            <ListSkeleton />
          ) : items.length === 0 ? (
            <EmptyDrawer onClose={closeCart} />
          ) : (
            <ul className="divide-y divide-ink/10">
              {items.map(({ saree, qty }) => (
                <li key={saree.id} className="flex gap-3 p-4">
                  <Link
                    href={`/shop/${productSlug(saree)}`}
                    onClick={closeCart}
                    className="relative w-20 h-26 shrink-0 overflow-hidden bg-bone"
                    style={{ aspectRatio: '3 / 4' }}
                  >
                    <Image
                      src={getProductHero(saree)}
                      alt={saree.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-ink/55">{saree.weave}</div>
                        <Link
                          href={`/shop/${productSlug(saree)}`}
                          onClick={closeCart}
                          className="text-sm font-semibold text-ink leading-snug hover:text-maroon line-clamp-2"
                        >
                          {qty} × {saree.name}
                        </Link>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(saree.id)}
                        aria-label={`Remove ${saree.name}`}
                        className="shrink-0 w-7 h-7 flex items-center justify-center text-ink/55 hover:text-maroon"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M3 6h18M8 6V4h8v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-1 text-sm font-bold text-ink tabular-nums">
                      {formatINR(saree.price * qty)}
                    </div>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <QtyStepper
                        qty={qty}
                        onMinus={() => updateCartQty(saree.id, qty - 1)}
                        onPlus={() => updateCartQty(saree.id, qty + 1)}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {hydrated && items.length > 0 && (
          <div className="border-t border-ink/10 px-5 py-4 bg-ivory no-pattern shrink-0">
            <Row label="Subtotal" value={formatINR(cartSubtotal)} />
            <Row
              label="Shipping"
              value="FREE"
              muted
            />
            <div className="h-px bg-ink/10 my-2" />
            <Row label="Total" value={formatINR(cartSubtotal)} strong />

            <button
              type="button"
              onClick={handleCheckout}
              className="mt-4 w-full bg-maroon-deep text-ivory py-3.5 text-sm font-bold tracking-wider uppercase hover:bg-maroon transition-colors"
            >
              Checkout
            </button>

            <p className="mt-3 text-[10px] text-ink/55 text-center leading-relaxed">
              By clicking on checkout you agree to our{' '}
              <Link href="/shipping" onClick={closeCart} className="text-peacock underline underline-offset-2">
                Return Policy
              </Link>
              .
            </p>

            <div className="mt-3 pt-3 border-t border-ink/10">
              <div className="text-[10px] font-bold tracking-widest text-ink/50 mb-2">WE ACCEPT</div>
              <PaymentLogos />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
      <div className="text-sm font-bold text-ink">Your cart is empty.</div>
      <p className="mt-1.5 text-xs text-ink/65 max-w-xs">
        Browse the catalogue and add a saree to begin.
      </p>
      <Link
        href="/shop"
        onClick={onClose}
        className="mt-6 bg-maroon-deep text-ivory px-6 py-2.5 text-xs font-semibold tracking-wide hover:bg-maroon transition-colors"
      >
        Continue shopping
      </Link>
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
        className="w-7 h-7 flex items-center justify-center text-ink hover:bg-maroon-deep hover:text-ivory transition-colors text-sm"
      >
        −
      </button>
      <span className="w-8 text-center text-xs font-semibold tabular-nums">{qty}</span>
      <button
        type="button"
        onClick={onPlus}
        aria-label="Increase quantity"
        className="w-7 h-7 flex items-center justify-center text-ink hover:bg-maroon-deep hover:text-ivory transition-colors text-sm"
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
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <span className={`text-sm ${muted ? 'text-ink/55' : 'text-ink/80'}`}>{label}</span>
      <span
        className={`tabular-nums ${
          strong ? 'text-base font-bold text-ink' : 'text-sm font-semibold text-ink'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-20 h-26 bg-bone animate-pulse" style={{ aspectRatio: '3 / 4' }} />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-2.5 bg-bone w-1/3 animate-pulse" />
            <div className="h-3 bg-bone w-3/4 animate-pulse" />
            <div className="h-3 bg-bone w-1/4 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PaymentLogos() {
  return (
    <div className="flex items-center flex-wrap gap-2">
      <Tag label="VISA" />
      <Tag label="Mastercard" />
      <Tag label="Amex" />
      <Tag label="UPI" />
      <Tag label="RuPay" />
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-bold tracking-wide text-ink/70 border border-ink/15 px-2 py-1 bg-bone/40">
      {label}
    </span>
  );
}
