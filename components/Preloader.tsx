'use client';

import { useEffect, useState } from 'react';

// The Preloader is now mounted only by the story page (app/page.tsx)
// when a first-time visitor sees the cinematic intro. It is no longer
// global — hard reloading any other page should NOT show a splash, only
// scroll the page to top (handled by SiteShell).
const DURATION_MS = 2200;
const FADE_MS = 500;

export default function Preloader() {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = 'hidden';
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const elapsed = t - start;
      const p = Math.min(1, elapsed / DURATION_MS);
      // Cubic ease-out so the bar zips early then settles — feels alive
      // rather than mechanical.
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased * 100);
      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setFading(true);
        setTimeout(() => {
          setDone(true);
          document.body.style.overflow = '';
        }, FADE_MS);
      }
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = '';
    };
  }, [mounted]);

  // Never unmount — even after fade completes. Returning null from this
  // component while GSAP/Lenis are mutating sibling DOM raised
  // `NotFoundError: Failed to execute 'insertBefore'` in React's
  // reconciler. Stay mounted, just become invisible and click-through.
  return (
    <div
      className="fixed inset-0 z-[200] bg-maroon-deep overflow-hidden transition-opacity"
      style={{
        transitionDuration: `${FADE_MS}ms`,
        opacity: !mounted ? 1 : fading ? 0 : 1,
        pointerEvents: done ? 'none' : 'auto',
        visibility: done ? 'hidden' : 'visible',
      }}
      aria-hidden
    >
      {/* Centre brand logo — cream variant for the dark preloader bg. */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <img
          src="/brand/cream-logo-vertical.svg"
          alt="Thridha Varnam"
          width={320}
          height={280}
          className="h-40 sm:h-48 md:h-64 lg:h-80 w-auto select-none"
          draggable={false}
        />
      </div>

      {/* Bottom progress bar — bumped to 5px and lifted a touch off the
          very edge so browser chrome / scrollbars don't clip it. */}
      <div className="absolute left-0 right-0 bottom-3 md:bottom-4 h-[5px] bg-white/15 mx-4 md:mx-6 rounded-full overflow-hidden">
        <div
          className="h-full transition-[width] duration-75 ease-out rounded-full"
          style={{
            width: `${progress}%`,
            background:
              'linear-gradient(90deg, #0E4D5C 0%, #1E1B3A 18%, #75001F 38%, #E0AE6D 58%, #F2C99E 78%, #E0AE6D 100%)',
          }}
        />
      </div>
    </div>
  );
}
