'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type OrderStatus = 'placed' | 'cancelled';
export type PayMethod = 'upi' | 'card' | 'netbanking' | 'cod';
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
  codFee: number;
  tax: number;
  total: number;
};

export type PlaceOrderInput = Omit<Order, 'id' | 'createdAt' | 'status'>;

type OrdersState = {
  orders: Order[];
};

type OrdersContextValue = OrdersState & {
  hydrated: boolean;
  placeOrder: (input: PlaceOrderInput) => Order;
  cancelOrder: (id: string, reason?: string) => Order | null;
  getOrder: (id: string) => Order | undefined;
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

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OrdersState>({ orders: [] });
  const [hydrated, setHydrated] = useState(false);

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

  const placeOrder = useCallback((input: PlaceOrderInput): Order => {
    const order: Order = {
      ...input,
      id: genOrderId(),
      createdAt: Date.now(),
      status: 'placed',
    };
    setState((s) => ({ orders: [order, ...s.orders] }));
    return order;
  }, []);

  const cancelOrder = useCallback((id: string, reason?: string): Order | null => {
    let updated: Order | null = null;
    setState((s) => ({
      orders: s.orders.map((o) => {
        if (o.id !== id || o.status === 'cancelled') return o;
        updated = {
          ...o,
          status: 'cancelled',
          cancelledAt: Date.now(),
          cancelReason: reason ?? 'user',
        };
        return updated;
      }),
    }));
    return updated;
  }, []);

  const getOrder = useCallback(
    (id: string) => state.orders.find((o) => o.id === id),
    [state.orders],
  );

  const value = useMemo<OrdersContextValue>(
    () => ({
      orders: state.orders,
      hydrated,
      placeOrder,
      cancelOrder,
      getOrder,
    }),
    [state.orders, hydrated, placeOrder, cancelOrder, getOrder],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOrders() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useOrders must be used inside <OrdersProvider>');
  return ctx;
}
