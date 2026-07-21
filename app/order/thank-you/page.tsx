import type { Metadata } from 'next';
import { Suspense } from 'react';
import ThankYouView from '@/components/order/ThankYouView';

export const metadata: Metadata = {
  title: 'Thank you · Thridha Varnam',
  description:
    'Your order has been placed. A confirmation has been sent to your email. Track your order or continue shopping.',
};

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory" />}>
      <ThankYouView />
    </Suspense>
  );
}
