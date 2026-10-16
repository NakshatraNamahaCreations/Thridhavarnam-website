'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AccountShell from '@/components/account/AccountShell';
import { useOrders, type Order, type PayMethod, type ShipMethod } from '@/lib/orders';
import { storefrontOrdersApi, type OrderTrackingMap } from '@/lib/api';
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

// Polling cadence for the batched tracking endpoint. 60s aligns with
// the backend's per-identifier Shiprocket cache so most polls land as
// cheap cache hits.
const TRACKING_POLL_MS = 60_000;

export default function OrdersPage() {
  const { orders, hydrated, syncing, cancelOrder } = useOrders();
  const router = useRouter();
  const [tracking, setTracking] = useState<OrderTrackingMap>({});
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Poll Shiprocket-backed tracking for every visible order id. Guard
  // against overlapping polls and against stale updates after unmount.
  useEffect(() => {
    if (!hydrated) return;
    const ids = orders.map((o) => o.id);
    if (ids.length === 0) {
      setTracking({});
      return;
    }

    let cancelled = false;
    const pull = async () => {
      try {
        const res = await storefrontOrdersApi.trackingBatch(ids);
        if (!cancelled) setTracking(res?.tracking || {});
      } catch (err) {
        // Non-fatal — the card falls back to the internal status badge.
        console.warn('[account/orders] tracking fetch failed', err);
      }
    };

    void pull();
    const timer = setInterval(pull, TRACKING_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
    // Join the ids into a stable string so the effect only re-runs when
    // the actual id set changes, not on every orders-array identity flip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, orders.map((o) => o.id).join(',')]);

  const onCancel = async (order: Order) => {
    if (typeof window === 'undefined') return;
    const ok = window.confirm(
      `Cancel order ${order.id}? Stock will be restored and the Shiprocket shipment will be cancelled. This cannot be undone.`,
    );
    if (!ok) return;
    setCancellingId(order.id);
    try {
      const updated = await cancelOrder(order.id, 'user');
      if (updated) {
        const qs = new URLSearchParams({ id: updated.id, reason: 'user' });
        if (updated.paid) qs.set('paid', '1');
        router.push(`/order/cancelled?${qs.toString()}`);
      }
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <AccountShell title="Orders">
      {!hydrated ? (
        <div className="bg-white border border-ink/10 p-10 text-center text-ink/55 text-sm">
          Loading…
        </div>
      ) : orders.length === 0 ? (
        syncing ? (
          <div className="bg-white border border-ink/10 p-10 text-center text-ink/55 text-sm">
            Loading your orders…
          </div>
        ) : (
          <EmptyState />
        )
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id}>
              <OrderCard
                order={o}
                tracking={tracking[o.id]}
                busy={cancellingId === o.id}
                onCancel={() => onCancel(o)}
              />
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-ink/10 p-10 md:p-14 text-center">
      <div className="mx-auto w-12 h-12 border border-ink/20 flex items-center justify-center text-ink/55">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 7.5 12 3l9 4.5v9L12 21 3 16.5v-9Z" />
          <path d="M3 7.5 12 12l9-4.5M12 12v9" />
        </svg>
      </div>
      <div className="mt-4 text-base font-semibold text-ink">No orders yet</div>
      <p className="mt-1 text-sm text-ink/65">
        When you order something it will appear here.
      </p>
      <Link
        href="/shop"
        className="mt-5 inline-block bg-maroon-deep text-ivory px-6 py-2.5 text-sm font-semibold tracking-wide hover:bg-maroon transition-colors"
      >
        Browse sarees
      </Link>
    </div>
  );
}

type TrackingEntry = OrderTrackingMap[string];

function OrderCard({
  order,
  tracking,
  busy,
  onCancel,
}: {
  order: Order;
  tracking?: TrackingEntry;
  busy: boolean;
  onCancel: () => void;
}) {
  const placedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const isCancelled = order.status === 'cancelled';

  return (
    <article className="border border-ink/15 bg-white">
      {/* Header strip */}
      <header className="flex flex-wrap items-center gap-3 px-4 lg:px-5 py-3 border-b border-ink/10 bg-bone/20">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold tracking-widest text-ink/55">
            ORDER {order.id}
          </div>
          <div className="text-xs text-ink/65 mt-0.5 tabular-nums">
            Placed {placedDate} · {order.itemCount}{' '}
            {order.itemCount === 1 ? 'item' : 'items'} · {formatINR(order.total)}
          </div>
        </div>
        <StatusBadge order={order} tracking={tracking} />
      </header>

      {/* Body — items */}
      <div className="p-4 lg:p-5">
        <ul className="divide-y divide-ink/10">
          {order.items.map((it) => (
            <li key={it.productId} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <Link
                href={`/shop/${productSlug({ id: it.productId, name: it.name })}`}
                className="relative w-14 h-18 shrink-0 overflow-hidden bg-bone"
                style={{ aspectRatio: '3 / 4' }}
              >
                {it.image ? (
                  <Image src={it.image} alt={it.name} fill sizes="56px" className="object-cover" />
                ) : null}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-ink/55">{it.weave}</div>
                <Link
                  href={`/shop/${productSlug({ id: it.productId, name: it.name })}`}
                  className="text-sm font-semibold text-ink hover:text-maroon line-clamp-2"
                >
                  {it.name}
                </Link>
                <div className="text-[11px] text-ink/55 mt-0.5">
                  Qty {it.qty} · {formatINR(it.unitPrice)}
                </div>
              </div>
              <div className="text-sm font-semibold text-ink tabular-nums shrink-0">
                {formatINR(it.unitPrice * it.qty)}
              </div>
            </li>
          ))}
        </ul>

        {/* Courier + AWB strip (live from Shiprocket) */}
        {!isCancelled && (tracking?.courier || tracking?.awbCode) && (
          <div className="mt-3 pt-3 border-t border-ink/10 flex flex-wrap items-center gap-2 text-[11px] text-ink/70">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                title="Live from Shiprocket"
                className="w-1.5 h-1.5 rounded-full bg-peacock"
              />
              {tracking?.courier && (
                <span className="font-semibold text-ink">{tracking.courier}</span>
              )}
              {tracking?.courier && tracking?.awbCode && (
                <span className="text-ink/40">·</span>
              )}
              {tracking?.awbCode && (
                <span className="tabular-nums">
                  AWB <span className="font-mono text-ink">{tracking.awbCode}</span>
                </span>
              )}
            </span>
          </div>
        )}

        {/* Meta + actions */}
        <div className="mt-4 pt-4 border-t border-ink/10 flex flex-wrap items-end justify-between gap-3">
          <dl className="text-[11px] text-ink/65 space-y-0.5">
            <Meta label="Payment" value={PAY_LABEL[order.payMethod]} />
            <Meta label="Delivery" value={SHIP_LABEL[order.shipMethod]} />
            <Meta
              label="Ship to"
              value={`${order.address.fullName}, ${order.address.city} ${order.address.pincode}`}
            />
          </dl>
          <div className="flex items-center gap-2">
            {isCancelled ? (
              <Link
                href={`/order/cancelled?id=${order.id}${order.paid ? '&paid=1' : ''}`}
                className="border border-ink/25 text-ink px-4 py-2 text-[11px] font-bold tracking-wider uppercase hover:bg-maroon-deep hover:text-ivory transition-colors"
              >
                View details
              </Link>
            ) : (
              <>
                <Link
                  href={`/order/thank-you?id=${order.id}&email=${encodeURIComponent(order.address.email)}&phone=${encodeURIComponent(order.address.phone)}&ship=${order.shipMethod}`}
                  className="border border-ink/25 text-ink px-4 py-2 text-[11px] font-bold tracking-wider uppercase hover:bg-maroon-deep hover:text-ivory transition-colors"
                >
                  Track order
                </Link>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={busy}
                  className="bg-maroon text-ivory px-4 py-2 text-[11px] font-bold tracking-wider uppercase hover:bg-maroon-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {busy ? 'Cancelling…' : 'Cancel order'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ order, tracking }: { order: Order; tracking?: TrackingEntry }) {
  // Cancelled is the one state that always overrides live tracking —
  // mirror the admin's rule so a server-side cancel immediately turns
  // the badge red.
  if (order.status === 'cancelled' || tracking?.cancelled) {
    return (
      <span className="text-[10px] font-bold tracking-wider uppercase bg-maroon text-ivory px-2.5 py-1">
        Cancelled
      </span>
    );
  }

  // Guard against a numeric Shiprocket code leaking through to display
  // text — same defensive check the admin uses.
  const raw = (tracking?.currentStatus || '').trim();
  const isNumericCode = /^\d+$/.test(raw);
  const liveText = tracking?.source === 'shiprocket' && raw && !isNumericCode ? raw : '';

  if (liveText) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase bg-peacock text-ivory px-2.5 py-1"
        title={`Live from Shiprocket · ${liveText}`}
      >
        <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-ivory" />
        {liveText}
      </span>
    );
  }

  // Fallbacks for the window between order placement and Shiprocket
  // acknowledging the shipment: show paid vs awaiting payment so the
  // user has some signal.
  return (
    <span className="text-[10px] font-bold tracking-wider uppercase bg-peacock text-ivory px-2.5 py-1">
      {order.paid ? 'Placed' : 'Awaiting payment'}
    </span>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <dt className="font-semibold text-ink/70 min-w-[60px]">{label}:</dt>
      <dd className="text-ink/75">{value}</dd>
    </div>
  );
}
