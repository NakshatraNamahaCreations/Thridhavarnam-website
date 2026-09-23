'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useOrders, type PayMethod, type ShipMethod } from '@/lib/orders';
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
        <StatusTracker eta={eta} />

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
                  <SummaryRow label="GST (5%)" value={formatINR(order.tax)} muted />
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
            <a href="mailto:support@thridhavarnam.com" className="font-semibold text-ink hover:text-maroon underline underline-offset-2">
              support@thridhavarnam.com
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

// Horizontal 5-step delivery tracker. "Confirmed" is the only step we
// actually mark as done — the rest are forecast.
function StatusTracker({ eta }: { eta: string }) {
  const steps: { label: string; sub?: string }[] = [
    { label: 'Confirmed', sub: 'Just now' },
    { label: 'Packed' },
    { label: 'Shipped' },
    { label: 'Out for delivery' },
    { label: 'Delivered', sub: `by ${eta}` },
  ];
  const currentIndex = 0; // only "Confirmed" is done

  return (
    <div className="border border-ink/15 px-4 py-4 lg:px-6">
      <div className="flex items-center justify-between gap-2">
        {steps.map((s, i) => {
          const done = i <= currentIndex;
          const active = i === currentIndex;
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
                    done
                      ? 'border-peacock bg-peacock text-ivory'
                      : 'border-ink/20 bg-white text-ink/40'
                  }`}
                >
                  {done ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M4 12 10 18 20 6" />
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
    </div>
  );
}
