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
type ToastKind =
  | 'cart-add'
  | 'cart-remove'
  | 'cart-limit'
  | 'cart-blocked'
  | 'wishlist-add'
  | 'wishlist-remove'
  | 'wishlist-blocked';

export type Toast = {
  id: number;
  kind: ToastKind;
  productId: string;
  message: string;
};

// Full-screen "Only N left in stock" popup shown when the shopper tries to
// bump quantity past the stock cap. More prominent than a corner toast so
// an accidental over-click doesn't go unnoticed.
export type StockLimitAlert = {
  productId: string;
  maxQty: number;
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

  // Stock-limit popup (modal)
  stockLimitAlert: StockLimitAlert | null;
  dismissStockLimit: () => void;
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
  const [stockLimitAlert, setStockLimitAlert] = useState<StockLimitAlert | null>(null);
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
        if (!cancelled) setBackendCatalog(rows.map((p) => backendToSaree(p)));
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

  const dismissStockLimit = useCallback(() => setStockLimitAlert(null), []);

  const productName = (id: string) => getProduct(id)?.name ?? 'Saree';

  // ── Cart ─────────────────────────────────────────────────────────────
  // The cart quantity for a product can never exceed its available stock.
  // Stock is treated as unknown (→ unlimited) when the product record
  // doesn't have a numeric `stock` field, so legacy static sarees without
  // inventory tracking keep working. A known 0 or negative stock blocks
  // the add outright with an OOS toast.
  const addToCart = useCallback(
    (productId: string, qty = 1) => {
      const product = getProduct(productId);
      const stock = product?.stock;
      const maxQty = typeof stock === 'number' ? Math.max(0, stock) : Infinity;

      if (maxQty <= 0) {
        pushToast({
          kind: 'cart-blocked',
          productId,
          message: `${productName(productId)} is out of stock`,
        });
        return;
      }

      const existing = state.cart.find((i) => i.productId === productId);
      const currentQty = existing?.quantity ?? 0;
      const finalQty = Math.min(currentQty + qty, maxQty);

      if (finalQty === currentQty) {
        // Already at or above the stock cap — raise the popup instead of
        // a toast so the shopper can't miss the message.
        setStockLimitAlert({ productId, maxQty });
        return;
      }

      setState((s) => {
        const existing2 = s.cart.find((i) => i.productId === productId);
        const cart = existing2
          ? s.cart.map((i) =>
              i.productId === productId ? { ...i, quantity: finalQty } : i,
            )
          : [...s.cart, { productId, quantity: finalQty }];
        return { ...s, cart };
      });

      pushToast({
        kind: 'cart-add',
        productId,
        message: `${productName(productId)} added to bag`,
      });
    },
    [state.cart, pushToast, getProduct],
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

  // Direct quantity override from the bag UI steppers. Clamps to stock
  // the same way addToCart does, and toasts the user when they bump up
  // against the cap so a disabled "+" button isn't a silent failure.
  const updateCartQty = useCallback(
    (productId: string, qty: number) => {
      const product = getProduct(productId);
      const stock = product?.stock;
      const maxQty = typeof stock === 'number' ? Math.max(0, stock) : Infinity;
      const clamped = qty <= 0 ? 0 : Math.min(qty, maxQty);
      const hitCap = qty > 0 && Number.isFinite(maxQty) && qty > clamped;

      setState((s) => {
        if (clamped <= 0) {
          return { ...s, cart: s.cart.filter((i) => i.productId !== productId) };
        }
        return {
          ...s,
          cart: s.cart.map((i) =>
            i.productId === productId ? { ...i, quantity: clamped } : i,
          ),
        };
      });

      if (hitCap) {
        // Shopper clicked "+" past the stock cap in the bag — show the
        // modal so the limit is unambiguous rather than a corner toast.
        setStockLimitAlert({ productId, maxQty });
      }
    },
    [getProduct],
  );

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
        // Block adding when the product is out of stock. Stock is treated
        // as unknown → in-stock (matches lib/sarees.ts), only stock <= 0
        // is a real OOS. Removal is always allowed so items that went OOS
        // after being saved can still be cleared.
        if (!has) {
          const product = getProduct(productId);
          const stock = product?.stock;
          if (typeof stock === 'number' && stock <= 0) {
            pushToast({
              kind: 'wishlist-blocked',
              productId,
              message: `${productName(productId)} is out of stock`,
            });
            return s;
          }
        }
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
    [pushToast, getProduct],
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
    () =>
      state.cart.reduce(
        (sum, i) => (getProduct(i.productId) ? sum + i.quantity : sum),
        0,
      ),
    [state.cart, getProduct],
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
      stockLimitAlert,
      dismissStockLimit,
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
      stockLimitAlert,
      dismissStockLimit,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used inside <ShopProvider>');
  return ctx;
}
