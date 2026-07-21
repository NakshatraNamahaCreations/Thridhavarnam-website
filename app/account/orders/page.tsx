'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AccountShell from '@/components/account/AccountShell';
import { useOrders, type Order, type PayMethod, type ShipMethod } from '@/lib/orders';
import { formatINR, productSlug } from '@/lib/sarees';

const PAY_LABEL: Record<PayMethod, string> = {
  upi: 'UPI',
  card: 'Card',
  netbanking: 'Net banking',
  cod: 'Cash on delivery',
};

const SHIP_LABEL: Record<ShipMethod, string> = {
  standard: 'Standard',
  express: 'Express',
};

export default function OrdersPage() {
  const { orders, hydrated, cancelOrder } = useOrders();
  const router = useRouter();

  return (
    <AccountShell title="Orders">
      {!hydrated ? (
        <div className="bg-white border border-ink/10 p-10 text-center text-ink/55 text-sm">
          Loading…
        </div>
      ) : orders.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id}>
              <OrderCard
                order={o}
                onCancel={() => {
                  if (typeof window === 'undefined') return;
                  const ok = window.confirm(
                    `Cancel order ${o.id}? This cannot be undone.`,
                  );
                  if (!ok) return;
                  const updated = cancelOrder(o.id, 'user');
                  if (updated) {
                    const qs = new URLSearchParams({
                      id: updated.id,
                      reason: 'user',
                    });
                    if (updated.paid) qs.set('paid', '1');
                    router.push(`/order/cancelled?${qs.toString()}`);
                  }
                }}
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

function OrderCard({ order, onCancel }: { order: Order; onCancel: () => void }) {
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
        <StatusBadge status={order.status} paid={order.paid} />
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
                  className="bg-maroon text-ivory px-4 py-2 text-[11px] font-bold tracking-wider uppercase hover:bg-maroon-deep transition-colors"
                >
                  Cancel order
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status, paid }: { status: 'placed' | 'cancelled'; paid: boolean }) {
  if (status === 'cancelled') {
    return (
      <span className="text-[10px] font-bold tracking-wider uppercase bg-maroon text-ivory px-2.5 py-1">
        Cancelled
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold tracking-wider uppercase bg-peacock text-ivory px-2.5 py-1">
      {paid ? 'Placed' : 'Awaiting payment'}
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
