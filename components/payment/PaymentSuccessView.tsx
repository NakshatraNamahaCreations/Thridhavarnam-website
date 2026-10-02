'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const REDIRECT_SECONDS = 4;

export default function PaymentSuccessView() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params.get('order') || params.get('id') || 'TV00000000';
  const ref = params.get('ref') || params.get('txn') || '';
  const amount = params.get('amount') || '';
  const method = (params.get('method') || 'card').toUpperCase();

  const [remaining, setRemaining] = useState(REDIRECT_SECONDS);

  // Intermediate page — bounce to the order thank-you after a few seconds.
  useEffect(() => {
    const tick = window.setInterval(() => {
      setRemaining((s) => Math.max(s - 1, 0));
    }, 1000);
    const redirect = window.setTimeout(() => {
      const next = new URLSearchParams({ id: orderId });
      router.replace(`/order/thank-you?${next.toString()}`);
    }, REDIRECT_SECONDS * 1000);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(redirect);
    };
  }, [router, orderId]);

  return (
    <div className="min-h-screen bg-white text-ink flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px] border border-ink/15 bg-white">
        {/* Status strip */}
        <div className="bg-peacock text-ivory px-4 py-2.5 flex items-center gap-2 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
            <path d="M4 12.5 10 18 20 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-semibold flex-1">Payment received</span>
          <span className="text-[11px] text-ivory/85">via {method}</span>
        </div>

        <div className="p-5">
          {/* Headline row — order + amount */}
          <div className="flex items-baseline justify-between border-b border-ink/10 pb-3 mb-3">
            <div>
              <div className="text-[11px] text-ink/55">Order</div>
              <div className="text-base font-bold text-ink tabular-nums font-mono">{orderId}</div>
            </div>
            {amount && (
              <div className="text-right">
                <div className="text-[11px] text-ink/55">Paid</div>
                <div className="text-base font-bold text-ink tabular-nums">₹{amount}</div>
              </div>
            )}
          </div>

          {/* Inline detail rows */}
          {ref && (
            <div className="flex items-baseline justify-between py-1 text-xs">
              <span className="text-ink/55">Reference</span>
              <span className="font-semibold text-ink font-mono break-all text-right ml-3">{ref}</span>
            </div>
          )}
          <div className="flex items-baseline justify-between py-1 text-xs">
            <span className="text-ink/55">Status</span>
            <span className="font-bold text-peacock">Authorised</span>
          </div>

          {/* Auto-redirect copy */}
          <p className="mt-4 text-[11px] text-ink/65 tabular-nums">
            Redirecting to your order confirmation in{' '}
            <span className="font-bold text-ink">{remaining}</span> s…
          </p>

          <Link
            href={`/order/thank-you?id=${orderId}`}
            className="mt-3 block w-full text-center bg-maroon-deep text-ivory py-2.5 text-xs font-bold tracking-wider uppercase hover:bg-maroon transition-colors"
          >
            Go to order
          </Link>
        </div>
      </div>
    </div>
  );
}
