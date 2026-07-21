'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PaymentCancelledView() {
  const params = useSearchParams();
  const orderId = params.get('order') || params.get('id') || '';
  const reason = (params.get('reason') || 'cancelled') as
    | 'cancelled'
    | 'declined'
    | 'timeout'
    | 'failed'
    | string;

  const reasonLine: Record<string, string> = {
    cancelled: 'You cancelled the payment before it was completed.',
    declined: 'Your bank declined the transaction. No amount has been charged.',
    timeout: 'The payment timed out. No amount has been charged.',
    failed: 'The transaction could not be completed. No amount has been charged.',
  };
  const message = reasonLine[reason] ?? reasonLine.failed;

  return (
    <div className="min-h-screen bg-white text-ink flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[460px] border border-ink/15 bg-white">
        {/* Status strip */}
        <div className="bg-maroon text-ivory px-4 py-2.5 flex items-center gap-2 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="m9 9 6 6M15 9l-6 6" strokeLinecap="round" />
          </svg>
          <span className="font-semibold flex-1">Payment not completed</span>
          <span className="text-[11px] text-ivory/85">₹0.00 charged</span>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-ink/80 leading-relaxed">{message}</p>

          {orderId && (
            <div className="flex items-baseline justify-between border-y border-ink/10 py-2.5 text-xs">
              <span className="text-ink/55">Order reference</span>
              <span className="font-bold text-ink font-mono">{orderId}</span>
            </div>
          )}

          <div className="border border-peacock/30 bg-peacock/5 px-3 py-2 text-xs">
            <span className="font-bold text-peacock">Your bag is still saved.</span>
            <span className="text-ink/70"> Items are reserved for the next 30 minutes — retry with a different method.</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/shop?bag=1"
              className="flex-1 bg-maroon-deep text-ivory py-2.5 text-center text-xs font-bold tracking-wider uppercase hover:bg-maroon transition-colors"
            >
              Retry payment
            </Link>
            <Link
              href="/contact"
              className="flex-1 border border-ink/25 text-ink py-2.5 text-center text-xs font-bold tracking-wider uppercase hover:bg-maroon-deep hover:text-ivory transition-colors"
            >
              Need help
            </Link>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <Link href="/shop" className="text-ink/55 hover:text-ink underline underline-offset-2">
              Back to catalogue
            </Link>
            <a href="tel:+919949528787" className="text-ink/55 hover:text-ink underline underline-offset-2 tabular-nums">
              +91 99495 28787
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
