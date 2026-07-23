// Razorpay Checkout loader + typed wrapper. Kept isolated from lib/api.ts
// so this module can be lazily imported from the checkout popup — the
// checkout.js script is ~40 KB and only needs to load when a user actually
// starts paying, not on every page.

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
const SCRIPT_ID = 'razorpay-checkout-js';

// Loads Razorpay's Checkout.js once per session. Resolves when
// window.Razorpay is available; rejects if the script fails to load
// (network offline, blocked by an adblocker, etc.).
export function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay can only load in the browser'));
  }
  if ((window as unknown as { Razorpay?: unknown }).Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay Checkout')));
      return;
    }
    const s = document.createElement('script');
    s.id = SCRIPT_ID;
    s.src = SCRIPT_URL;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Razorpay Checkout'));
    document.body.appendChild(s);
  });
}

// Subset of Razorpay Checkout options we actually use. The full option
// surface is huge — see https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
export type RazorpayCheckoutOptions = {
  key: string;
  amount: number;   // paise
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    confirm_close?: boolean;
  };
};

type RazorpayInstance = {
  open: () => void;
  close: () => void;
  on: (
    event: 'payment.failed',
    handler: (resp: {
      error: {
        code: string;
        description: string;
        source?: string;
        step?: string;
        reason?: string;
        metadata?: { order_id?: string; payment_id?: string };
      };
    }) => void,
  ) => void;
};

type RazorpayCtor = new (opts: RazorpayCheckoutOptions) => RazorpayInstance;

// Opens the Razorpay Checkout modal. Caller supplies the handler + a
// failure/dismiss callback; this helper just wires them into the SDK's
// slightly-awkward `handler` + `.on('payment.failed')` + `modal.ondismiss`
// three-way API.
export async function openRazorpayCheckout(
  opts: Omit<RazorpayCheckoutOptions, 'handler' | 'modal'> & {
    onSuccess: RazorpayCheckoutOptions['handler'];
    onFailure: (reason: string) => void;
    onDismiss: () => void;
  },
): Promise<void> {
  await loadRazorpayScript();
  const Ctor = (window as unknown as { Razorpay?: RazorpayCtor }).Razorpay;
  if (!Ctor) throw new Error('Razorpay SDK not available after load');

  const { onSuccess, onFailure, onDismiss, ...rest } = opts;
  const instance = new Ctor({
    ...rest,
    handler: onSuccess,
    modal: {
      escape: true,
      confirm_close: true,
      ondismiss: onDismiss,
    },
  });
  instance.on('payment.failed', (resp) => {
    onFailure(resp?.error?.description || resp?.error?.reason || 'Payment failed');
  });
  instance.open();
}
