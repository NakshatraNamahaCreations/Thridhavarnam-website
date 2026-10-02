'use client';

import { useEffect, useState } from 'react';

// Floating "back to top" button. Appears after the user has scrolled past
// SHOW_AFTER_PX, anchored to the bottom-right of the viewport. Uses Lenis
// when available so the scroll feels consistent with the rest of the site.
//
// On product detail pages the StickyBuyBar (`data-sticky-buybar`) anchors
// to the same bottom edge. We watch for its presence + visibility and lift
// the BackToTop above it so the two never overlap.

const SHOW_AFTER_PX = 400;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [liftPx, setLiftPx] = useState(24); // bottom offset in px

  useEffect(() => {
    const sync = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);

      // 24px = base bottom-6.
      let lift = 24;

      // On product detail pages, the StickyBuyBar anchors to the bottom of
      // the viewport — lift above it so the two never overlap.
      const bar = document.querySelector(
        '[data-sticky-buybar][data-visible="1"]',
      ) as HTMLElement | null;
      if (bar) lift = Math.max(lift, bar.offsetHeight + 12);

      // Near the page bottom, the footer's legal row (Privacy / Terms /
      // copyright) scrolls into view. Lift above it so the floating
      // button never overlaps the legal text.
      const footerBottom = document.querySelector(
        '[data-footer-bottom]',
      ) as HTMLElement | null;
      if (footerBottom) {
        const rect = footerBottom.getBoundingClientRect();
        const viewportH = window.innerHeight;
        if (rect.top < viewportH) {
          // 12px breathing room above the legal row.
          lift = Math.max(lift, viewportH - rect.top + 12);
        }
      }

      setLiftPx(lift);
    };

    sync();
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);

    // The sticky bar flips its data-visible attribute as the page scrolls;
    // watch it directly so we re-measure even if the user is scrolling
    // through Lenis (which may coalesce scroll events).
    const mo = new MutationObserver(sync);
    mo.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-visible'],
      childList: true,
    });

    return () => {
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      mo.disconnect();
    };
  }, []);

  const handleClick = () => {
    if (typeof window === 'undefined') return;
    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.1 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      style={{ bottom: `${liftPx}px` }}
      // z-40 so it sits below the audio toggle (z-50) on the cinematic
      // pages where both could appear — and pointer-events:none when
      // hidden so it doesn't catch clicks meant for the page beneath.
      className={`fixed right-6 z-40 w-11 h-11 flex items-center justify-center bg-maroon-deep text-ivory border border-ink hover:bg-maroon hover:border-maroon transition-all duration-200 shadow-lg ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}
