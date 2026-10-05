// Thin fetch wrapper around the Thridhavarnam CRM backend.
// Read endpoints are public; write endpoints (which the storefront doesn't
// call) are admin-authed.
//
// Base URL resolution:
//   1. NEXT_PUBLIC_API_URL if provided
//   2. Otherwise → production backend at https://api.thridhavarnam.com/api
// Render is commented out for now — its deployed build doesn't yet have
// the public GET routes we added locally, so it returns 401.
const BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000/api';
  // 'https://sareeebackend.onrender.com/api';
  // 'https://api.thridhavarnam.com/api';

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
  // Storefront "Shop by weave" rail fields — admin-managed.
  image?: string;   // Cloudinary URL for the tile
  region?: string;  // Subtitle under the name ("Kanchipuram")
  order?: number;   // Ascending display order
  active?: boolean; // Hide the tile when false
};

export type BackendOccasion = {
  id: string;
  name: string;
  color?: string;
  image?: string;       // Cloudinary URL for the storefront home tile
  fromAmount?: number;  // Range floor for the home tile ("₹X – ₹Y")
  toAmount?: number;    // Range ceiling; 0 means open-ended ("From ₹X")
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

// Client-side cache for public GET responses.
// Entries expire after CACHE_TTL ms so stale data never lives too long,
// but navigating between product pages reuses the expensive product list
// instead of re-fetching it on every click.
const CACHE_TTL = 60_000;
const responseCache = new Map<string, { data: unknown; at: number }>();

// In-flight deduplication — collapses concurrent callers onto one promise.
const inFlight = new Map<string, Promise<unknown>>();

function request<T>(
  path: string,
  init: { method?: string; body?: unknown; auth?: boolean; revalidate?: number } = {},
): Promise<T> {
  const isWrite = !!(init.method && init.method !== 'GET');
  const isPublicRead = !isWrite && !init.auth;

  if (isPublicRead) {
    // 1. Return cached data if still fresh.
    const cached = responseCache.get(path);
    if (cached && Date.now() - cached.at < CACHE_TTL) {
      return Promise.resolve(cached.data as T);
    }
    // 2. Return in-flight promise if one is already running.
    const existing = inFlight.get(path);
    if (existing) return existing as Promise<T>;
  }

  const promise = doFetch<T>(path, init).then((data) => {
    if (isPublicRead) responseCache.set(path, { data, at: Date.now() });
    return data;
  });

  if (isPublicRead) {
    inFlight.set(path, promise as Promise<unknown>);
    void (promise as Promise<unknown>).finally(() => inFlight.delete(path));
  }

  return promise;
}

async function doFetch<T>(
  path: string,
  init: { method?: string; body?: unknown; auth?: boolean; revalidate?: number },
): Promise<T> {
  const headers: Record<string, string> = {};
  if (init.body !== undefined) headers['Content-Type'] = 'application/json';
  if (init.auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  // Writes and auth requests always bypass cache.
  // Reads use Next.js ISR: `revalidate` seconds if specified, otherwise
  // 60 s so the browser/CDN can serve stale while the server revalidates.
  const isWrite = !!(init.method && init.method !== 'GET');
  const fetchCache: RequestCache | undefined = isWrite || init.auth ? 'no-store' : undefined;
  const nextOpts = (!isWrite && !init.auth)
    ? { revalidate: init.revalidate ?? 60 }
    : undefined;

  // Reads retry on transient upstream failures (502/503/504 or a dropped
  // connection) — covers the brief window during a PM2 reload when nginx
  // has no backend to proxy to. Writes stay single-attempt so a
  // half-applied POST isn't repeated.
  const maxAttempts = isWrite ? 1 : 3;
  const backoffMs = [0, 250, 750];
  let lastErr: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, backoffMs[attempt]));

    let res: Response;
    try {
      res = await fetch(`${BASE}${path}`, {
        ...(fetchCache ? { cache: fetchCache } : {}),
        ...(nextOpts ? { next: nextOpts } : {}),
        method: init.method ?? 'GET',
        headers,
        body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      });
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts - 1) continue;
      throw err;
    }

    if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt < maxAttempts - 1) {
      lastErr = new Error(`API ${res.status} for ${path}`);
      continue;
    }

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

  throw lastErr instanceof Error ? lastErr : new Error(`API failed for ${path}`);
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
  list: () => request<BackendProduct[]>('/products', { revalidate: 300 }),
  get: (id: string) => request<BackendProduct>(`/products/${encodeURIComponent(id)}`, { revalidate: 300 }),
};

export const categoriesApi = {
  list: () => request<BackendCategory[]>('/categories', { revalidate: 3600 }),
};

