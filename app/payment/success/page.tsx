import type { Metadata } from 'next';
import { Suspense } from 'react';
import PaymentSuccessView from '@/components/payment/PaymentSuccessView';

export const metadata: Metadata = {
  title: 'Payment successful · Thridha Varnam',
  description: 'Your payment has been received. Redirecting to your order confirmation.',
};

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory" />}>
      <PaymentSuccessView />
    </Suspense>
  );
}
