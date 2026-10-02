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
import { useAuth } from './auth';

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  // Optional metadata used by the /account/addresses UI.
  label?: string;
  isDefault?: boolean;
};

export type AddressInput = Omit<Address, 'id'>;

type AddressState = {
  addresses: Address[];
  selectedId: string | null;
};

type AddressContextValue = AddressState & {
  hydrated: boolean;
  selected: Address | null;

  // Modal
  modalOpen: boolean;
  modalNextRoute: string | null;
  openAddressModal: (nextRoute?: string) => void;
  closeAddressModal: () => void;

  // Data
  addAddress: (input: AddressInput) => Address;
  updateAddress: (id: string, patch: Partial<AddressInput>) => void;
  removeAddress: (id: string) => void;
  selectAddress: (id: string) => void;
  makeDefault: (id: string) => void;
};

const STORAGE_PREFIX = 'tridhavarnam-addresses-v1';
const Ctx = createContext<AddressContextValue | null>(null);

// Per-user storage key. Falls back to `:guest` before the auth state
// hydrates or when the user is signed out — those addresses are only
// used by the guest checkout flow, they never leak into a signed-in
// account's book.
function storageKeyFor(email: string | null): string {
  const scope = email ? email.toLowerCase() : 'guest';
  return `${STORAGE_PREFIX}:${scope}`;
}

function readStorage(key: string): AddressState {
  if (typeof window === 'undefined') return { addresses: [], selectedId: null };
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return { addresses: [], selectedId: null };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { addresses: [], selectedId: null };
    return {
      addresses: Array.isArray(parsed.addresses) ? parsed.addresses : [],
      selectedId: typeof parsed.selectedId === 'string' ? parsed.selectedId : null,
    };
  } catch {
    return { addresses: [], selectedId: null };
  }
}

let nextId = 0;
const genId = () => {
  nextId += 1;
  return `addr-${Date.now().toString(36)}-${nextId}`;
};

export function AddressProvider({ children }: { children: ReactNode }) {
  const { user, hydrated: authHydrated } = useAuth();
  const [state, setState] = useState<AddressState>({ addresses: [], selectedId: null });
  const [hydrated, setHydrated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNextRoute, setModalNextRoute] = useState<string | null>(null);

  const storageKey = useMemo(
    () => storageKeyFor(user?.email ?? null),
    [user?.email],
  );

  // Re-read storage whenever the active user changes (login, logout, or
  // account switch). This is the mechanism that keeps each account's
  // address book isolated.
  useEffect(() => {
    if (!authHydrated) return;
    setState(readStorage(storageKey));
    setHydrated(true);
  }, [authHydrated, storageKey]);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // localStorage full / disabled — silent
    }
  }, [state, hydrated, storageKey]);

  // Cross-tab sync — only mirror events for the current user's key.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) return;
      setState(readStorage(storageKey));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey]);

  const openAddressModal = useCallback((nextRoute?: string) => {
    setModalNextRoute(nextRoute ?? null);
    setModalOpen(true);
  }, []);

  const closeAddressModal = useCallback(() => {
    setModalOpen(false);
    setModalNextRoute(null);
  }, []);

  const addAddress = useCallback((input: AddressInput) => {
    const next: Address = { ...input, id: genId() };
    setState((s) => {
      const wantsDefault = next.isDefault || s.addresses.length === 0;
      const others = wantsDefault
        ? s.addresses.map((a) => ({ ...a, isDefault: false }))
        : s.addresses;
      return {
        addresses: [...others, { ...next, isDefault: wantsDefault }],
        selectedId: next.id,
      };
    });
    return next;
  }, []);

  const updateAddress = useCallback((id: string, patch: Partial<AddressInput>) => {
    setState((s) => {
      const makingDefault = patch.isDefault === true;
      const addresses = s.addresses.map((a) => {
        if (a.id === id) return { ...a, ...patch };
        return makingDefault ? { ...a, isDefault: false } : a;
      });
      return { ...s, addresses };
    });
  }, []);

  const removeAddress = useCallback((id: string) => {
    setState((s) => {
      const addresses = s.addresses.filter((a) => a.id !== id);
      const selectedId =
        s.selectedId === id ? (addresses[0]?.id ?? null) : s.selectedId;
      return { addresses, selectedId };
    });
  }, []);

  const selectAddress = useCallback((id: string) => {
    setState((s) => ({ ...s, selectedId: id }));
  }, []);

  const makeDefault = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      addresses: s.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
    }));
  }, []);

  const selected = useMemo(
    () => state.addresses.find((a) => a.id === state.selectedId) ?? null,
    [state.addresses, state.selectedId],
  );

  const value = useMemo<AddressContextValue>(
    () => ({
      addresses: state.addresses,
      selectedId: state.selectedId,
      selected,
      hydrated,
      modalOpen,
      modalNextRoute,
      openAddressModal,
      closeAddressModal,
      addAddress,
      updateAddress,
      removeAddress,
      selectAddress,
      makeDefault,
    }),
    [
      state.addresses,
      state.selectedId,
      selected,
      hydrated,
      modalOpen,
      modalNextRoute,
      openAddressModal,
      closeAddressModal,
      addAddress,
      updateAddress,
      removeAddress,
      selectAddress,
      makeDefault,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAddresses() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAddresses must be used inside <AddressProvider>');
  return ctx;
}