export const occasionsApi = {
  list: () => request<BackendOccasion[]>('/occasions', { revalidate: 3600 }),
};

// Heritage Story — one entry per weave shown on the storefront intro
// scroll. Admin-editable via the admin panel Stories page. All copy
// fields are optional so partially-filled records still render.
export type BackendStory = {
  id: string;
  name?: string;
  region?: string;
  state?: string;
  era?: string;
  image?: string;
  palette?: string[];
  intro?: string;
  origins?: string;
  technique?: string;
  look_for?: string[];
  pull_quote?: string;
  order?: number;
};

export const storiesApi = {
  list: () => request<BackendStory[]>('/stories', { revalidate: 300 }),
};

// Product review — submitted from the storefront product page, listed
// on both the product page and in the admin panel. `createdAt` is an
// ISO string returned by Mongoose's timestamps option.
export type BackendReview = {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment?: string;
  createdAt: string;
};

export const reviewsApi = {
  list: (productId?: string) =>
    request<BackendReview[]>(
      productId ? `/reviews?productId=${encodeURIComponent(productId)}` : '/reviews',
    ),
  create: (payload: {
    productId: string;
    name: string;
    rating: number;
    comment?: string;
  }) => request<BackendReview>('/reviews', { method: 'POST', body: payload }),
};

// Home hero banner — one slide on the storefront Hero carousel.
// Admin-managed via the Banners tab. If any banners are active on the
// backend, the Hero renders them in place of the product-driven
// default slides.
export type BackendBanner = {
  id: string;
  // 'hero' for the home hero carousel (default), 'weave' for a
  // Shop-by-weave tile image override, 'parallax' for the mid-page
  // Feature banner (ParallaxBanner.tsx).
  type?: 'hero' | 'weave' | 'parallax';
  // Category name when type='weave'; eyebrow/chip label when type='parallax'.
  weave?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  ctaLabel?: string;
  ctaHref?: string;
  order?: number;
  active?: boolean;
};

export const bannersApi = {
  list: () => request<BackendBanner[]>('/banners', { revalidate: 300 }),
};

// Home "Shop by price" tile — one entry per price bucket shown on the
// storefront home. Admin-managed via the Price Buckets tab.
export type BackendPriceBucket = {
  id: string;
  label?: string;
  subtitle?: string;
  image?: string;
  href?: string;
  startingPrice?: number;
  order?: number;
  active?: boolean;
};

export const priceBucketsApi = {
  list: () => request<BackendPriceBucket[]>('/price-buckets', { revalidate: 300 }),
};

export const couponsApi = {
  list: () => request<BackendCoupon[]>('/coupons', { revalidate: 60 }),
};

// Fetches all static reference data in a single round-trip.
// Use this instead of calling categoriesApi/occasionsApi/bannersApi/etc
// individually — the backend serves everything from its in-memory cache.
export type StorefrontInit = {
  categories: BackendCategory[];
  occasions: BackendOccasion[];
  banners: BackendBanner[];
  priceBuckets: BackendPriceBucket[];
  coupons: BackendCoupon[];
};

export const storefrontInitApi = {
  get: () => request<StorefrontInit>('/storefront/init', { revalidate: 300 }),
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
// Insert Cloudinary transformation params so the browser gets a compressed,
// correctly-sized image instead of the raw full-resolution upload.
// f_auto  → WebP/AVIF for modern browsers, JPEG fallback for older ones
// q_auto  → Cloudinary picks the optimal quality level
// w_N,c_limit → resize to at most N px wide; never upscale
// Safe to call on non-Cloudinary URLs — returns the original URL unchanged.
// Skips re-insertion if transformations are already present in the URL.
export function cloudinaryUrl(url: string | undefined, width = 1920): string {
  if (!url || !url.includes('res.cloudinary.com')) return url ?? '';
  if (url.includes('f_auto') || url.includes('q_auto')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
}

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

// Optional id→display-name map so the storefront can resolve a product's
// admin-picked category (stored as the Category record's id, e.g.
// "kanjivaram") back to its display name ("Kanjivaram") for filter and
// count matching when the free-text `weave` field wasn't filled in.
export function backendToSaree(
  p: BackendProduct,
  categoryMap?: Record<string, string>,
): Saree {
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

  // Prefer the free-text `weave` ("Work") input, but if that's empty fall
  // back to the linked Category's display name so a product tagged only
  // via the admin Category dropdown still surfaces under the storefront
  // Weave filter and its counts.
  const rawWeave = (p.weave ?? '').trim();
  const resolvedWeave =
    rawWeave ||
    (p.category ? categoryMap?.[p.category] ?? p.category : '');

  return {
    id: p.id,
    name: p.name ?? '',
    weave: resolvedWeave as Weave,
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
