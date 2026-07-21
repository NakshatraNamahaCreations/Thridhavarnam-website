'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth';
import { useLoginModal } from '@/lib/login-modal';

// Shared chrome for the /account/* section — sidebar (user card + nav)
// on the left, content slot on the right. The same layout component is
// reused by every account page so the active nav highlight is consistent.
//
// Auth gate: routes under /account/* are visitor-only. If the auth
// provider has hydrated and there is no user, we bounce back to /home
// and open the login modal so they can sign in from there.

const NAV = [
  { href: '/account', label: 'Account Details', icon: <IconUser /> },
  { href: '/account/orders', label: 'Orders', icon: <IconBox /> },
  { href: '/account/addresses', label: 'Addresses', icon: <IconPin /> },
  { href: '/shop?wishlist=1', label: 'Wishlist', icon: <IconHeart /> },
];

export default function AccountShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hydrated, signOut } = useAuth();
  const { openLogin } = useLoginModal();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace('/home');
      openLogin();
    }
  }, [hydrated, user, router, openLogin]);

  if (!hydrated || !user) {
    return <div className="min-h-screen bg-ivory" />;
  }

  return (
    <div className="bg-ivory min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-10">
          {/* Sidebar */}
          <aside>
            <div className="border border-ink/10 bg-white p-5">
              <div className="text-base font-semibold text-ink truncate">
                {user.name}
              </div>
              <div className="mt-0.5 text-xs text-ink/60 truncate">
                {user.email}
              </div>
            </div>

            <nav className="mt-4 border border-ink/10 bg-white">
              {NAV.map((item) => {
                const active = matchesActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 text-sm border-b border-ink/5 last:border-b-0 transition-colors',
                      active
                        ? 'bg-ink/5 text-ink font-semibold'
                        : 'text-ink/80 hover:bg-ink/5 hover:text-ink',
                    )}
                  >
                    <span className="text-ink/55 shrink-0">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    <span className="text-ink/40">›</span>
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-ink/80 hover:bg-ink/5 hover:text-ink transition-colors text-left"
              >
                <span className="text-ink/55 shrink-0">
                  <IconSignOut />
                </span>
                <span className="flex-1">Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Content */}
          <main>
            <h1 className="text-2xl md:text-[1.75rem] font-semibold text-ink">
              {title}
            </h1>
            <div className="mt-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function matchesActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  // /shop?wishlist=1 lives outside the account section — don't highlight it
  // based on the bare pathname matching the link target.
  if (href.startsWith('/shop')) return false;
  if (href === '/account') return pathname === '/account';
  return pathname === href || pathname.startsWith(href + '/');
}

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
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
