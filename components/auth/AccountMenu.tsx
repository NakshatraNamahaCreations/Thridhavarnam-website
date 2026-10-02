'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useLoginModal } from '@/lib/login-modal';

/**
 * AccountMenu — the user icon in the nav.
 *
 * Signed out: a single button that opens the LoginModal (sign-in / sign-up).
 * Signed in: the same icon becomes the trigger for a dropdown showing
 * "Welcome <FirstName>!", Account Details, Order History, Wishlist, Sign Out.
 *
 * Until the auth provider has hydrated we render the signed-out variant so
 * the initial server-rendered HTML matches what the client paints — no
 * "Sign In flashes then becomes Account" flicker on hard reload.
 */
export default function AccountMenu() {
  const { user, hydrated, signOut } = useAuth();
  const { openLogin } = useLoginModal();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click / Escape so the menu behaves like a real popover.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const signedIn = hydrated && user !== null;

  if (!signedIn) {
    return (
      <button
        type="button"
        onClick={() => openLogin()}
        aria-label="Account · login or sign up"
        className="group p-2 text-ink hover:text-maroon transition-colors"
      >
        <span className="inline-flex transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110 origin-center">
          <IconUser />
        </span>
      </button>
    );
  }

  const firstName = user!.name.split(' ')[0] || user!.name;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user!.name}`}
        className="group relative p-2 text-ink hover:text-maroon transition-colors"
      >
        <span
          className={`inline-flex transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110 origin-center ${
            open ? 'text-maroon scale-110 -translate-y-0.5' : ''
          }`}
        >
          <IconUser />
        </span>
        {/* Signed-in dot — quiet peacock indicator that pulses on first
            paint, then stays as a static presence chip. */}
        <span
          aria-hidden
          className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-peacock animate-badge-pop"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-60 bg-ivory no-pattern border border-ink/10 shadow-lg py-2 z-50 origin-top-right animate-menu-in"
        >
          <div className="px-4 py-3 text-base text-ink">
            Welcome {firstName}!
          </div>

          <MenuItem href="/account" onClick={() => setOpen(false)} icon={<IconCard />}>
            Account Details
          </MenuItem>
          <MenuItem
            href="/account/orders"
            onClick={() => setOpen(false)}
            icon={<IconBox />}
          >
            Orders
          </MenuItem>
          <MenuItem
            href="/account/addresses"
            onClick={() => setOpen(false)}
            icon={<IconPin />}
          >
            Addresses
          </MenuItem>
          <MenuItem
            href="/shop?wishlist=1"
            onClick={() => setOpen(false)}
            icon={<IconHeart />}
          >
            Wishlist
          </MenuItem>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="w-full px-4 py-2.5 text-sm text-ink hover:bg-ink/5 transition-colors text-left"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  onClick,
  icon,
  children,
}: {
  href: string;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-ink/5 transition-colors"
    >
      <span className="text-ink/55">{icon}</span>
      {children}
    </Link>
  );
}

function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function IconCard() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 7.5 12 3l9 4.5v9L12 21 3 16.5v-9Z" />
      <path d="M3 7.5 12 12l9-4.5M12 12v9" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.8 6.6a5.5 5.5 0 0 0-9-1.7l-.8.8-.8-.8a5.5 5.5 0 1 0-7.8 7.8l8.6 8.5 8.6-8.5a5.5 5.5 0 0 0 1.2-6.1Z" />
    </svg>
  );
}

function IconSignOut() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 17l5-5-5-5" />
      <path d="M20 12H9" />
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    </svg>
  );
}
