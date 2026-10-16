'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/lib/auth';
import { storefrontOrdersApi, type StorefrontOrderRecord } from '@/lib/api';

export type OrderStatus = 'placed' | 'cancelled';
export type PayMethod = 'upi' | 'card' | 'netbanking';
export type ShipMethod = 'standard' | 'express';

export type OrderItem = {
  productId: string;
  name: string;
  weave: string;
  qty: number;
  unitPrice: number;
  image: string;
};

export type OrderAddress = {
  fullName: string;
  phone: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

export type Order = {
  id: string;
  createdAt: number;
  status: OrderStatus;
  cancelledAt?: number;
  cancelReason?: string;
  items: OrderItem[];
  itemCount: number;
  address: OrderAddress;
  payMethod: PayMethod;
  shipMethod: ShipMethod;
  paid: boolean;
  promoCode: string | null;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  // Captured off the backend record when available. Used by the account
  // orders list to show courier + AWB alongside the live status badge.
  shiprocket?: {
    orderId: string;
    shipmentId: string;
    awbCode: string;
    courier: string;
    status: string;
  };
};

export type PlaceOrderInput = Omit<Order, 'id' | 'createdAt' | 'status'>;

type OrdersState = {
  orders: Order[];
};

type OrdersContextValue = OrdersState & {
  hydrated: boolean;
  // True once the first backend sync completes for a signed-in user.
  // Lets callers distinguish "localStorage loaded" from "server data
  // merged in" so they can show spinners for the right windows.
  syncing: boolean;
  placeOrder: (input: PlaceOrderInput) => Order;
  cancelOrder: (id: string, reason?: string) => Promise<Order | null>;
  getOrder: (id: string) => Order | undefined;
  refresh: () => Promise<void>;
};

const STORAGE_KEY = 'tridhavarnam-orders-v1';
const Ctx = createContext<OrdersContextValue | null>(null);

function readStorage(): OrdersState {
  if (typeof window === 'undefined') return { orders: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { orders: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { orders: [] };
    return { orders: Array.isArray(parsed.orders) ? parsed.orders : [] };
  } catch {
    return { orders: [] };
  }
}

// Order IDs use a short prefix + last 8 digits of epoch + 2-char random
// suffix. Human-readable and collision-resistant enough for a demo.
function genOrderId(): string {
  const t = Date.now().toString().slice(-8);
  const r = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `TV${t}${r}`;
}

// Convert a server-side order record into the local Order type. The
// shapes are nearly identical by design — this just fills in defaults
// for fields the backend doesn't track yet (cancelReason).
function fromServer(record: StorefrontOrderRecord): Order {
  return {
    id: record.id,
    createdAt: record.createdAt,
    status: record.status,
    cancelledAt: record.cancelledAt,
    items: record.items,
    itemCount: record.itemCount,
    address: record.address,
    payMethod: record.payMethod,
    shipMethod: record.shipMethod,
    paid: record.paid,
    promoCode: record.promoCode,
    subtotal: record.subtotal,
    discount: record.discount,
    shippingFee: record.shippingFee,
    tax: record.tax,
    total: record.total,
    shiprocket: record.shiprocket,
  };
}

// Merge server orders over local-only orders, keyed by id. Server copies
// win because they include Shiprocket data + reflect admin-side state
// changes (cancellations, etc.). Local-only entries are kept so a brand
// new order shows up immediately even before the backend POST lands.
function mergeOrders(local: Order[], server: Order[]): Order[] {
  const seen = new Set<string>();
  const merged: Order[] = [];
  for (const o of server) {
    merged.push(o);
    seen.add(o.id);
  }
  for (const o of local) {
    if (!seen.has(o.id)) merged.push(o);
  }
  merged.sort((a, b) => b.createdAt - a.createdAt);
  return merged;
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OrdersState>({ orders: [] });
  const [hydrated, setHydrated] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();

  // Track the last fetched identity so a sign-in/sign-out triggers a
  // fresh fetch, and we don't keep hammering the API with the same
  // email on every render.
  const lastSyncedEmailRef = useRef<string | null>(null);

  useEffect(() => {
    setState(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* localStorage full / disabled — silent */
    }
  }, [state, hydrated]);

  // Cross-tab sync — if another tab places/cancels, mirror it here.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setState(readStorage());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const syncFromServer = useCallback(async (email: string) => {
    setSyncing(true);
    try {
      const res = await storefrontOrdersApi.list(email);
      const serverOrders = (res.orders || []).map(fromServer);
      setState((prev) => ({ orders: mergeOrders(prev.orders, serverOrders) }));
    } catch (err) {
      // Non-fatal — the user still sees whatever localStorage had.
      console.warn('[orders] backend sync failed', err);
    } finally {
      setSyncing(false);
    }
  }, []);

  // Hydrate from backend whenever the signed-in email changes.
  useEffect(() => {
    if (!hydrated) return;
    const email = user?.email || null;
    if (!email) {
      lastSyncedEmailRef.current = null;
      return;
    }
    if (lastSyncedEmailRef.current === email) return;
    lastSyncedEmailRef.current = email;
    void syncFromServer(email);
  }, [hydrated, user?.email, syncFromServer]);

  const refresh = useCallback(async () => {
    const email = user?.email;
    if (!email) return;
    await syncFromServer(email);
  }, [user?.email, syncFromServer]);

  const placeOrder = useCallback((input: PlaceOrderInput): Order => {
    const order: Order = {
      ...input,
      id: genOrderId(),
      createdAt: Date.now(),
      status: 'placed',
    };
    // Optimistic insert — the checkout flow fires the backend POST
    // separately. If the user navigates to /account/orders before that
    // POST completes, they'll still see their new order from here, and
    // the next backend sync will reconcile.
    setState((s) => ({ orders: [order, ...s.orders] }));
    return order;
  }, []);

  const cancelOrder = useCallback(
    async (id: string, reason?: string): Promise<Order | null> => {
      const existing = state.orders.find((o) => o.id === id);
      if (!existing || existing.status === 'cancelled') return null;

      // Optimistic local update so the UI flips immediately.
      const optimistic: Order = {
        ...existing,
        status: 'cancelled',
        cancelledAt: Date.now(),
        cancelReason: reason ?? 'user',
      };
      setState((s) => ({
        orders: s.orders.map((o) => (o.id === id ? optimistic : o)),
      }));

      // Propagate to the backend (which also calls Shiprocket cancel).
      // If the user is signed in and the order lives server-side, this
      // keeps the admin panel + Shiprocket in sync. Guest orders —
      // placed locally without ever hitting the backend — silently
      // succeed on the server-404 path.
      const email = user?.email || existing.address.email;
      if (email) {
        try {
          const res = await storefrontOrdersApi.cancel(id, email);
          if (res?.order) {
            const server = fromServer(res.order);
            setState((s) => ({
              orders: s.orders.map((o) => (o.id === id ? server : o)),
            }));
            return server;
          }
        } catch (err) {
          console.warn('[orders] backend cancel failed, local state kept', err);
          // Keep the optimistic cancel — the user intended to cancel,
          // and the admin can retry server-side if needed.
        }
      }
      return optimistic;
    },
    [state.orders, user?.email],
  );

  const getOrder = useCallback(
    (id: string) => state.orders.find((o) => o.id === id),
    [state.orders],
  );

  const value = useMemo<OrdersContextValue>(
    () => ({
      orders: state.orders,
      hydrated,
      syncing,
      placeOrder,
      cancelOrder,
      getOrder,
      refresh,
    }),
    [state.orders, hydrated, syncing, placeOrder, cancelOrder, getOrder, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOrders() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useOrders must be used inside <OrdersProvider>');
  return ctx;
}
