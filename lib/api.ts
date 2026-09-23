// Thin fetch wrapper around the Thridhavarnam CRM backend.
// Read endpoints are public; write endpoints (which the storefront doesn't
// call) are admin-authed.
//
// Base URL resolution:
//   1. NEXT_PUBLIC_API_URL if provided
//   2. Otherwise → local backend on :5000
// Render is commented out for now — its deployed build doesn't yet have
// the public GET routes we added locally, so it returns 401.
const BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  // 'http://localhost:5000/api';
  // 'https://sareeebackend.onrender.com/api';
  'https://api.thridhavarnam.com/api';

// Shape returned by GET /api/products and /api/products/:id — kept loose
// (all fields optional) because older documents seeded before the accordion
// fields were added won't have them.
export type BackendProduct = {
  id: string;
  name?: string;
  category?: string;
  occasion?: string;
  badges?: string[];
  flags?: string[];
  color?: string;
  description?: string;
  price?: number;
  mrp?: number;
  stock?: number;
  sold?: number;
  rating?: number;
  status?: string;
  image?: string;

  // Product Details section
  styleNo?: string;
  designNo?: string;
  weave?: string;
  region?: string;
  length?: string;
  blouse?: string;
  zari?: string;
  weight?: string;
  packContains?: string;
  manufactured?: string;

  // Gallery — each image carries its own colour label so the storefront
  // can group variants by colourway.
  images?: { url: string; color?: string }[];

  // Product Speciality
  story?: string;

  // Style & Fit Tips
  styleTips?: string;
  fitTips?: string;

  // Shipping & Returns copy — free-form, may contain newlines
  shippingReturns?: string;

  // FAQs
  faqs?: { q: string; a: string }[];
};

export type BackendCategory = {
  id: string;
  name: string;
  color?: string;
};

export type BackendOccasion = {
  id: string;
  name: string;
  color?: string;
};

export type BackendCoupon = {
  id: string;
  code: string;
  description?: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  startDate?: string;
  expiryDate?: string;
  usageLimit?: number;
  usageCount?: number;
  active?: boolean;
};

// JWT storage — persisted in localStorage so a hard reload keeps the user
// signed in, mirroring how the admin panel behaves.
const TOKEN_KEY = 'tridha-token';
export const getToken = () =>
  typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, t);
};
export const clearToken = () => {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
};

async function request<T>(
  path: string,
  init: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (init.body !== undefined) headers['Content-Type'] = 'application/json';
  if (init.auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    cache: 'no-store',
    method: init.method ?? 'GET',
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  if (!res.ok) {
    const msg =
      (data && typeof data === 'object' && 'message' in data && typeof (data as { message?: unknown }).message === 'string')
        ? (data as { message: string }).message
        : `API ${res.status} for ${path}`;
    throw new Error(msg);
  }
  return data as T;
}

export type BackendUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  dob?: string;
};

export type BackendEnquiry = {
  id?: string;
  _id?: string;
  ref: string;
  name: string;
  email: string;
  phone: string;
  weave?: string;
  occasion?: string;
  budget?: string;
  timeline?: string;
  notes?: string;
  status?: 'new' | 'contacted' | 'in-progress' | 'converted' | 'closed';
  createdAt?: string;
  updatedAt?: string;
};

export const productsApi = {
  list: () => request<BackendProduct[]>('/products'),
  get: (id: string) => request<BackendProduct>(`/products/${encodeURIComponent(id)}`),
};

export const categoriesApi = {
  list: () => request<BackendCategory[]>('/categories'),
};

export const occasionsApi = {
  list: () => request<BackendOccasion[]>('/occasions'),
};

export const couponsApi = {
  list: () => request<BackendCoupon[]>('/coupons'),
};

export const enquiriesApi = {
  create: (payload: {
    name: string;
    email: string;
    phone: string;
    weave: string;
    occasion: string;
    budget: string;
    timeline: string;
    notes: string;
  }) =>
    request<BackendEnquiry>('/enquiries', {
      method: 'POST',
      body: payload,
    }),
};

export type RazorpayOrderResponse = {
  id: string;              // Razorpay order id (order_xxx)
  entity: 'order';
  amount: number;          // paise
  currency: string;
  receipt?: string;
  status: string;
  key_id: string;          // echoed back so the client can open Checkout
};

export const razorpayApi = {
  // amount is in INR rupees; the backend converts to paise for Razorpay.
  createOrder: (payload: { amount: number; receipt?: string; notes?: Record<string, string> }) =>
    request<RazorpayOrderResponse>('/payments/razorpay/order', {
      method: 'POST',
      body: payload,
    }),
  verify: (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId?: string;
    customer?: string;
    amount?: number;
    method?: string;
  }) =>
    request<{ ok: boolean; razorpay_payment_id: string; razorpay_order_id: string }>(
      '/payments/razorpay/verify',
      { method: 'POST', body: payload },
    ),
};

