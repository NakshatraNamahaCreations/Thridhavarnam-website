'use client';

import { useEffect, useState } from 'react';
import HeritageScroll from '@/components/intro/HeritageScroll';
import Preloader from '@/components/Preloader';
import { useAudio } from '@/components/AudioProvider';
import { storefrontInitApi, productsApi, cloudinaryUrl } from '@/lib/api';

const INTRO_SEEN_KEY = 'thv_intro_seen';

/**
 * Story page (root).
 *
 * Returning visitors are redirected to /home immediately — the full
 * Preloader → HeritageScroll → EnterAtelier flow only plays on the
 * first visit. Append `?intro=1` to force a replay.
 *
 * Rendering of the intro tree is one-way: once we decide to show it,
 * we never swap it back out, because GSAP + Lenis mutate the DOM and a
 * render-tree swap mid-animation throws `NotFoundError: Failed to execute
 * 'insertBefore'` in React's reconciler.
 */
export default function StoryPage() {
  const { markEntered } = useAudio();
  const [showIntro, setShowIntro] = useState(false);
  const [decided, setDecided] = useState(false);

  useEffect(() => {
    const force = new URLSearchParams(window.location.search).get('intro') === '1';
    const seen = window.localStorage.getItem(INTRO_SEEN_KEY) === '1';
    if (seen && !force) {
      window.location.replace('/home');
      return;
    }
    // Stamp the flag now so an abandoned intro still counts as seen —
    // a return visit shouldn't force the full scroll a second time.
    try {
      window.localStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {}
    setShowIntro(true);
    setDecided(true);
  }, []);

  useEffect(() => {
    if (!showIntro) return;
    // HeritageScroll and EnterAtelier gate their ScrollTrigger setup on
    // `unlocked`. Flip it here so the pinned long-scroll wires up while
    // the Preloader is still on top.
    markEntered();
  }, [markEntered, showIntro]);

  useEffect(() => {
    if (!showIntro) return;
    // Fire both fetches in parallel so the combined wait is max(init, products)
    // instead of init + products. Cache is warmed while the user watches the
    // intro (~2-3 s), so /home gets instant cache hits on the same URLs.
    Promise.all([storefrontInitApi.get(), productsApi.list()])
      .then(([init]) => {
        const heroBanners = init.banners.filter(
          (b) => (!b.type || b.type === 'hero') && b.active !== false && b.image,
        );
        for (const banner of heroBanners) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = cloudinaryUrl(banner.image as string);
          link.setAttribute('fetchpriority', 'high');
          document.head.appendChild(link);
        }
      })
      .catch(() => {});
  }, [showIntro]);

  // Until the client-side decision runs, render only the maroon field
  // that matches the Preloader background — a redirected returning
  // visitor sees a solid colour, not a flash of the pinned panels.
  if (!decided) {
    return <div className="fixed inset-0 z-[200] bg-maroon-deep" aria-hidden />;
  }

  if (!showIntro) return null;

  return (
    <>
      <Preloader />
      <HeritageScroll />
    </>
  );
}
