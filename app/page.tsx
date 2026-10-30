'use client';

import { useEffect, useState } from 'react';
import HeritageScroll from '@/components/intro/HeritageScroll';
import Preloader from '@/components/Preloader';
import { useAudio } from '@/components/AudioProvider';
import { storefrontInitApi, productsApi, cloudinaryUrl } from '@/lib/api';

// Matches TOKEN_KEY in lib/api.ts — reading it directly here (instead of
// going through useAuth) lets us decide before AuthProvider finishes its
// own hydration, so the brief flash of maroon stays as short as possible.
const AUTH_TOKEN_KEY = 'tridha-token';

/**
 * Story page (root).
 *
 * The cinematic intro plays on every entry — Preloader → HeritageScroll →
 * EnterAtelier — except when a signed-in visitor arrives, in which case
 * we send them straight to /home. Append `?intro=1` to force the intro
 * even when signed in (useful for sharing / previewing).
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
    const signedIn = !!window.localStorage.getItem(AUTH_TOKEN_KEY);
    if (signedIn && !force) {
      window.location.replace('/home');
      return;
    }
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