// Payload shape POSTed to the backend after a successful checkout — the
// backend persists it and auto-pushes to Shiprocket.
export type StorefrontOrderPayload = {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  lineItems: {
    productId: string;
    name: string;
    sku?: string;
    qty: number;
    unitPrice: number;
  }[];
  itemCount: number;
  payMethod: 'upi' | 'card' | 'netbanking';
  shipMethod: 'standard' | 'express';
  paid: boolean;
  promoCode: string | null;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  razorpay?: {
    orderId: string;
    paymentId: string;
    signature: string;
  };
};

export type StorefrontOrderResponse = {
  id: string;
  status: string;
  payment: string;
  shiprocket: {
    orderId: string;
    shipmentId: string;
    awbCode: string;
    courier: string;
    status: 'created' | 'failed' | 'pending';
    error?: string;
  } | null;
};

export const storefrontOrdersApi = {
  place: (payload: StorefrontOrderPayload) =>
    request<StorefrontOrderResponse>('/storefront/orders', {
      method: 'POST',
      body: payload,
    }),
};

export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: BackendUser }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  register: (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    mobile?: string;
    dob?: string;
  }) =>
    request<{ token: string; user: BackendUser }>('/auth/register', {
      method: 'POST',
      body: { ...payload, role: 'Customer' },
    }),
  me: () => request<BackendUser>('/auth/me', { auth: true }),
};

// Given a coupon + a subtotal, return the discount amount in INR (0 if the
// coupon doesn't apply). Keeps discount math consistent between the cart
// preview and the checkout popup.
export function calcCouponDiscount(coupon: BackendCoupon, subtotal: number): number {
  if (!coupon || coupon.active === false) return 0;
  if (coupon.expiryDate) {
    const t = new Date(coupon.expiryDate).getTime();
    if (!Number.isNaN(t) && t < Date.now()) return 0;
  }
  if (coupon.usageLimit && coupon.usageCount && coupon.usageCount >= coupon.usageLimit) return 0;
  if (coupon.minOrder && subtotal < coupon.minOrder) return 0;
  let d = coupon.type === 'fixed'
    ? coupon.value
    : Math.round(subtotal * (coupon.value / 100));
  if (coupon.type === 'percent' && coupon.maxDiscount) d = Math.min(d, coupon.maxDiscount);
  return Math.max(0, Math.min(d, subtotal));
}

// Reshape a backend Product into the Saree shape the storefront components
// (ProductCard, ShopView filters, etc.) already consume. Values are passed
// through verbatim; enum-typed fields (tier, weave) are cast so TS is happy,
// but no static fallback content is injected — if the backend value doesn't
// match a known enum member the item simply won't match tier/weave filters,
// which is the correct behaviour.
import type { Saree, Tier, Weave, BadgeKind } from './sarees';

export function backendToSaree(p: BackendProduct): Saree {
  // Badges are admin-controlled only — no stock-based fallback. If nothing is
  // picked in the admin panel, the card shows no ribbon.
  const ALLOWED: BadgeKind[] = ['ready', 'fast', 'last'];
  const badges: BadgeKind[] = Array.isArray(p.badges)
    ? p.badges.filter((b): b is BadgeKind => (ALLOWED as string[]).includes(b))
    : [];

  // Admin gallery — keep only well-formed entries so the storefront can
  // group swatches by colour without worrying about null / empty urls.
  const images = Array.isArray(p.images)
    ? p.images
        .filter((entry): entry is { url: string; color?: string } => !!entry && !!entry.url)
        .map((entry) => ({ url: entry.url, color: (entry.color ?? '').trim() }))
    : undefined;

  return {
    id: p.id,
    name: p.name ?? '',
    weave: (p.weave ?? '') as Weave,
    region: p.region ?? '',
    // `tier` in the storefront (Bridal / Festive / Everyday) is driven by
    // the admin's Occasion tag — its ids match the Tier union. The admin's
    // "Category" field holds weave-like ids (Kanjivaram, Mixed Pattu…) and
    // is surfaced via `weave`/filters, not tier.
    tier: (p.occasion ?? '') as Tier,
    occasion: p.occasion ?? '',
    flags: Array.isArray(p.flags) ? p.flags : [],
    stock: typeof p.stock === 'number' ? p.stock : undefined,
    price: typeof p.price === 'number' ? p.price : 0,
    mrp: typeof p.mrp === 'number' ? p.mrp : 0,
    badges,
    story: p.story ?? '',
    image: p.image ?? '',
    palette: [],
    details: {
      length: p.length ?? '',
      blouse: p.blouse ?? '',
      zari: p.zari ?? '',
      weight: p.weight ?? undefined,
    },
    images,
  };
}
