'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import AudioToggle from '@/components/AudioToggle';
import BackToTop from '@/components/BackToTop';
import LoginModal from '@/components/auth/LoginModal';
import AddressModal from '@/components/checkout/AddressModal';
import CartDrawer from '@/components/shop/CartDrawer';
import CheckoutPopup from '@/components/checkout/CheckoutPopup';
import { LoginModalProvider } from '@/lib/login-modal';
import { AddressProvider } from '@/lib/addresses';
import { OrdersProvider } from '@/lib/orders';
import { CartDrawerProvider } from '@/lib/cart-drawer';
import { CheckoutModalProvider } from '@/lib/checkout-modal';

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Disable the browser's automatic scroll restoration once on mount —
  // we drive scroll position ourselves below. history.scrollRestoration
  // = 'manual' prevents the browser from "remembering" where you were on
  // a page when you return to it via back/forward.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Scroll to top on every route change. Without this, navigating from a
  // mid-scroll position on page A to page B (via a <Link>) leaves the
  // visitor halfway down page B — Lenis holds the previous scroll value
  // and Next.js's default scroll-to-top doesn't cover smooth-scroll
  // libraries. We call lenis.scrollTo(0, { immediate: true }) when the
  // smooth-scroll instance is mounted, and fall back to a plain
  // window.scrollTo otherwise.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  // Both the story page (/) and the journey long-read (/journey) are
  // self-contained cinematic experiences that end with their own closing
  // panel — no global nav and no footer.
  const immersive = pathname === '/' || pathname === '/journey';
  const showFooter = !immersive;
  // Nav stacks promo strip (~34px) + main row (logo + py-2) + weaves sub-row
  // (~32px, md+ only — hidden on mobile so the hamburger owns nav there).
  //   base:  34 + 64           ≈  98 → pt-[108px]
  //   sm:    34 + 72           ≈ 106 → pt-[116px]
  //   md:    34 + 80 + 32      ≈ 146 → pt-[160px]
  //   lg:    34 + 96 + 32      ≈ 162 → pt-[176px]
  // `bg-ivory no-pattern` paints the spacer strip between the fixed nav
  // and a page's first section as plain cream.
  const mainClass = immersive
    ? ''
    : 'pt-[108px] sm:pt-[116px] md:pt-[160px] lg:pt-[176px] bg-ivory no-pattern';

  return (
    <LoginModalProvider>
      <AddressProvider>
        <OrdersProvider>
        <CartDrawerProvider>
          <CheckoutModalProvider>
            <Nav />
            <main className={mainClass}>{children}</main>
            {showFooter && <Footer />}
            <AudioToggle />
            {!immersive && <BackToTop />}
            <LoginModal />
            <CartDrawer />
            <CheckoutPopup />
            <AddressModal />
          </CheckoutModalProvider>
        </CartDrawerProvider>
        </OrdersProvider>
      </AddressProvider>
    </LoginModalProvider>
  );
}
