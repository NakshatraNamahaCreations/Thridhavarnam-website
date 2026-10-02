'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

type LoginModalContextValue = {
  open: boolean;
  // Open the login modal. An optional onSuccess callback fires after the
  // user successfully signs in or signs up — used to resume an action
  // that was interrupted by the auth gate (e.g. "open checkout" after
  // login completes).
  openLogin: (onSuccess?: () => void) => void;
  // Dismissal — closes the modal AND drops any pending success action so
  // it doesn't fire later. Called from the X button, ESC, backdrop click.
  closeLogin: () => void;
  // Called by LoginModal after the success animation finishes. Closes the
  // modal AND fires the pending action so the user lands back on the
  // checkout / wherever they were heading.
  loginSucceeded: () => void;
};

const Ctx = createContext<LoginModalContextValue | null>(null);

export function LoginModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  // Stored in a ref (not state) so the callbacks below don't recreate on
  // every action change — pendingAction is consumed exactly once.
  const pendingActionRef = useRef<(() => void) | null>(null);

  const openLogin = useCallback((onSuccess?: () => void) => {
    // Guard against callers wiring this straight to onClick — React would
    // otherwise hand us a SyntheticEvent as `onSuccess` and we'd try to
    // call it later.
    pendingActionRef.current = typeof onSuccess === 'function' ? onSuccess : null;
    setOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    setOpen(false);
    pendingActionRef.current = null;
  }, []);

  const loginSucceeded = useCallback(() => {
    setOpen(false);
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    if (typeof action === 'function') action();
  }, []);

  const value = useMemo(
    () => ({ open, openLogin, closeLogin, loginSucceeded }),
    [open, openLogin, closeLogin, loginSucceeded],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLoginModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLoginModal must be used inside LoginModalProvider');
  return ctx;
}
