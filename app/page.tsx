'use client';

import { useEffect } from 'react';
import HeritageScroll from '@/components/intro/HeritageScroll';
import Preloader from '@/components/Preloader';
import { useAudio } from '@/components/AudioProvider';

/**
 * Story page (root).
 *
 * The cinematic intro plays on EVERY visit — no seen-check, no redirect.
 * Preloader (~2.2s splash) → HeritageScroll (six pinned panels) →
 * EnterAtelier (closing CTA). Both CTAs hard-navigate to /home or
 * /shop via window.location.assign — client-side reconciliation between
 * this pinned/scroll-triggered page and another route was throwing
 * `NotFoundError: Failed to execute 'insertBefore'` because GSAP +
 * Lenis mutate the DOM out from under React.
 *
 * Rendering is intentionally non-conditional — the tree is mounted on
 * the very first paint and never swapped, since render-tree swaps in a
 * GSAP/Lenis-mutated DOM raise the same insertBefore error.
 */
export default function StoryPage() {
  const { markEntered } = useAudio();

  useEffect(() => {
    // HeritageScroll and EnterAtelier gate their ScrollTrigger setup on
    // `unlocked`. Flip it here so the pinned long-scroll wires up while
    // the Preloader is still on top.
    markEntered();
  }, [markEntered]);

  return (
    <>
      <Preloader />
      <HeritageScroll />
    </>
  );
}
