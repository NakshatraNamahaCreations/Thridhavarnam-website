'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAudio } from '@/components/AudioProvider';

// Hard-navigate out of the story page. next/link's client-side transition
// throws `NotFoundError: Failed to execute 'insertBefore'` here because
// GSAP ScrollTrigger + Lenis have mutated this page's DOM; React's
// reconciler can no longer locate the nodes it expects to move when it
// unmounts. A plain anchor with a forced full reload sidesteps it.
function leaveStory(href: string) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Honour modifier clicks (open in new tab, etc.)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    window.location.assign(href);
  };
}

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * EnterAtelier — the closing threshold.
 *
 * A single full-bleed editorial frame. The photograph carries the invitation,
 * the type sits on top in gold, the visitor is offered one quiet door.
 * No stats, no re-listing — the long story has already been read; this is
 * the room itself, opening.
 */
export default function EnterAtelier() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { unlocked } = useAudio();

  useEffect(() => {
    // Wait until the AudioGate has handed off — otherwise ScrollTrigger
    // calculates pin positions while body scroll is still locked.
    if (!unlocked || !rootRef.current) return;
    const ctx = gsap.context(() => {
      // Continuous, time-based ken-burns push-in (independent of scroll)
      gsap.fromTo(
        '[data-enter-photo]',
        { scale: 1.14 },
        { scale: 1.04, duration: 22, ease: 'power1.out' },
      );
      gsap.to('[data-enter-photo]', {
        scale: 1.08,
        duration: 30,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 22,
      });

      // Pinned + scroll-driven reveal. The whole entrance is mapped to a
      // single ScrollTrigger: as the user scrolls through the pin range,
      // the type opens line by line.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current!,
          start: 'top top',
          // Pin range matched to the (now longer) heritage panels so the
          // closing scene reads as a substantial 7th beat rather than a
          // section that flashes by under a single wheel flick.
          end: '+=360%',
          pin: true,
          // pinType defaults to 'fixed' — leave it. 'transform' is for
          // proxied scrollers; with Lenis (native scroll), 'fixed' is
          // the right call and avoids sub-pixel shake.
          // scrub: true (no number) — Lenis already smooths; numeric
          // scrub on top causes double-buffered shake.
          scrub: true,
          // anticipatePin removed — pre-shifts the pin position which
          // reads as a small jump on smooth scrollers.
          pinSpacing: true,
          invalidateOnRefresh: true,
        },
      });
      // With scrub, durations act as weights along the scroll range.
      tl.from('[data-enter-frame]',   { opacity: 0, duration: 0.25 }, 0)
        .from('[data-enter-mark]',    { opacity: 0, y: -16, duration: 0.30 }, 0.02)
        .from('[data-enter-rule]',    { scaleX: 0, transformOrigin: 'left center', duration: 0.30 }, 0.12)
        .from('[data-enter-chapter]', { opacity: 0, y: -16, duration: 0.30 }, 0.05)
        .from('[data-enter-pravesh]', { opacity: 0, y: 20, duration: 0.35 }, 0.18)
        .from('[data-enter-eyebrow]', { opacity: 0, y: 18, duration: 0.30 }, 0.32)
        .from('[data-enter-head-1]',  { opacity: 0, yPercent: 80, duration: 0.55 }, 0.42)
        .from('[data-enter-head-2]',  { opacity: 0, yPercent: 80, duration: 0.55 }, 0.58)
        .from('[data-enter-desc]',    { opacity: 0, y: 24, duration: 0.40 }, 0.82)
        .from('[data-enter-cta]',     { opacity: 0, y: 24, duration: 0.40 }, 0.96)
        .from('[data-enter-foot]',    { opacity: 0, y: 14, duration: 0.30 }, 1.10);
    }, rootRef);

    // The body scroll was locked while AudioGate played — recompute
    // ScrollTrigger geometry now that the page is fully scrollable.
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, [unlocked]);

  return (
    <section
      ref={rootRef}
      className="relative min-h-[100svh] overflow-hidden bg-[#0B0604] text-ivory"
      aria-label="Enter the house"
    >
      {/* Photograph window — right side */}
      <div className="absolute inset-y-0 right-0 w-full md:w-[58%] lg:w-[62%] overflow-hidden">
        <div data-enter-photo className="absolute inset-0 will-change-transform">
          <Image
            src="/story/last section.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 62vw"
            quality={95}
            className="object-cover object-[50%_35%]"
          />
        </div>
        {/* Continuous seam — the dark column bleeds INTO the left of the photo
            so the eye cannot find the edge between the two halves. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(11,6,4,1) 0%, rgba(11,6,4,1) 18%, rgba(11,6,4,0.7) 28%, rgba(11,6,4,0.35) 38%, rgba(11,6,4,0.12) 48%, transparent 60%)',
          }}
        />
        {/* Top + bottom vignettes inside the photo */}
        <div
          className="absolute inset-x-0 top-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(11,6,4,0.7) 0%, transparent 100%)' }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(11,6,4,0.85) 100%)' }}
        />
        {/* On mobile the photo sits behind the text — darken so type stays readable */}
        <div className="md:hidden absolute inset-0 bg-[#0B0604]/75 pointer-events-none" />
      </div>

      {/* Solid dark column — left side, behind the text */}
      <div className="absolute inset-y-0 left-0 w-full md:w-[50%] lg:w-[48%] bg-[#0B0604]" />

      {/* Fine grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Hairline gold frame */}
      <div
        data-enter-frame
        className="absolute inset-3 sm:inset-5 md:inset-7 pointer-events-none border border-[#E0AE6D]/15"
      />

      {/* 3-row safe layout — content lives on the LEFT half.
          Mobile pads tight (px-5) so the heading + CTA don't run off the
          frame at 390px; desktop keeps the editorial gutters. */}
      <div className="relative z-10 min-h-[100svh] grid grid-rows-[auto_1fr_auto] px-5 sm:px-8 md:px-14 lg:px-20 py-6 sm:py-8 md:py-10">
        {/* Top row — wordmark left, chapter end stays top-right of viewport.
            Mobile (sub-sm) drops the tagline entirely — at 0.45rem/0.32em
            tracking, "Tradition in every color" is 228px wide and pushes
            the right column past the section's overflow-hidden edge, which
            clips the chapter ticker. Wordmark alone is sufficient on mobile. */}
        <header className="flex items-start justify-between gap-4 sm:gap-8">
          <div data-enter-mark className="min-w-0">
            <div className="text-display text-lg sm:text-xl md:text-2xl text-[#F2C99E] leading-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">
              Thridha Varnam
            </div>
            <div data-enter-rule className="gold-rule w-10 my-1.5 hidden sm:block" />
            <div className="hidden sm:block eyebrow text-[0.5rem] text-[#F2C99E]/80 tracking-[0.4em]">
              Tradition in every color · Estd. Heritage
            </div>
          </div>
          <div data-enter-chapter className="text-right shrink-0">
            <div className="eyebrow text-[0.45rem] sm:text-[0.5rem] text-[#F2C99E]/70 mb-1 tracking-[0.32em] sm:tracking-[0.4em]">
              <span className="sm:hidden">Chapter</span>
              <span className="hidden sm:inline">End of the story</span>
            </div>
            <div className="text-display text-lg sm:text-xl md:text-2xl text-[#E0AE6D] leading-none">
              VI / VI
            </div>
          </div>
        </header>

        {/* Type stage — full width on mobile (no two-column to share with),
            constrained to the dark left half on md+ */}
        <main className="flex items-center">
          <div className="w-full md:w-[52%] lg:w-[44%] pr-0 md:pr-4">
            <div
              data-enter-pravesh
              className="flex items-baseline gap-3 mb-6"
            >
              <span
                data-enter-eyebrow
                className="eyebrow text-[#E0AE6D]/80 tracking-[0.4em] text-[0.55rem] md:text-[0.6rem]"
              >
                Entry
              </span>
            </div>

            <h2 className="text-display text-[11vw] md:text-[5.2vw] lg:text-[4.2vw] xl:text-[3.6vw] leading-[0.92] tracking-tight text-ivory drop-shadow-[0_4px_22px_rgba(0,0,0,0.6)] overflow-hidden">
              <span data-enter-head-1 className="block">The house</span>
              <span data-enter-head-2 className="block">
                <em className="text-serif italic font-light text-[#F2C99E]">is open.</em>
              </span>
            </h2>

            <p
              data-enter-desc
              className="text-serif text-base md:text-lg text-ivory/80 leading-snug font-light mt-5"
            >
              You have read the long story.
              The pieces themselves are inside.
            </p>

            <div
              data-enter-cta
              className="mt-7 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8"
            >
              <a
                href="/home"
                onClick={leaveStory('/home')}
                className="group relative flex sm:inline-flex w-full sm:w-auto items-center justify-between gap-4 sm:gap-8 bg-[#E0AE6D] text-[#3F3F3F] pl-5 pr-4 sm:pl-6 sm:pr-5 py-[0.9rem] hover:bg-[#F2C99E] transition-colors duration-500 shadow-[0_10px_40px_-12px_rgba(201,169,97,0.55)] whitespace-nowrap"
              >
                <span className="eyebrow text-[0.55rem] sm:text-[0.6rem] tracking-[0.32em] sm:tracking-[0.35em]">
                  Step inside
                </span>
                <span className="text-base leading-none translate-y-[-1px]">→</span>
                <span className="absolute inset-0 border border-[#F2C99E]/40 pointer-events-none" />
              </a>
              <a
                href="/shop"
                onClick={leaveStory('/shop')}
                className="group inline-flex items-center gap-3 text-ivory/65 hover:text-[#F2C99E] transition-colors py-2 whitespace-nowrap"
              >
                <span className="w-8 h-px bg-ivory/40 group-hover:bg-[#F2C99E] transition-colors" />
                <span className="eyebrow text-[0.6rem] tracking-[0.35em]">
                  Skip to the pieces
                </span>
              </a>
            </div>
          </div>
        </main>

        {/* Bottom strip — drops to a shorter label on mobile so it doesn't
            push past the section's overflow-hidden edge (the full string at
            0.5rem / 0.4em tracking is ~290px wide which clips at 350px
            content area once the RAAG-PLAYING badge takes its own corner). */}
        <footer
          data-enter-foot
          className="flex items-end"
        >
          <div className="eyebrow text-[0.45rem] sm:text-[0.5rem] text-ivory/50 tracking-[0.32em] sm:tracking-[0.4em]">
            <span className="sm:hidden">Hand-woven in India</span>
            <span className="hidden sm:inline">Hand-woven in India · Shipped worldwide</span>
          </div>
        </footer>
      </div>
    </section>
  );
}
