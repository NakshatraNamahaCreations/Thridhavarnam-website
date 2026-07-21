'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi, getToken, setToken, clearToken, type BackendUser } from '@/lib/api';

// Storefront auth. Credentials are validated against the backend
// (`/api/auth/login` and `/api/auth/register`) and the resulting JWT is
// persisted in localStorage so the session survives reloads. The user
// object is re-fetched via `/api/auth/me` on boot to catch stale sessions.

export type AuthUser = {
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  dob?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  // Hydrated flips to true after the initial `/auth/me` round-trip (or
  // immediately if there's no token). Components that key UI off `user`
  // should also wait for `hydrated` to avoid a "Sign In" → "Account"
  // flash on first paint.
  hydrated: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobile?: string;
    dob?: string;
  }) => Promise<AuthUser>;
  signOut: () => void;
};

const Ctx = createContext<AuthContextValue | null>(null);

// Derive a friendly display name from an email when the user signs in
// without supplying one (sign-in form only asks for email + password).
// `john.doe@example.com` -> `John`.
export function deriveNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  const first = local.split(/[._-]/)[0] ?? local;
  if (!first) return 'Friend';
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

function toAuthUser(u: BackendUser): AuthUser {
  return {
    name: u.name,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    mobile: u.mobile,
    dob: u.dob,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = getToken();
    if (!token) {
      setHydrated(true);
      return;
    }
    authApi
      .me()
      .then((u) => {
        if (!cancelled) setUser(toAuthUser(u));
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token, user: u } = await authApi.login(email, password);
    setToken(token);
    const next = toAuthUser(u);
    setUser(next);
    return next;
  }, []);

  const register = useCallback(
    async (payload: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      mobile?: string;
      dob?: string;
    }) => {
      // Fire the backend request but don't persist the returned token —
      // the UX is "create account → sign in", so the user lands on the
      // login screen and enters their new credentials.
      const { user: u } = await authApi.register(payload);
      return toAuthUser(u);
    },
    [],
  );

  const signOut = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, hydrated, signIn, register, signOut }),
    [user, hydrated, signIn, register, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
