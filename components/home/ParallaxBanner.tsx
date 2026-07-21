'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * ParallaxBanner — true "image fixed to viewport while sections scroll over"
 * effect. Lenis smooth-scroll breaks native `background-attachment: fixed`,
 * so we use GSAP ScrollTrigger (already wired into Lenis) to translate a
 * full-viewport-height image div so it stays locked to the viewport as the
 * section scrolls past.
 *
 * Math: as scroll goes from "section top at viewport bottom" to "section
 * bottom at viewport top", the image's y translates from -100vh to +sectionH.
 * The wrap (overflow-hidden) clips to the visible section area, exactly
 * replicating bg-fixed's clipping behavior.
 */
export default function ParallaxBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !imgRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { y: () => -window.innerHeight },
        {
          y: () => sectionRef.current!.offsetHeight,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    }, sectionRef);

    // Force ScrollTrigger to reconcile after Lenis/next-image mount so the
    // initial `y` position matches the current scroll — otherwise the image
    // can stay stuck at the `from` state (y = -100vh, fully above the wrap
    // → nothing visible) on hard reloads with the section already in view.
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Featured collection"
      className="relative w-full h-[80vh] min-h-[520px] bg-[#1B0E0A] overflow-hidden"
    >
      {/* Image wrap — clips to the left 58% of the section. The seam
          gradient lives INSIDE the wrap so it blends the image's right
          edge into the ink section bg (same pattern as Hero). The right
          ~42% of the section is left as pure bg-maroon-deep where the text reads. */}
      <div className="absolute inset-y-0 left-0 w-full md:w-[60%] lg:w-[58%] overflow-hidden">
        {/* Image — VH tall, translated by GSAP so it stays locked to the
            viewport while the wrap (and the section above/below) scroll past. */}
        <div
          ref={imgRef}
          className="absolute top-0 left-0 w-full h-screen bg-cover will-change-transform"
          style={{
            backgroundImage: "url('/photos/bridal.webp')",
            backgroundPosition: '50% 30%',
          }}
        />
        {/* Seam gradient — full cocoa at the rightmost edge so it merges
            seamlessly with the section's #1B0E0A bg, easing out in a long
            S-curve so the fade reads as soft, not a line. */}
        <div
          className="absolute inset-y-0 right-0 w-[50%] pointer-events-none"
          style={{
            background:
              'linear-gradient(270deg, rgba(27,14,10,1) 0%, rgba(27,14,10,0.95) 12%, rgba(27,14,10,0.78) 28%, rgba(27,14,10,0.5) 48%, rgba(27,14,10,0.22) 70%, rgba(27,14,10,0.06) 88%, rgba(27,14,10,0) 100%)',
          }}
        />
      </div>

      {/* On mobile the photo sits behind the text — extra wash for legibility */}
      <div className="md:hidden absolute inset-0 bg-[#1B0E0A]/70 pointer-events-none" />

      {/* Content panel — sits on the solid ink right half */}
      <div className="relative h-full max-w-[1720px] mx-auto px-6 md:px-10 lg:px-14 flex items-center justify-center md:justify-end">
        {/* Same viewport-aware cap as Hero — keeps the text panel inside the
            right ~40% column at high browser zoom instead of colliding with
            the absolute left-pane image. */}
        <div className="max-w-md md:max-w-[min(28rem,38vw)] text-center md:text-left text-ivory">
          <div className="text-xs font-medium uppercase tracking-wider text-gold-soft mb-4">
            Featured Collection
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-5">
            The Heirloom Edit
          </h2>
          <p className="text-base md:text-lg text-ivory/85 leading-relaxed mb-7">
            Bridal Banarasi, Kanjivaram and Patola — pieces meant to be folded
            into the next century. Hand-woven on traditional pit looms.
          </p>
          <Link
            href="/shop?tier=bridal"
            className="inline-flex items-center gap-2 bg-ivory text-ink px-8 py-3.5 text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-gold transition-colors"
          >
            Explore <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
