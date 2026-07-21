'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import AnimatedSearchBar from '@/components/AnimatedSearchBar';
import PromoStrip from '@/components/PromoStrip';
import { useShop } from '@/lib/shop-store';
import { useCartDrawer } from '@/lib/cart-drawer';
import { useScrollLock } from '@/lib/scroll-lock';
import AccountMenu from '@/components/auth/AccountMenu';

// Left section nav — tier categories. Plain English labels only.
const sectionLinks = [
  { href: '/shop?tier=bridal', label: 'Bridal' },
  { href: '/shop?tier=festive', label: 'Festive' },
  { href: '/shop?tier=everyday', label: 'Everyday' },
];

// Sub-row — the weaves
const weaveLinks = [
  { href: '/home', label: 'Home' },
  { href: '/shop', label: 'New In', accent: 'maroon' },
  { href: '/shop?weave=Kanjivaram', label: 'Kanjeevaram' },
  { href: '/shop?weave=Banarasi', label: 'Banarasi' },
  { href: '/shop?weave=Mysore+Silk', label: 'Mysore Silk' },
  { href: '/shop?weave=Mangalagiri', label: 'Mangalagiri' },
  { href: '/shop?weave=Pochampally', label: 'Pochampally' },
  { href: '/shop?weave=Gadwal', label: 'Gadwal' },
  { href: '/shop?weave=Patola', label: 'Patola' },
  { href: '/shop?weave=Fancy+Sarees', label: 'Fancy Sarees' },
  { href: '/shop?weave=Mixed+Pattu+Sarees', label: 'Mixed Pattu Sarees' },
  { href: '/shop?sale=1', label: 'Sale', accent: 'box' },
];

// Active-link detection. A link is active when the current path matches
// its base path AND every query param the link declares is present (with
// the same value) in the current URL. For "New In" (/shop with no params)
// we additionally require that no weave/sale/tier param is set —
// otherwise it would light up on every shop view alongside the actual
// category.
//
// `params` is nullable: during static prerender we render the navbar
// shell without resolved search params, so no link is "active" in the
// HTML. After hydration the real params arrive and the active highlight
// applies — same DOM, just re-rendered.
function isLinkActive(
  href: string,
  pathname: string,
  params: URLSearchParams | null,
): boolean {
  if (!params) return false;
  const [path, query] = href.split('?');
  if (pathname !== path) return false;
  const linkParams = new URLSearchParams(query ?? '');
  for (const [k, v] of linkParams) {
    if (params.get(k) !== v) return false;
  }
  if (linkParams.toString() === '' && path === '/shop') {
    if (params.get('weave') || params.get('sale') || params.get('tier')) {
      return false;
    }
  }
  return true;
}

// Static prerender (`next build` with output:'export') requires every
// component that calls useSearchParams() to sit inside a <Suspense>
// boundary. Previously the fallback was `null` — which meant the navbar
// was completely missing from the prerendered HTML and only appeared
// once the client JS hydrated. On a slow first paint that read as
// "navbar loading 40s late".
//
// Now the fallback renders the navbar *shell* (no active link
// highlights) so the bar is present in the static HTML and visible
// instantly. After hydration the searchParams resolve and NavInner
// re-renders with active state.
export default function Nav() {
  return (
    <Suspense fallback={<NavInner searchParams={null} />}>
      <NavWithSearchParams />
    </Suspense>
  );
}

function NavWithSearchParams() {
  const searchParams = useSearchParams();
  return <NavInner searchParams={searchParams} />;
}

