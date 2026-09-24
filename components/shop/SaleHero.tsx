'use client';

import { useEffect, useState } from 'react';
import { couponsApi, type BackendCoupon } from '@/lib/api';

// A coupon is "showable" if it's toggled active in the admin panel AND
// today is inside its start/expiry window. Malformed dates are ignored
// rather than blocking the coupon (a partially-filled record still
// shows so admin knows the code is live).
function isCouponActive(c: BackendCoupon): boolean {
  if (c.active === false) return false;
  const now = Date.now();
  if (c.startDate) {
    const t = new Date(c.startDate).getTime();
    if (Number.isFinite(t) && t > now) return false;
  }
  if (c.expiryDate) {
    const t = new Date(c.expiryDate).getTime();
    if (Number.isFinite(t) && t < now) return false;
  }
  return true;
}

// Human-readable discount summary derived from the coupon type/value.
// Kept short so it fits alongside the "FESTIVE SALE" title on desktop.
function formatDiscount(c: BackendCoupon): string {
  if (c.type === 'percent') {
    return c.maxDiscount
      ? `Flat ${c.value}% off · up to ₹${c.maxDiscount.toLocaleString('en-IN')}`
      : `Flat ${c.value}% off on heritage weaves`;
  }
  return `Flat ₹${c.value.toLocaleString('en-IN')} off`;
}

/**
 * SaleHero — full-width promotional banner at the top of /shop.
 * The coupon shown here is the first currently-active coupon returned
 * by the backend, so updating a code in the admin panel is reflected
 * on the next storefront page load without a code change.
 */
export default function SaleHero() {
  const [coupon, setCoupon] = useState<BackendCoupon | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    couponsApi
      .list()
      .then((rows) => {
        if (cancelled) return;
        const active = rows.filter(isCouponActive);
        setCoupon(active[0] ?? null);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Hide the entire banner while we're loading (avoids a flash of stale
  // fallback copy) and when no active coupon exists — no point showing
  // "FESTIVE SALE" with an empty code.
  if (!loaded || !coupon) return null;

  return (
    <section aria-label="Sale" className="relative w-full bg-[#75001F] text-white">
      <div className="max-w-[1720px] mx-auto px-6 lg:px-10 py-5 flex items-center gap-5 lg:gap-8 flex-wrap">
        <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
          FESTIVE SALE
        </div>
        <div className="hidden md:block h-7 w-px bg-white/30" />
        <div className="text-base md:text-lg font-semibold uppercase">
          {formatDiscount(coupon)}
        </div>
        <div className="hidden lg:block h-7 w-px bg-white/30" />
        <div className="hidden lg:block text-sm font-medium opacity-90">
          Use code <span className="font-bold">{coupon.code}</span> · Free shipping across India
        </div>
      </div>
    </section>
  );
}
