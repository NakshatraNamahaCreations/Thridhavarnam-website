'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type CheckoutModalContextValue = {
  open: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
};

const Ctx = createContext<CheckoutModalContextValue | null>(null);

export function CheckoutModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openCheckout = useCallback(() => setOpen(true), []);
  const closeCheckout = useCallback(() => setOpen(false), []);
  const value = useMemo(
    () => ({ open, openCheckout, closeCheckout }),
    [open, openCheckout, closeCheckout],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCheckoutModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCheckoutModal must be used inside CheckoutModalProvider');
  return ctx;
}
