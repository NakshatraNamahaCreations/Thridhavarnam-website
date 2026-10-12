'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useOrders, type Order, type PayMethod, type ShipMethod } from '@/lib/orders';
import { storefrontOrdersApi, type OrderTrackingResponse } from '@/lib/api';
import { formatINR, productSlug } from '@/lib/sarees';

const PAY_LABEL: Record<PayMethod, string> = {
  upi: 'UPI',
  card: 'Card',
  netbanking: 'Net banking',
};

const SHIP_LABEL: Record<ShipMethod, string> = {
  standard: 'Standard',
  express: 'Express',
};

export default function ThankYouView() {
  const params = useSearchParams();
  const { getOrder, hydrated } = useOrders();
  const id = params.get('id') || params.get('order') || '';
  const order = id ? getOrder(id) : undefined;

  // Fallback when the order isn't in the store yet (direct deep-link, or
  // an old shared URL). Use whatever query params we have.
  const fallbackEmail = params.get('email') || '';
  const fallbackPhone = params.get('phone') || '';
  const fallbackShip = (params.get('ship') as ShipMethod | null) ?? 'standard';

  const eta = (() => {
    if (order) {
      const days = order.shipMethod === 'express' ? 3 : 7;
      const base = order.createdAt;
      const d = new Date(base);
      d.setDate(d.getDate() + days);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    const d = new Date();
    d.setDate(d.getDate() + (fallbackShip === 'express' ? 3 : 7));
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  })();

  const placedDate = order
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  return (
    <div className="min-h-screen bg-white text-ink">
      {/* Slim success strip */}
      <div className="bg-peacock text-ivory">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-2.5 flex items-center gap-2 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden className="shrink-0">
            <path d="M4 12.5 10 18 20 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-semibold">Thank you, your order is confirmed.</span>
        </div>
      </div>

      {/* Heritage star-flower ornament — visual punctuation between the
          peacock success strip and the order details. From the brand kit. */}
      <div className="flex justify-center -mt-3 mb-2">
        <img
          src="/brand/star-flower.svg"
          alt=""
          aria-hidden
          width={28}
          height={28}
          className="h-7 w-7 bg-white p-1 rounded-full ring-1 ring-ink/10 relative z-10"
        />
      </div>

      {/* Compact info bar — order id, date, total, payment, delivery */}
      <header className="border-b border-ink/10">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <InfoCell label="Order" value={order?.id || id || 'TV00000000'} bold mono />
          <InfoCell label="Placed" value={placedDate} />
          <InfoCell
            label="Total"
            value={formatINR(order?.total ?? 0)}
            bold
            hidden={!order}
          />
          <InfoCell
            label="Payment"
            value={order ? PAY_LABEL[order.payMethod] : ''}
            hidden={!order}
          />
          <InfoCell
            label="Delivery"
            value={SHIP_LABEL[order?.shipMethod ?? fallbackShip]}
          />
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/account/orders"
              className="text-xs font-semibold text-ink hover:text-maroon underline underline-offset-2"
            >
              All orders
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-6 lg:py-8 space-y-6">
        {/* Status tracker — horizontal, current step highlighted */}
        <StatusTracker order={order} orderId={id} fallbackShip={fallbackShip} />

        {/* Items + summary side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Items */}
          <section className="border border-ink/15">
            <div className="px-4 py-2.5 border-b border-ink/10 flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink">
                Items <span className="text-ink/55 font-normal tabular-nums">({order?.itemCount ?? 0})</span>
              </h2>
              {order && (
                <Link
                  href="/shop"
                  className="text-[11px] font-semibold text-ink/70 hover:text-maroon underline underline-offset-2"
                >
                  Buy again
                </Link>
              )}
            </div>
            {order ? (
              <ul className="divide-y divide-ink/10">
                {order.items.map((it) => (
                  <li key={it.productId} className="flex gap-3 p-3">
                    <Link
                      href={`/shop/${productSlug({ id: it.productId, name: it.name })}`}
                      className="relative w-14 h-18 shrink-0 overflow-hidden bg-bone"
                      style={{ aspectRatio: '3 / 4' }}
                    >
                      <Image src={it.image} alt={it.name} fill sizes="56px" className="object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-ink/55">{it.weave}</div>
                      <Link
                        href={`/shop/${productSlug({ id: it.productId, name: it.name })}`}
                        className="text-sm font-semibold text-ink hover:text-maroon line-clamp-2"
                      >
                        {it.name}
                      </Link>
                      <div className="text-[11px] text-ink/55 mt-0.5 tabular-nums">
                        Qty {it.qty} × {formatINR(it.unitPrice)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-ink tabular-nums shrink-0">
                      {formatINR(it.unitPrice * it.qty)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-sm text-ink/55">
                Order details aren&apos;t loaded on this device. Open this from your{' '}
                <Link href="/account/orders" className="underline underline-offset-2 text-ink hover:text-maroon">
                  orders list
                </Link>{' '}
                to see line items.
              </div>
            )}
          </section>

          {/* Right column: address + summary stacked */}
          <aside className="space-y-4">
            {order && (
              <>
                <MetaBlock title="Ship to">
                  <address className="not-italic text-xs text-ink leading-relaxed">
                    <div className="font-semibold text-sm">{order.address.fullName}</div>
                    <div className="text-ink/75 mt-1">
                      {order.address.line1}
                      {order.address.line2 && <>, {order.address.line2}</>}
                      <br />
                      {order.address.city}, {order.address.state} {order.address.pincode}
                    </div>
                    <div className="text-ink/55 mt-1.5 tabular-nums">
                      {order.address.phone}
                    </div>
                  </address>
                </MetaBlock>

                <MetaBlock title="Payment">
                  <SummaryRow label="Subtotal" value={formatINR(order.subtotal)} />
                  {order.discount > 0 && (
                    <SummaryRow
                      label={`Discount${order.promoCode ? ` (${order.promoCode})` : ''}`}
                      value={`− ${formatINR(order.discount)}`}
                      accent="peacock"
                    />
                  )}
                  <SummaryRow
                    label="Shipping"
                    value={order.shippingFee === 0 ? 'Free' : formatINR(order.shippingFee)}
                  />
                  <div className="h-px bg-ink/10 my-2" />
                  <SummaryRow label="Total paid" value={formatINR(order.total)} strong />
                  <div className="mt-2 text-[11px] text-ink/55">
                    {PAY_LABEL[order.payMethod]} · {order.paid ? 'Authorised' : 'Pay on delivery'}
                  </div>
                </MetaBlock>
              </>
            )}

            <div className="flex items-center gap-2">
              <Link
                href={`/account/orders`}
                className="flex-1 bg-maroon-deep text-ivory py-2.5 text-center text-xs font-bold tracking-wider uppercase hover:bg-maroon transition-colors"
              >
                Track order
              </Link>
              <Link
                href="/shop"
                className="flex-1 border border-ink/25 text-ink py-2.5 text-center text-xs font-bold tracking-wider uppercase hover:bg-maroon-deep hover:text-ivory transition-colors"
              >
                Continue
              </Link>
            </div>
          </aside>
        </div>

        {/* Footer strip — help line */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink/65 border-t border-ink/10 pt-4">
          <span>
            Confirmation emailed to{' '}
            <span className="font-semibold text-ink">{order?.address.email || fallbackEmail || 'your inbox'}</span>.
            Tracking SMS to{' '}
            <span className="font-semibold text-ink tabular-nums">
              {order?.address.phone || fallbackPhone || 'your phone'}
            </span>.
          </span>
          <div className="flex items-center gap-3">
            <a href="mailto:thridhavarnam@gmail.com" className="font-semibold text-ink hover:text-maroon underline underline-offset-2">
              thridhavarnam@gmail.com
            </a>
            <a href="tel:+919949528787" className="font-semibold text-ink hover:text-maroon underline underline-offset-2 tabular-nums">
              +91 99495 28787
            </a>
          </div>
        </div>
      </div>

      {!hydrated && null /* avoid flash; could add a shimmer here later */}
    </div>
  );
}

function InfoCell({
  label,
  value,
  bold = false,
  mono = false,
  hidden = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  mono?: boolean;
  hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[11px] text-ink/55">{label}:</span>
      <span
        className={`text-sm text-ink tabular-nums ${bold ? 'font-bold' : 'font-medium'} ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}

function MetaBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-ink/15">
      <div className="px-4 py-2.5 border-b border-ink/10">
        <h2 className="text-sm font-bold text-ink">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  muted = false,
  strong = false,
  accent,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
  accent?: 'peacock';
}) {
  return (
    <div className="flex items-baseline justify-between py-0.5 text-xs">
      <span className={muted ? 'text-ink/55' : 'text-ink/80'}>{label}</span>
      <span
        className={`tabular-nums ${
          strong
            ? 'text-sm font-bold text-ink'
            : accent === 'peacock'
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

// Hour offsets from createdAt for each pipeline step. Standard = 7-day
// window, Express = 3-day window. The last entry equals the delivery ETA.
const STEP_HOURS: Record<ShipMethod, [number, number, number, number, number]> = {
  standard: [0, 24, 48, 144, 168],
  express: [0, 12, 24, 60, 72],
};

function formatStepDate(ms: number): string {
  return new Date(ms).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

function formatRelative(fromMs: number, toMs: number): string {
  const diffMin = Math.round((toMs - fromMs) / 60000);
  if (Math.abs(diffMin) < 60) return 'Just now';
  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

// Horizontal 5-step delivery tracker. Primary source of truth is the
// Shiprocket tracking status fetched from the backend; if that hasn't
// been assigned an AWB yet (or the call fails), we fall back to a
// time-based estimate against the shipMethod milestones so the dot
// still moves forward instead of parking on "Confirmed" forever.
function StatusTracker({
  order,
  orderId,
  fallbackShip,
}: {
  order: Order | undefined;
  orderId: string;
  fallbackShip: ShipMethod;
}) {
  const [now, setNow] = useState<number>(() => Date.now());
  const [tracking, setTracking] = useState<OrderTrackingResponse | null>(null);

  // Clock tick for the time-based fallback. Also drives the hydration
  // boundary — SSR renders with a frozen `now` and the useEffect kicks
  // it off on mount.
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Poll the Shiprocket-backed tracking endpoint. Guard against stale
  // state updates if the component unmounts mid-fetch (common when
  // users bounce between orders quickly).
  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await storefrontOrdersApi.track(orderId);
        if (!cancelled) setTracking(data);
      } catch (err) {
        // Non-fatal — the UI already has a sensible time-based fallback.
        console.warn('[tracking] fetch failed', err);
      }
    };

    void poll();
    const interval = setInterval(poll, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [orderId]);

  const shipMethod: ShipMethod =
    (tracking?.shipMethod as ShipMethod | undefined) ?? order?.shipMethod ?? fallbackShip;
  const createdAtMs = order?.createdAt
    ?? (tracking?.createdAt ? new Date(tracking.createdAt).getTime() : now);
  const milestones = STEP_HOURS[shipMethod];

  // Decide which source drives the step index.
  const trackingReady = tracking?.ok === true;
  const hasAwb = !!tracking?.shiprocket?.awbCode;
  // Shiprocket is authoritative when we have a tracking response AND
  // (there's an AWB OR the order is cancelled). Otherwise fall back to
  // the time-based estimate so the dot doesn't sit on step 0 for the
  // minutes between order placement and AWB assignment.
  const cancelled =
    tracking?.orderStatus === 'cancelled' ||
    tracking?.step === -1 ||
    order?.status === 'cancelled';

  let currentIndex = 0;
  let source: 'shiprocket' | 'estimate' = 'estimate';
  if (cancelled) {
    currentIndex = 0;
  } else if (trackingReady && hasAwb && typeof tracking?.step === 'number' && tracking.step >= 0) {
    currentIndex = Math.min(4, tracking.step);
    source = 'shiprocket';
  } else {
    const elapsedHours = (now - createdAtMs) / 3_600_000;
    for (let i = 0; i < milestones.length; i++) {
      if (elapsedHours >= milestones[i]) currentIndex = i;
    }
  }

  const labels = ['Confirmed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'];
  const steps = labels.map((label, i) => {
    const stepMs = createdAtMs + milestones[i] * 3_600_000;
    let sub: string | undefined;
    if (cancelled) {
      sub = i === 0 ? 'Cancelled' : undefined;
    } else if (i < currentIndex) {
      sub = source === 'shiprocket' ? 'Done' : formatRelative(stepMs, now);
    } else if (i === currentIndex) {
      // Guard against bare numeric statuses from legacy cached
      // Shiprocket responses — "8" would render as a meaningless digit
      // under the active dot.
      const raw = (tracking?.currentStatus || '').trim();
      const isNumericCode = /^\d+$/.test(raw);
      if (source === 'shiprocket' && raw && !isNumericCode) {
        sub = raw;
      } else {
        sub = i === 0 ? 'Just now' : 'In progress';
      }
    } else {
      sub = i === labels.length - 1 ? `by ${formatStepDate(stepMs)}` : formatStepDate(stepMs);
    }
    return { label, sub };
  });

  const courier = tracking?.courier || tracking?.shiprocket?.courier || '';
  const awb = tracking?.shiprocket?.awbCode || '';

  return (
    <div className="border border-ink/15 px-4 py-4 lg:px-6 space-y-3">
      <div className="flex items-center justify-between gap-2">
        {steps.map((s, i) => {
          const done = !cancelled && i <= currentIndex;
          const active = !cancelled && i === currentIndex;
          return (
            <div key={s.label} className="flex-1 flex flex-col items-center text-center min-w-0">
              <div className="flex items-center w-full">
                {/* Connector left */}
                <div
                  className={`flex-1 h-0.5 ${i === 0 ? 'opacity-0' : done ? 'bg-peacock' : 'bg-ink/15'}`}
                />
                {/* Dot */}
                <div
                  className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mx-1 ${
                    cancelled && i === 0
                      ? 'border-maroon bg-maroon text-ivory'
                      : done
                      ? 'border-peacock bg-peacock text-ivory'
                      : 'border-ink/20 bg-white text-ink/40'
                  }`}
                >
                  {done ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M4 12 10 18 20 6" />
                    </svg>
                  ) : cancelled && i === 0 ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  ) : (
                    <span className="text-[10px] font-bold tabular-nums">{i + 1}</span>
                  )}
                </div>
                {/* Connector right */}
                <div
                  className={`flex-1 h-0.5 ${i === steps.length - 1 ? 'opacity-0' : done && i < currentIndex ? 'bg-peacock' : 'bg-ink/15'}`}
                />
              </div>
              <div className="mt-1.5 min-w-0">
                <div className={`text-[11px] leading-tight truncate ${active ? 'font-bold text-ink' : done ? 'text-ink' : 'text-ink/55'}`}>
                  {s.label}
                </div>
                {s.sub && (
                  <div className="text-[10px] text-ink/55 leading-tight tabular-nums mt-0.5">
                    {s.sub}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Courier / AWB strip — shown as soon as Shiprocket has assigned
          an AWB. Until then we hide it to avoid an empty row flashing on
          page load. */}
      {(courier || awb) && !cancelled && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink/10 text-[11px] text-ink/70">
          <span>
            {courier && <span className="font-semibold text-ink">{courier}</span>}
            {courier && awb && <span className="text-ink/40 mx-1.5">·</span>}
            {awb && (
              <span className="tabular-nums">
                AWB <span className="font-mono text-ink">{awb}</span>
              </span>
            )}
          </span>
          <span className="text-ink/50">Updated just now</span>
        </div>
      )}
    </div>
  );
}
