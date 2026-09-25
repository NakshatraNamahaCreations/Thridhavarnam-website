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

export default function OrderCancelledView() {
  const params = useSearchParams();
  const { getOrder } = useOrders();
  const id = params.get('id') || params.get('order') || '';
  const order = id ? getOrder(id) : undefined;
  const reasonParam = params.get('reason');
  const paid = order?.paid ?? params.get('paid') === '1';

  const reasonLabel: Record<string, string> = {
    user: 'Cancelled by you',
    payment: 'Payment was not completed',
    stock: 'One or more items are out of stock',
  };
  const reason = (order?.cancelReason ?? reasonParam) || 'user';
  const reasonText = reasonLabel[reason] ?? 'Cancelled before dispatch';

  const placedDate = order
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—';
  const cancelledDate = order?.cancelledAt
    ? new Date(order.cancelledAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      });

  // Refund window — cards/UPI ~5–7 days, NEFT ~7–10
  const refundBy = (() => {
    const base = order?.cancelledAt ?? Date.now();
    const d = new Date(base);
    const days = order?.payMethod === 'netbanking' ? 10 : 7;
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  })();

  return (
    <div className="min-h-screen bg-white text-ink">
      {/* Slim status strip */}
      <div className="bg-maroon text-ivory">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-2.5 flex items-center gap-2 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden className="shrink-0">
            <circle cx="12" cy="12" r="9" />
            <path d="m9 9 6 6M15 9l-6 6" strokeLinecap="round" />
          </svg>
          <span className="font-semibold">{reasonText}.</span>
          {paid && <span className="text-ivory/85 text-xs">Refund initiated.</span>}
        </div>
      </div>

      {/* Compact info bar */}
      <header className="border-b border-ink/10">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <InfoCell label="Order" value={order?.id || id || 'TV00000000'} bold mono />
          <InfoCell label="Placed" value={placedDate} hidden={!order} />
          <InfoCell label="Cancelled" value={cancelledDate} />
          <InfoCell label="Total" value={formatINR(order?.total ?? 0)} bold hidden={!order} />
          <InfoCell label="Payment" value={order ? PAY_LABEL[order.payMethod] : ''} hidden={!order} />
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
        {paid && order && (
          <RefundStrip
            amount={order.total}
            method={PAY_LABEL[order.payMethod]}
            refundBy={refundBy}
          />
        )}

        {/* Items + meta side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <section className="border border-ink/15">
            <div className="px-4 py-2.5 border-b border-ink/10 flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink">
                Items{' '}
                <span className="text-ink/55 font-normal tabular-nums">
                  ({order?.itemCount ?? 0})
                </span>
              </h2>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-maroon text-ivory px-2 py-0.5">
                Cancelled
              </span>
            </div>
            {order ? (
              <ul className="divide-y divide-ink/10">
                {order.items.map((it) => (
                  <li key={it.productId} className="flex gap-3 p-3 opacity-75">
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
                Order details aren&apos;t loaded on this device.
              </div>
            )}
          </section>

          <aside className="space-y-4">
            {order && (
              <>
                <MetaBlock title="Was shipping to">
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

                <MetaBlock title="Order summary">
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
                  <SummaryRow label="Total" value={formatINR(order.total)} strong />
                  <div className="mt-2 text-[11px] text-ink/55">
                    {SHIP_LABEL[order.shipMethod]} delivery · {PAY_LABEL[order.payMethod]}
                  </div>
                </MetaBlock>
              </>
            )}

            <div className="flex items-center gap-2">
              <Link
                href="/shop"
                className="flex-1 bg-maroon-deep text-ivory py-2.5 text-center text-xs font-bold tracking-wider uppercase hover:bg-maroon transition-colors"
              >
                Continue shopping
              </Link>
              <Link
                href="/contact"
                className="flex-1 border border-ink/25 text-ink py-2.5 text-center text-xs font-bold tracking-wider uppercase hover:bg-maroon-deep hover:text-ivory transition-colors"
              >
                Need help
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function RefundStrip({
  amount,
  method,
  refundBy,
}: {
  amount: number;
  method: string;
  refundBy: string;
}) {
  return (
    <div className="border border-peacock/30 bg-peacock/5 px-4 py-3 flex flex-wrap items-baseline justify-between gap-2">
      <div className="text-sm">
        <span className="font-bold text-peacock">Refund of {formatINR(amount)} initiated</span>
        <span className="text-ink/70"> to your {method}.</span>
      </div>
      <div className="text-xs text-ink/65 tabular-nums">
        Expected by <span className="font-semibold text-ink">{refundBy}</span>
      </div>
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