function NavInner({ searchParams }: { searchParams: URLSearchParams | null }) {
  const pathname = usePathname();
  // Self-contained cinematic pages have no nav — they own the whole viewport
  // and supply their own exit CTAs in the closing panel.
  const isImmersive = pathname === '/' || pathname === '/journey';
  const { cartCount, wishlistCount, hydrated } = useShop();
  const { openCart } = useCartDrawer();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change so a tap-through link doesn't leave it open.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll (Lenis-aware — see lib/scroll-lock.ts) and listen for
  // Escape while the mobile drawer is open. The overlay carries
  // `data-lenis-prevent` so Lenis releases wheel/touch events to the
  // drawer's own scrollable container.
  useScrollLock(menuOpen);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // One-shot animation triggers for the bag + heart icons whenever their
  // count increases. We snapshot the previous count in a ref, compare on
  // every render, and flip a short-lived flag that drives a CSS keyframe.
  const prevCart = useRef(0);
  const prevWishlist = useRef(0);
  const [bagPulse, setBagPulse] = useState(false);
  const [heartPulse, setHeartPulse] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      prevCart.current = cartCount;
      prevWishlist.current = wishlistCount;
      return;
    }
    if (cartCount > prevCart.current) {
      setBagPulse(true);
      const t = window.setTimeout(() => setBagPulse(false), 600);
      prevCart.current = cartCount;
      return () => window.clearTimeout(t);
    }
    prevCart.current = cartCount;
  }, [cartCount, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      prevWishlist.current = wishlistCount;
      return;
    }
    if (wishlistCount > prevWishlist.current) {
      setHeartPulse(true);
      const t = window.setTimeout(() => setHeartPulse(false), 750);
      prevWishlist.current = wishlistCount;
      return () => window.clearTimeout(t);
    }
    prevWishlist.current = wishlistCount;
  }, [wishlistCount, hydrated]);

  if (isImmersive) return null;

  return (
    <header
      className={clsx(
        'fixed top-0 inset-x-0 z-40 transition-shadow duration-300 bg-ivory no-pattern',
        scrolled && 'shadow-[0_1px_0_rgba(77,0,21,0.08)]',
      )}
    >
      {/* Top promo strip — rotating Kalki-style announcement */}
      <PromoStrip />

      {/* Main row — CSS grid with 1fr / auto / 1fr columns so the logo
          sits at the true centre. `flex-1` on the sides only balances
          EXTRA space, so the wider right side (search + 3 icons) was
          pulling the logo off-centre. Grid 1fr columns are equal width
          regardless of content. */}
      <div className="border-b border-ink/10">
        <div className="max-w-[1720px] mx-auto px-6 lg:px-10 py-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
          {/* Left: section links + find store. */}
          <div className="flex items-center gap-6 min-w-0">
            <nav className="hidden lg:flex items-center gap-6">
              {sectionLinks.map((l) => {
                const active = isLinkActive(l.href, pathname, searchParams);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? 'page' : undefined}
                    className={clsx(
                      'text-sm font-medium tracking-[0.14em] uppercase whitespace-nowrap transition-colors',
                      active ? 'text-maroon' : 'text-ink hover:text-maroon',
                    )}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
            <Link
              href="/shipping"
              className="group hidden xl:flex items-center gap-1.5 text-sm text-ink hover:text-maroon transition-colors whitespace-nowrap leading-none"
            >
              <span className="inline-flex transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110">
                <IconStore />
              </span>
              <span>Find a Store</span>
            </Link>
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="group lg:hidden text-ink p-1 -ml-1"
            >
              <span className="inline-flex transition-transform duration-300 ease-out group-hover:scale-110">
                {menuOpen ? <IconClose /> : <IconMenu />}
              </span>
            </button>
          </div>

          {/* Centre: brand logo from the official kit. SVG (not PNG) so
              the lockup stays crisp on retina displays and at any size.
              Vertical lockup — mark stacked above wordmark + tagline. */}
          <Link
            href="/home"
            aria-label="Thridha Varnam — home"
            className="flex items-center shrink-0 group px-2 sm:px-4"
          >
            <img
              src="/brand/nav.png"
              alt="Thridha Varnam"
              className="h-12 sm:h-14 md:h-16 lg:h-20 w-auto select-none transition-opacity group-hover:opacity-85"
              draggable={false}
            />
          </Link>

          {/* Right: search + icons. justify-end keeps icons at far edge;
              search bar is constrained so it doesn't dwarf the wordmark.
              Search bar is lg+ only — below that the right column gets
              cramped (icons + tiny search box truncates the placeholder).
              On md/sm/mobile the hamburger drawer carries search. */}
          <div className="flex items-center justify-end gap-3 min-w-0">
            <div className="hidden lg:block flex-1 max-w-sm">
              <AnimatedSearchBar />
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              <AccountMenu />
              <Link
                href="/shop?wishlist=1"
                aria-label={`Wishlist (${hydrated ? wishlistCount : 0} items)`}
                className="group relative p-2 text-ink hover:text-maroon transition-colors"
              >
                <span
                  className={clsx(
                    'inline-flex transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110 origin-center',
                    heartPulse && 'animate-icon-heartbeat',
                  )}
                >
                  <IconHeart
                    className={clsx(
                      'transition-[fill,stroke] duration-300',
                      hydrated && wishlistCount > 0
                        ? 'fill-maroon stroke-maroon'
                        : 'fill-transparent group-hover:fill-maroon/15',
                    )}
                  />
                </span>
                {hydrated && wishlistCount > 0 && (
                  <span
                    key={`wishlist-${wishlistCount}`}
                    className="absolute top-0.5 right-0.5 bg-maroon text-ivory text-[0.55rem] leading-none rounded-full min-w-4 h-4 px-1 flex items-center justify-center font-bold animate-badge-pop"
                  >
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={openCart}
                aria-label={`Bag (${hydrated ? cartCount : 0} items)`}
                className="group relative p-2 text-ink hover:text-maroon transition-colors"
              >
                <span
                  className={clsx(
                    'inline-flex transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110 origin-bottom',
                    bagPulse && 'animate-icon-bounce',
                  )}
                >
                  <IconBag />
                </span>
                <span
                  key={`cart-${hydrated ? cartCount : 0}`}
                  className="absolute top-0.5 right-0.5 bg-maroon text-ivory text-[0.55rem] leading-none rounded-full min-w-4 h-4 px-1 flex items-center justify-center font-bold animate-badge-pop"
                >
                  {hydrated ? (cartCount > 99 ? '99+' : cartCount) : 0}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/tablet search row — full-width search below the main row.
          Hidden at lg+ where the inline search lives in the right column.
          Avoids burying search inside the hamburger drawer where most
          shoppers won't look for it. */}
      <div className="lg:hidden border-b border-ink/10">
        <div className="max-w-[1720px] mx-auto px-6 py-2">
          <AnimatedSearchBar />
        </div>
      </div>

      {/* Mobile drawer — slides in from the left. Holds the section
          tiers + every weave link + Find a Store + search, since all of
          those are hidden in the top bar at sub-md widths. Surface is
          brand maroon (deep variant) so the drawer reads as a brand
          chamber rather than a generic dark overlay. */}
      <div
        className={clsx(
          'fixed inset-0 z-50 lg:hidden transition-opacity duration-300',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        aria-hidden={!menuOpen}
        data-lenis-prevent
      >
        <div
          className="absolute inset-0 bg-black/55"
          onClick={() => setMenuOpen(false)}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className={clsx(
            'absolute top-0 left-0 h-full w-[86%] max-w-[340px] bg-maroon-deep text-ivory shadow-2xl flex flex-col transition-transform duration-300 ease-out',
            menuOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-ivory/10 shrink-0">
            <span className="text-[0.75rem] tracking-[0.3em] uppercase text-gold-soft font-semibold">
              Menu
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="w-9 h-9 flex items-center justify-center text-ivory/85 hover:text-ivory transition-colors"
            >
              <IconClose />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="text-[0.72rem] tracking-[0.3em] uppercase text-ivory/55 font-semibold mb-3">
              Shop by occasion
            </div>
            <nav className="flex flex-col mb-7">
              {sectionLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-base font-semibold tracking-wide uppercase text-ivory py-2.5 border-b border-ivory/10 hover:text-gold transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="text-[0.72rem] tracking-[0.3em] uppercase text-ivory/55 font-semibold mb-3">
              Shop by weave
            </div>
            <nav className="flex flex-col mb-7">
              {weaveLinks.map((w) => {
                const active = isLinkActive(w.href, pathname, searchParams);
                return (
                  <Link
                    key={w.href + w.label}
                    href={w.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={clsx(
                      'text-sm tracking-[0.1em] uppercase py-2 border-b border-ivory/10 transition-colors',
                      active
                        ? 'text-gold font-bold bg-ivory/[0.06] -mx-5 px-5'
                        : w.accent === 'maroon'
                        ? 'text-gold font-semibold'
                        : 'text-ivory/90 hover:text-gold',
                    )}
                  >
                    {w.label}
                  </Link>
                );
              })}
            </nav>

            <Link
              href="/shipping"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center gap-2 text-sm text-ivory/85 hover:text-gold transition-colors"
            >
              <IconStore />
              Find a Store
            </Link>
          </div>
        </aside>
      </div>

      {/* Sub-row — weaves. Hidden on mobile (the hamburger menu carries
          these links on small screens; rendering them here forces a tight
          horizontally-scrolling strip that reads as cramped). */}
      <div className="hidden md:block border-b border-ink/10">
        <div className="max-w-[1720px] mx-auto px-6 lg:px-10">
          <div className="flex items-center [justify-content:safe_center] gap-3 lg:gap-5 py-2 overflow-x-auto no-scrollbar">
            {weaveLinks.map((w) => {
              const active = isLinkActive(w.href, pathname, searchParams);
              const cls =
                w.accent === 'box'
                  ? clsx(
                      'px-2.5 py-1 text-ivory font-semibold',
                      active ? 'bg-maroon' : 'bg-maroon-deep hover:bg-maroon',
                    )
                  : active
                  ? 'text-maroon font-semibold'
                  : w.accent === 'maroon'
                  ? 'text-gold-deep font-semibold hover:text-maroon'
                  : 'text-ink/90 hover:text-maroon font-medium';
              return (
                <Link
                  key={w.href + w.label}
                  href={w.href}
                  aria-current={active ? 'page' : undefined}
                  className={clsx(
                    'relative text-[0.72rem] tracking-[0.12em] uppercase transition-colors whitespace-nowrap',
                    cls,
                  )}
                >
                  {w.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

/* — Icons — */

function IconStore() {
  // Kalki-style storefront — peaked roof + square body + central door.
  // viewBox extended slightly so the roof peak doesn't get cropped.
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 11 12 3l9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

function IconHeart({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M20.8 6.6a5.5 5.5 0 0 0-9-1.7l-.8.8-.8-.8a5.5 5.5 0 1 0-7.8 7.8l8.6 8.5 8.6-8.5a5.5 5.5 0 0 0 1.2-6.1Z" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 7h14l-1 14H6L5 7Z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6l-12 12" />
    </svg>
  );
}
