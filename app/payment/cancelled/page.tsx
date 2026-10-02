import type { Metadata } from 'next';
import { Suspense } from 'react';
import PaymentCancelledView from '@/components/payment/PaymentCancelledView';

export const metadata: Metadata = {
  title: 'Payment cancelled · Thridha Varnam',
  description:
    'Your payment was not completed. Your bag is still saved — retry with a different method or contact us for help.',
};

export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory" />}>
      <PaymentCancelledView />
    </Suspense>
  );
}
