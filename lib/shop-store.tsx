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
import { SAREES, type Saree } from './sarees';
import { productsApi, backendToSaree } from './api';

export type CartItem = { productId: string; quantity: number };
type ToastKind = 'cart-add' | 'cart-remove' | 'wishlist-add' | 'wishlist-remove';

export type Toast = {
  id: number;
  kind: ToastKind;
  productId: string;
  message: string;
};

type ShopState = {
  cart: CartItem[];
  wishlist: string[];
};

type ShopContextValue = ShopState & {
  hydrated: boolean;
  cartCount: number;
  cartSubtotal: number;
  wishlistCount: number;

  // Look up a saree by id — checks fetched backend products first, then
  // falls back to the static SAREES catalog. Every cart / bag / checkout
  // consumer should route through this so backend products (id = SAR-XXX)
  // don't disappear from the UI.
  getProduct: (id: string) => Saree | undefined;

  // Cart
  addToCart: (productId: string, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  inCart: (productId: string) => boolean;
  clearCart: () => void;

  // Wishlist
  toggleWishlist: (productId: string) => void;
  inWishlist: (productId: string) => boolean;
  clearWishlist: () => void;

  // Toasts
  toasts: Toast[];
  dismissToast: (id: number) => void;
};

const STORAGE_KEY = 'tridhavarnam-shop-v1';
const ShopContext = createContext<ShopContextValue | null>(null);

function readStorage(): ShopState {
  if (typeof window === 'undefined') return { cart: [], wishlist: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { cart: [], wishlist: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { cart: [], wishlist: [] };
    return {
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
    };
  } catch {
    return { cart: [], wishlist: [] };
  }
}

let toastId = 0;

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ShopState>({ cart: [], wishlist: [] });
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [backendCatalog, setBackendCatalog] = useState<Saree[]>([]);

  // Hydrate from storage on mount
  useEffect(() => {
    setState(readStorage());
    setHydrated(true);
  }, []);

  // Cache backend products so cart/checkout lookups by id work for admin-
  // uploaded sarees (id = SAR-XXX) that aren't in the static SAREES list.
  useEffect(() => {
    let cancelled = false;
    productsApi
      .list()
      .then((rows) => {
        if (!cancelled) setBackendCatalog(rows.map(backendToSaree));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const getProduct = useCallback(
    (id: string): Saree | undefined =>
      backendCatalog.find((s) => s.id === id) ?? SAREES.find((s) => s.id === id),
    [backendCatalog],
  );

  // Persist on every change after hydration
  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage full / disabled — fail silently
    }
  }, [state, hydrated]);

  // Cross-tab sync: if another tab changes the cart/wishlist, mirror it here
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setState(readStorage());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const pushToast = useCallback((toast: Omit<Toast, 'id'>) => {
    toastId += 1;
    const id = toastId;
    setToasts((t) => [...t, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const productName = (id: string) => getProduct(id)?.name ?? 'Saree';

  // ── Cart ─────────────────────────────────────────────────────────────
  const addToCart = useCallback(
    (productId: string, qty = 1) => {
      setState((s) => {
        const existing = s.cart.find((i) => i.productId === productId);
        const cart = existing
          ? s.cart.map((i) =>
              i.productId === productId ? { ...i, quantity: i.quantity + qty } : i,
            )
          : [...s.cart, { productId, quantity: qty }];
        return { ...s, cart };
      });
      pushToast({
        kind: 'cart-add',
        productId,
        message: `${productName(productId)} added to bag`,
      });
    },
    [pushToast],
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setState((s) => ({
        ...s,
        cart: s.cart.filter((i) => i.productId !== productId),
      }));
      pushToast({
        kind: 'cart-remove',
        productId,
        message: `${productName(productId)} removed from bag`,
      });
    },
    [pushToast],
  );

  const updateCartQty = useCallback((productId: string, qty: number) => {
    setState((s) => {
      if (qty <= 0) {
        return { ...s, cart: s.cart.filter((i) => i.productId !== productId) };
      }
      return {
        ...s,
        cart: s.cart.map((i) =>
          i.productId === productId ? { ...i, quantity: qty } : i,
        ),
      };
    });
  }, []);

  const inCart = useCallback(
    (productId: string) => state.cart.some((i) => i.productId === productId),
    [state.cart],
  );

  const clearCart = useCallback(() => setState((s) => ({ ...s, cart: [] })), []);

  // ── Wishlist ─────────────────────────────────────────────────────────
  const toggleWishlist = useCallback(
    (productId: string) => {
      setState((s) => {
        const has = s.wishlist.includes(productId);
        const wishlist = has
          ? s.wishlist.filter((id) => id !== productId)
          : [...s.wishlist, productId];
        pushToast({
          kind: has ? 'wishlist-remove' : 'wishlist-add',
          productId,
          message: has
            ? `${productName(productId)} removed from wishlist`
            : `${productName(productId)} saved to wishlist`,
        });
        return { ...s, wishlist };
      });
    },
    [pushToast],
  );

  const inWishlist = useCallback(
    (productId: string) => state.wishlist.includes(productId),
    [state.wishlist],
  );

  const clearWishlist = useCallback(
    () => setState((s) => ({ ...s, wishlist: [] })),
    [],
  );

  // ── Derived totals ───────────────────────────────────────────────────
  const cartCount = useMemo(
    () => state.cart.reduce((sum, i) => sum + i.quantity, 0),
    [state.cart],
  );

  const cartSubtotal = useMemo(() => {
    return state.cart.reduce((sum, item) => {
      const saree = getProduct(item.productId);
      return sum + (saree?.price ?? 0) * item.quantity;
    }, 0);
  }, [state.cart, getProduct]);

  const wishlistCount = state.wishlist.length;

  const value = useMemo<ShopContextValue>(
    () => ({
      cart: state.cart,
      wishlist: state.wishlist,
      hydrated,
      cartCount,
      cartSubtotal,
      wishlistCount,
      getProduct,
      addToCart,
      removeFromCart,
      updateCartQty,
      inCart,
      clearCart,
      toggleWishlist,
      inWishlist,
      clearWishlist,
      toasts,
      dismissToast,
    }),
    [
      state,
      hydrated,
      cartCount,
      cartSubtotal,
      wishlistCount,
      getProduct,
      addToCart,
      removeFromCart,
      updateCartQty,
      inCart,
      clearCart,
      toggleWishlist,
      inWishlist,
      clearWishlist,
      toasts,
      dismissToast,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used inside <ShopProvider>');
  return ctx;
}
