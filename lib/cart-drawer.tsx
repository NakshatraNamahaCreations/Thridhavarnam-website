'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type CartDrawerContextValue = {
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const Ctx = createContext<CartDrawerContextValue | null>(null);

export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, openCart, closeCart }), [open, openCart, closeCart]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCartDrawer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCartDrawer must be used inside CartDrawerProvider');
  return ctx;
}
