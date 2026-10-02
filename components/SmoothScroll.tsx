'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Minimal type so other modules can call window.__lenis without importing Lenis.
declare global {
  interface Window {
    __lenis?: {
      scrollTo(target: number, opts?: Record<string, unknown>): void;
      stop(): void;
      start(): void;
      on(event: string, cb: () => void): void;
      off(event: string, cb: () => void): void;
      raf(time: number): void;
      destroy(): void;
    };
  }
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  // Reset scroll to top on route change. We check window.__lenis first
  // because Lenis owns the scroll position on pages where it's active.
  const pathname = usePathname();

  useEffect(() => {
    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [pathname]);

  useEffect(() => {
    // GSAP (~600KB) and Lenis (~50KB) are loaded dynamically so they are
    // NOT included in the main layout bundle that loads on every route.
    // They arrive in a separate async chunk after the page has painted.
    let destroyed = false;
    let teardown: (() => void) | undefined;

    void (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('@studio-freight/lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (destroyed) return;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        duration: 1.6,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.7,
        touchMultiplier: 1.2,
      });

      window.__lenis = lenis;

      const onScroll = () => ScrollTrigger.update();
      lenis.on('scroll', onScroll);

      const tick = (time: number) => { lenis.raf(time * 1000); };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      teardown = () => {
        gsap.ticker.remove(tick);
        lenis.off('scroll', onScroll);
        lenis.destroy();
        if (window.__lenis === (lenis as unknown as typeof window.__lenis)) {
          delete window.__lenis;
        }
      };

      // Component may have unmounted while the import was in-flight.
      if (destroyed) teardown();
    })();

    return () => {
      destroyed = true;
      teardown?.();
    };
  }, []);

  return <>{children}</>;
}
