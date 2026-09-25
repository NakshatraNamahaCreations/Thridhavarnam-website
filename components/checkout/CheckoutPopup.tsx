'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { SAREES, formatINR } from '@/lib/sarees';
import { getProductHero } from '@/lib/product-images';
import { useShop } from '@/lib/shop-store';
import { useAddresses } from '@/lib/addresses';
import { useCheckoutModal } from '@/lib/checkout-modal';
import { useCartDrawer } from '@/lib/cart-drawer';
import { useLoginModal } from '@/lib/login-modal';
import { useAuth } from '@/lib/auth';
import { useScrollLock } from '@/lib/scroll-lock';
import { useOrders, type OrderItem as OrderItemRecord } from '@/lib/orders';
import { useRouter } from 'next/navigation';
import {
  couponsApi,
  calcCouponDiscount,
  razorpayApi,
  storefrontOrdersApi,
  type BackendCoupon,
} from '@/lib/api';
import { openRazorpayCheckout } from '@/lib/razorpay';

type PayMethod = 'upi' | 'card' | 'netbanking';
type OrderItem = { saree: (typeof SAREES)[number]; qty: number };

export default function CheckoutPopup() {
  const router = useRouter();
  const { open, openCheckout, closeCheckout } = useCheckoutModal();
  const { open: cartOpen, closeCart } = useCartDrawer();
  const { openLogin } = useLoginModal();
  const { user, hydrated: authHydrated } = useAuth();
  const { cart, hydrated, cartSubtotal, clearCart, getProduct } = useShop();
  const { selected: selectedAddress, openAddressModal } = useAddresses();
  const { placeOrder } = useOrders();

  const items: OrderItem[] = useMemo(
    () =>
      cart
        .map((c) => {
          const saree = getProduct(c.productId);
          return saree ? { saree, qty: c.quantity } : null;
        })
        .filter((x): x is OrderItem => Boolean(x)),
    [cart, getProduct],
  );

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  const [payMethod, setPayMethod] = useState<PayMethod>('upi');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [coupons, setCoupons] = useState<BackendCoupon[]>([]);

  useEffect(() => {
    let cancelled = false;
    couponsApi
      .list()
      .then((rows) => {
        if (!cancelled) {
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
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open) {
      setSummaryOpen(false);
      setPromoInput('');
      setPromoError('');
      setPlacing(false);
    }
  }, [open]);

  if (!open) return null;

  // ── Totals ────────────────────────────────────────────────────────────
  // Prices are MRP inclusive of GST and shipping — nothing is added on top.
  const shipMethod = 'standard' as const;
  const shippingFee = 0;
  const tax = 0;
  const appliedCoupon = promoCode ? coupons.find((c) => c.code === promoCode) : undefined;
  const discount = appliedCoupon ? calcCouponDiscount(appliedCoupon, cartSubtotal) : 0;
  const total = Math.max(cartSubtotal - discount, 0);
  const mrpTotal = cartSubtotal;

  const applyPromo = (raw?: string) => {
    const code = (raw ?? promoInput).trim().toUpperCase();
    if (!code) return;
    const match = coupons.find((c) => c.code === code);
    if (!match) {
      setPromoError('That code is not valid');
      setPromoCode(null);
      return;
    }
    if (match.minOrder && cartSubtotal < match.minOrder) {
      setPromoError(`Minimum order ${formatINR(match.minOrder)} to use ${code}`);
      setPromoCode(null);
      return;
    }
    setPromoCode(code);
    setPromoInput(code);
    setPromoError('');
  };

  const clearPromo = () => {
    setPromoCode(null);
    setPromoInput('');
    setPromoError('');
  };

  const handleClose = () => {
    closeCheckout();
  };

  // Close both the popup AND the cart drawer cleanly before navigating
  // away — otherwise the drawer slides over the destination page.
  const closeAllAndGo = (path: string) => {
    closeCheckout();
    closeCart();
    router.push(path);
  };

  // Commit the local order record + push to backend (which auto-feeds
  // Shiprocket) + clear cart + navigate to the payment-success page.
  const finalizeAndRoute = async (opts: {
    paid: boolean;
    ref?: string;
    razorpay?: { orderId: string; paymentId: string; signature: string };
  }) => {
    const orderItems: OrderItemRecord[] = items.map(({ saree, qty }) => ({
      productId: saree.id,
      name: saree.name,
      weave: saree.weave,
      qty,
      unitPrice: saree.price,
      image: getProductHero(saree),
    }));
    const order = placeOrder({
      items: orderItems,
      itemCount,
      address: {
        fullName: selectedAddress!.fullName,
        phone: selectedAddress!.phone,
        email: selectedAddress!.email,
        line1: selectedAddress!.line1,
        line2: selectedAddress!.line2,
        city: selectedAddress!.city,
        state: selectedAddress!.state,
        pincode: selectedAddress!.pincode,
        country: selectedAddress!.country,
      },
      payMethod,
      shipMethod,
      paid: opts.paid,
      promoCode,
      subtotal: cartSubtotal,
      discount,
      shippingFee,
      tax,
      total,
    });

    // Fire-and-forget backend persistence + Shiprocket push. We do NOT
    // await this before navigating — a slow Shiprocket call shouldn't
    // hold up the customer's thank-you page. If it fails, the admin
    // panel will still see the order (with shiprocket.status='failed')
    // and can retry manually.
    void storefrontOrdersApi
      .place({
        id: order.id,
        customer: order.address.fullName,
        email: order.address.email,
        phone: order.address.phone,
        address: {
          line1: order.address.line1,
          line2: order.address.line2,
          city: order.address.city,
          state: order.address.state,
          pincode: order.address.pincode,
          country: order.address.country,
        },
        lineItems: orderItems.map((it) => ({
          productId: it.productId,
          name: it.name,
          sku: it.productId,
          qty: it.qty,
          unitPrice: it.unitPrice,
        })),
        itemCount: order.itemCount,
        payMethod: order.payMethod,
        shipMethod: order.shipMethod,
        paid: order.paid,
        promoCode: order.promoCode,
        subtotal: order.subtotal,
        discount: order.discount,
        shippingFee: order.shippingFee,
        tax: order.tax,
        total: order.total,
        razorpay: opts.razorpay,
      })
      .catch((err) => {
        console.warn('[checkout] backend order persistence failed', err);
      });

    clearCart();
    const qs = new URLSearchParams({
      order: order.id,
      method: order.payMethod,
      amount: String(order.total),
      ref: opts.ref || `TXN${Date.now().toString().slice(-8)}`,
    });
    closeAllAndGo(`/payment/success?${qs.toString()}`);
  };

  const onPlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (placing) return;
    // Defence-in-depth: if the user reached the popup without being
    // signed in (e.g. signed out in another tab after the popup opened),
    // close the checkout and re-open it after a successful login.
    if (!authHydrated) return;
    if (!user) {
      closeCheckout();
      openLogin(() => openCheckout());
      return;
    }
    if (!selectedAddress) {
      openAddressModal();
      return;
    }
    setPlacing(true);

    // ── Razorpay flow ──────────────────────────────────────────────────
    // 1. Ask the backend to create a Razorpay order (server-side, uses
    //    KEY_SECRET). 2. Open Checkout with the returned order_id.
    // 3. On success, verify the signature server-side, THEN create the
    //    local order and go to /payment/success.
    // 4. On failure or dismissal, leave the cart intact and go to
    //    /payment/cancelled — no order record is created.
    try {
      const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const order = await razorpayApi.createOrder({
        amount: total,
        receipt: `tv_${Date.now()}`,
        notes: {
          customer: selectedAddress.fullName,
          email: selectedAddress.email,
          method: payMethod,
        },
      });
      await openRazorpayCheckout({
        key: order.key_id || rzpKey || '',
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Thridha Varnam',
        description: `${itemCount} item${itemCount === 1 ? '' : 's'}`,
        image: '/brand/logomark.svg',
        order_id: order.id,
        prefill: {
          name: selectedAddress.fullName,
          email: selectedAddress.email,
          contact: selectedAddress.phone,
        },
        notes: { method: payMethod },
        theme: { color: '#6b1a2b' },
        onSuccess: async (resp) => {
          try {
            await razorpayApi.verify({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
              customer: selectedAddress.fullName,
              amount: total,
              method: payMethod,
            });
            await finalizeAndRoute({
              paid: true,
              ref: resp.razorpay_payment_id,
              razorpay: {
                orderId: resp.razorpay_order_id,
                paymentId: resp.razorpay_payment_id,
                signature: resp.razorpay_signature,
              },
            });
          } catch (err) {
            const reason = err instanceof Error ? err.message : 'Signature verification failed';
            closeAllAndGo(`/payment/cancelled?reason=${encodeURIComponent(reason)}`);
          } finally {
            setPlacing(false);
          }
        },
        onFailure: (reason) => {
          setPlacing(false);
          closeAllAndGo(`/payment/cancelled?reason=${encodeURIComponent(reason)}`);
        },
        onDismiss: () => {
          setPlacing(false);
          closeAllAndGo('/payment/cancelled?reason=cancelled');
        },
      });
    } catch (err) {
      setPlacing(false);
      const reason = err instanceof Error ? err.message : 'Unable to start payment';
      closeAllAndGo(`/payment/cancelled?reason=${encodeURIComponent(reason)}`);
    }
  };

  const onCancelPayment = () => {
    closeAllAndGo('/payment/cancelled?reason=cancelled');
  };

  if (hydrated && items.length === 0) {
    return (
      <Overlay onClose={handleClose} cartOpen={cartOpen}>
        <Shell>
          <Header onClose={handleClose} brand="THRIDHA VARNAM" />
          <div className="p-8 text-center">
            <div className="text-sm font-bold text-ink">Your bag is empty.</div>
            <p className="mt-1.5 text-xs text-ink/65">Add a saree to begin checkout.</p>
            <Link
              href="/shop"
              onClick={handleClose}
              className="mt-5 inline-block bg-maroon-deep text-ivory px-6 py-2.5 text-xs font-semibold tracking-wide hover:bg-maroon transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        </Shell>
      </Overlay>
    );
  }

  const savings = discount + (mrpTotal - cartSubtotal); // discount only for now

  return (
    <Overlay onClose={handleClose} cartOpen={cartOpen}>
      <Shell>
        <Header
          onClose={handleClose}
                    savings={savings > 0 ? savings : 0}
          itemCount={itemCount}
          total={total}
          mrp={discount > 0 ? cartSubtotal : null}
          chevronOpen={summaryOpen}
          onChevronClick={() => setSummaryOpen((v) => !v)}
        />

        <form onSubmit={onPlaceOrder} className="flex flex-col min-h-0" id="checkout-popup-form">
          <div
            className="overflow-y-auto overscroll-contain"
            style={{ maxHeight: 'calc(92vh - 240px)' }}
          >
            {/* Order summary — expanded view shows items + breakdown */}
            {summaryOpen && (
              <div className="px-5 py-4 border-b border-ink/10 bg-bone/15">
                <ul className="divide-y divide-ink/10 mb-3">
                  {items.map(({ saree, qty }) => (
                    <li key={saree.id} className="flex gap-3 py-3 first:pt-0">
                      <div className="relative w-12 h-16 shrink-0 overflow-hidden bg-bone">
                        <Image
                          src={getProductHero(saree)}
                          alt={saree.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-ink/55">{saree.weave}</div>
                        <div className="text-xs font-semibold text-ink leading-tight line-clamp-2">
                          {saree.name}
                        </div>
                        <div className="text-[11px] text-ink/55 mt-0.5">Qty {qty}</div>
                      </div>
                      <div className="text-xs font-semibold text-ink tabular-nums shrink-0">
                        {formatINR(saree.price * qty)}
                      </div>
                    </li>
                  ))}
                </ul>

                <SummaryRow label="Subtotal" value={formatINR(cartSubtotal)} />
                {discount > 0 && (
                  <SummaryRow label={`Discount (${promoCode})`} value={`− ${formatINR(discount)}`} accent />
                )}
                <SummaryRow label="Shipping" value="Free" />
                <div className="h-px bg-ink/10 my-2" />
                <SummaryRow label="To pay" value={formatINR(total)} strong />
              </div>
            )}

            {/* DELIVERY DETAILS card */}
            <SectionEyebrow>Delivery details</SectionEyebrow>
            <div className="px-5 pb-4">
              {selectedAddress ? (
                <div className="border border-ink/15 bg-ivory no-pattern">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 mt-0.5 text-ink/55">
                        <PinIcon />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-ink">
                          Deliver to {selectedAddress.fullName}
                        </div>
                        <div className="text-xs text-ink/75 mt-1 leading-relaxed">
                          {selectedAddress.line1}
                          {selectedAddress.line2 && <>, {selectedAddress.line2}</>}
                          <br />
                          {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
                        </div>
                        <div className="text-[11px] text-ink/55 mt-1.5 tabular-nums">
                          {selectedAddress.phone} <span className="mx-1">·</span> {selectedAddress.email}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openAddressModal()}
                        className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-ink border border-ink/25 px-3 py-1.5 hover:bg-maroon-deep hover:text-ivory transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                  {/* Inline shipping line, like Kalki */}
                  <div className="border-t border-ink/10 px-4 py-2.5 flex items-center justify-between bg-bone/20">
                    <div className="flex items-center gap-2">
                      <span className="text-ink/55"><TruckIcon /></span>
                      <span className="text-xs font-semibold text-ink">Shipping</span>
                    </div>
                    <span className="text-[11px] font-bold tracking-wider uppercase bg-peacock text-ivory px-2 py-0.5">
                      Free
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAddressModal()}
                  className="w-full border border-dashed border-ink/30 px-4 py-4 text-sm font-semibold text-ink hover:border-ink hover:bg-bone/30 transition-colors flex items-center justify-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Select delivery address
                </button>
              )}
            </div>

            {/* COUPON */}
            <SectionEyebrow>Have a coupon?</SectionEyebrow>
            <div className="px-5 pb-4">
              {appliedCoupon ? (
                <div className="border border-maroon/40 bg-ivory p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-maroon"><TagIcon /></span>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-ink tracking-wider">{appliedCoupon.code}</div>
                      <div className="text-[11px] text-peacock font-semibold tabular-nums">
                        You saved {formatINR(discount)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearPromo}
                    className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-maroon hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex items-stretch gap-2">
                  <input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 border border-ink/25 bg-ivory px-3 py-2 text-sm font-semibold tabular-nums tracking-wider focus:outline-none focus:border-ink placeholder:font-normal placeholder:tracking-normal placeholder:text-ink/40"
                  />
                  <button
                    type="button"
                    onClick={() => applyPromo()}
                    className="shrink-0 bg-ink text-ivory px-4 text-xs font-bold uppercase tracking-wider hover:bg-maroon-deep transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
              {promoError && (
                <div className="mt-2 text-[11px] font-semibold text-maroon">{promoError}</div>
              )}

              {coupons.length > 0 && !appliedCoupon && (
                <ul className="mt-3 space-y-2">
                  {coupons.map((c) => {
                    const d = calcCouponDiscount(c, cartSubtotal);
                    const eligible = d > 0;
                    return (
                      <li
                        key={c.id}
                        className={`border border-dashed p-2.5 flex items-center justify-between gap-3 ${eligible ? 'border-maroon/40 bg-ivory' : 'border-ink/15 bg-bone/20 opacity-70'}`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-ink tracking-wider">{c.code}</div>
                          <div className="text-[10px] text-ink/55 mt-0.5">
                            {c.type === 'percent'
                              ? `${c.value}% off${c.maxDiscount ? ` (max ${formatINR(c.maxDiscount)})` : ''}`
                              : `${formatINR(c.value)} off`}
                            {c.minOrder ? ` · Min ${formatINR(c.minOrder)}` : ''}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={!eligible}
                          onClick={() => applyPromo(c.code)}
                          className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-maroon hover:underline disabled:text-ink/40 disabled:no-underline disabled:cursor-not-allowed"
                        >
                          {eligible ? 'Apply' : 'Not eligible'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* PAYMENT OPTIONS */}
            <SectionEyebrow>Payment options</SectionEyebrow>
            <div className="px-5 pb-4">
              <PaymentRow
                checked={payMethod === 'upi'}
                onClick={() => setPayMethod('upi')}
                icon="upi"
                title="UPI"
                sub="GPay, PhonePe, Paytm, BHIM"
                amount={formatINR(total)}
              />
              <PaymentRow
                checked={payMethod === 'card'}
                onClick={() => setPayMethod('card')}
                icon="card"
                title="Credit / Debit card"
                sub="Visa, Mastercard, RuPay, Amex"
                amount={formatINR(total)}
              />
              <PaymentRow
                checked={payMethod === 'netbanking'}
                onClick={() => setPayMethod('netbanking')}
                icon="bank"
                title="Net banking"
                sub="All major Indian banks"
                amount={formatINR(total)}
              />
            </div>
          </div>

          {/* Sticky footer */}
          <div className="border-t border-ink/10 px-5 py-3 bg-ivory no-pattern shrink-0">
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <div className="text-[10px] font-bold tracking-wider text-ink/55">TO PAY</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-ink tabular-nums leading-tight">
                    {formatINR(total)}
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-ink/55 max-w-[180px] text-right leading-snug">
                256-bit SSL · Insured dispatch · 24 Hrs returns
              </div>
            </div>

            <button
              type="submit"
              disabled={placing || !hydrated}
              className="w-full bg-maroon-deep text-ivory py-3 text-sm font-bold tracking-wider uppercase hover:bg-maroon transition-colors disabled:bg-ink/40 disabled:cursor-not-allowed"
            >
              {placing
                ? 'Placing order…'
                : !selectedAddress
                ? 'Select address to continue'
                : 'Pay & place order'}
            </button>
            {/* Mimics the gateway 'cancel payment' return URL — useful for
                testing the /payment/cancelled page without a real gateway. */}
            <button
              type="button"
              onClick={onCancelPayment}
              disabled={placing}
              className="mt-2 w-full text-center text-[11px] text-ink/55 hover:text-maroon underline underline-offset-2 disabled:opacity-50"
            >
              Cancel payment
            </button>
          </div>
        </form>
      </Shell>
    </Overlay>
  );
}

// ── Overlay + Shell ──────────────────────────────────────────────────────

function Overlay({
  onClose,
  cartOpen,
  children,
}: {
  onClose: () => void;
  cartOpen: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center px-3 py-4 sm:px-4 sm:py-6 ${
        // Push the centered popup left so the cart drawer sits beside it
        // — but ONLY at md+ where the drawer is its real 440px width and
        // there's room for both. On mobile the drawer slides off-screen
        // (see CartDrawer.tsx) and the popup gets the full viewport.
        cartOpen ? 'md:pr-[calc(440px+1rem)]' : ''
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
      data-lenis-prevent
    >
      <button
        type="button"
        aria-label="Close checkout"
        onClick={onClose}
        className="absolute inset-0 bg-ink/30"
      />
      {children}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  // Shell sizes naturally to its content, capped at 92vh. The scroll body
  // inside owns its own explicit `maxHeight` so the scroll cap doesn't
  // depend on a flex-1 chain resolving correctly (which was unreliable
  // when stacked beside the cart drawer overlay).
  return (
    <div className="relative w-full max-w-[580px] max-h-[92vh] flex flex-col bg-ivory no-pattern shadow-2xl overflow-hidden">
      {children}
    </div>
  );
}

function Header({
  onClose,
  savings = 0,
  itemCount = 0,
  total,
  mrp,
  chevronOpen,
  onChevronClick,
}: {
  onClose: () => void;
  brand?: string; // accepted for back-compat with old callsites, no longer rendered
  savings?: number;
  itemCount?: number;
  total?: number;
  mrp?: number | null;
  chevronOpen?: boolean;
  onChevronClick?: () => void;
}) {
  return (
    <div className="px-5 py-3 border-b border-ink/10 shrink-0">
      <div className="flex items-center gap-3">
        <img
          src="/brand/logomark.svg"
          alt="Thridha Varnam"
          width={28}
          height={28}
          className="h-7 w-auto shrink-0 select-none"
          draggable={false}
        />
        <h2 id="checkout-title" className="sr-only">Checkout</h2>
        <div className="flex-1 min-w-0 text-center">
          {savings > 0 ? (
            <span className="text-[11px] font-semibold text-peacock tabular-nums">
              {formatINR(savings)} saved
              <span className="mx-1 text-ink/40">·</span>
              <span className="text-ink/65">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
            </span>
          ) : (
            itemCount > 0 && (
              <span className="text-[11px] font-semibold text-ink/65 tabular-nums">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            )
          )}
        </div>
        {typeof total === 'number' && onChevronClick && (
          <button
            type="button"
            onClick={onChevronClick}
            aria-label={chevronOpen ? 'Collapse order summary' : 'Expand order summary'}
            className="shrink-0 w-7 h-7 flex items-center justify-center text-ink/65 hover:text-ink"
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform ${chevronOpen ? 'rotate-180' : ''}`}
              aria-hidden
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 w-7 h-7 flex items-center justify-center text-ink/65 hover:text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      {typeof total === 'number' && (
        <div className="mt-1 flex items-baseline justify-end gap-2">
          {mrp != null && (
            <span className="text-xs text-ink/45 line-through tabular-nums">{formatINR(mrp)}</span>
          )}
          <span className="text-lg font-bold text-ink tabular-nums leading-none">
            {formatINR(total)}
          </span>
        </div>
      )}
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-ink/55">
      {children}
    </div>
  );
}

// ── Atoms ────────────────────────────────────────────────────────────────

function SummaryRow({
  label,
  value,
  muted = false,
  strong = false,
  accent = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <span className={`text-xs ${muted ? 'text-ink/55' : 'text-ink/80'}`}>{label}</span>
      <span
        className={`text-xs tabular-nums ${
          strong
            ? 'text-sm font-bold text-ink'
            : accent
            ? 'font-semibold text-peacock'
            : muted
            ? 'text-ink/55'
            : 'font-semibold text-ink'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function PaymentRow({
  checked,
  onClick,
  icon,
  title,
  sub,
  amount,
}: {
  checked: boolean;
  onClick: () => void;
  icon: 'upi' | 'card' | 'bank';
  title: string;
  sub: string;
  amount: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 border p-3 transition-colors mb-2 last:mb-0 text-left ${
        checked ? 'border-ink bg-bone/40' : 'border-ink/15 hover:border-ink/40'
      }`}
    >
      <span
        className={`shrink-0 w-9 h-9 flex items-center justify-center border ${
          checked ? 'border-ink bg-ink/5' : 'border-ink/15 bg-bone/30'
        }`}
      >
        <PayIcon name={icon} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-ink leading-tight">{title}</span>
        <span className="block text-[11px] text-ink/60 mt-0.5">{sub}</span>
      </span>
      <span className="text-sm font-semibold text-ink tabular-nums shrink-0">{amount}</span>
      <span
        className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
          checked ? 'border-ink' : 'border-ink/25'
        }`}
      >
        {checked && <span className="w-2 h-2 rounded-full bg-maroon-deep" />}
      </span>
    </button>
  );
}

function PayIcon({ name }: { name: 'upi' | 'card' | 'bank' }) {
  switch (name) {
    case 'upi':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m7 4 4 8-4 8M13 4l4 8-4 8" />
        </svg>
      );
    case 'card':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <rect x="3" y="6" width="18" height="13" rx="1" /><path d="M3 10h18" />
        </svg>
      );
    case 'bank':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m3 10 9-6 9 6M5 10v8M19 10v8M9 10v8M15 10v8M3 20h18" />
        </svg>
      );
  }
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 7h11v9H3zM14 11h4l3 3v2h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 12 13 5H4v9l7 7Z" />
      <circle cx="8" cy="9" r="1" />
    </svg>
  );
}

