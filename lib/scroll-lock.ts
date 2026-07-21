'use client';

import { useEffect } from 'react';

/**
 * Body scroll lock with reference counting + Lenis cooperation.
 *
 * The site uses Lenis (see components/SmoothScroll.tsx) for smooth wheel /
 * touch scrolling. Two non-obvious facts about Lenis 1.0.42:
 *
 *   1. `body.style.overflow = 'hidden'` is NOT enough. Lenis sets scrollTop
 *      on `document.documentElement` (html) directly, so locking body
 *      overflow does nothing to stop the page from moving.
 *
 *   2. `lenis.stop()` is WORSE than nothing for modal scroll — when stopped,
 *      Lenis's wheel handler still runs and calls preventDefault() on every
 *      wheel event globally. That kills native overflow:auto scrolling
 *      inside the popup body. Don't call stop().
 *
 * The actual fix Lenis ships for this is `data-lenis-prevent`: any element
 * in the wheel event's composedPath with that attribute makes Lenis bail
 * out BEFORE preventDefault, so the native scroll on the popup's
 * overflow:auto container works normally. We tag each modal's outermost
 * overlay element with `data-lenis-prevent`. Because modal overlays are
 * `fixed inset-0`, every wheel event while a modal is open passes through
 * the tagged overlay, so Lenis never drives the page underneath.
 *
 * This hook keeps the body `overflow: hidden` toggle as a belt-and-braces
 * for iOS Safari touch (where Lenis's touch path also respects
 * data-lenis-prevent, but the body overflow lock prevents stray
 * touchmove leak from rubber-banding the page).
 *
 * Reference counting: modals stack (cart drawer → checkout popup → address
 * modal). A simple save/restore in each modal would let the outermost
 * modal's cleanup restore overflow while inner modals are still up. The
 * counter ensures we only release when the last modal closes.
 */
let lockCount = 0;
let savedBodyOverflow = '';

function lock() {
  if (typeof window === 'undefined') return;
  if (lockCount === 0) {
    savedBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  lockCount += 1;
}

function unlock() {
  if (typeof window === 'undefined') return;
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount === 0) {
    document.body.style.overflow = savedBodyOverflow;
  }
}

/**
 * Locks body scroll while `active` is true; releases on cleanup or when
 * `active` flips back to false. Safe to nest across overlapping modals.
 *
 * The modal also needs `data-lenis-prevent` on its outer overlay so Lenis
 * doesn't preventDefault wheel events over the popup body.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}
