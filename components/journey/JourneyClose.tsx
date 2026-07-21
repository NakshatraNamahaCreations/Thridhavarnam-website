'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * JourneyClose — the long-read's quiet exit.
 *
 * A single editorial frame inviting the reader to either return to the
 * cinematic story or step into the pieces themselves.
 */
export default function JourneyClose() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-jc-photo]',
        { scale: 1.14 },
        { scale: 1.04, duration: 22, ease: 'power1.out' },
      );
      gsap.to('[data-jc-photo]', {
        scale: 1.08,
        duration: 30,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 22,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current!,
          start: 'top top',
          end: '+=240%',
          pin: true,
          pinType: 'transform',
          scrub: 1.0,
          anticipatePin: 1,
          pinSpacing: true,
          invalidateOnRefresh: true,
        },
      });
      tl.from('[data-jc-frame]',   { opacity: 0, duration: 0.25 }, 0)
        .from('[data-jc-mark]',    { opacity: 0, y: -16, duration: 0.30 }, 0.04)
        .from('[data-jc-rule]',    { scaleX: 0, transformOrigin: 'left center', duration: 0.30 }, 0.14)
        .from('[data-jc-end]',     { opacity: 0, y: -16, duration: 0.30 }, 0.06)
        .from('[data-jc-eyebrow]', { opacity: 0, y: 16, duration: 0.30 }, 0.34)
        .from('[data-jc-head-1]',  { opacity: 0, yPercent: 80, duration: 0.55 }, 0.42)
        .from('[data-jc-head-2]',  { opacity: 0, yPercent: 80, duration: 0.55 }, 0.58)
        .from('[data-jc-desc]',    { opacity: 0, y: 22, duration: 0.40 }, 0.82)
        .from('[data-jc-cta]',     { opacity: 0, y: 22, duration: 0.40 }, 0.96)
        .from('[data-jc-foot]',    { opacity: 0, y: 14, duration: 0.30 }, 1.10);
    }, rootRef);

    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative min-h-screen overflow-hidden bg-[#0B0604] text-ivory"
      aria-label="End of the long read"
    >
      <div className="absolute inset-y-0 right-0 w-full md:w-[58%] lg:w-[62%] overflow-hidden">
        <div data-jc-photo className="absolute inset-0 will-change-transform">
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
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(11,6,4,1) 0%, rgba(11,6,4,1) 18%, rgba(11,6,4,0.7) 28%, rgba(11,6,4,0.35) 38%, rgba(11,6,4,0.12) 48%, transparent 60%)',
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(11,6,4,0.7) 0%, transparent 100%)' }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(11,6,4,0.85) 100%)' }}
        />
        <div className="md:hidden absolute inset-0 bg-[#0B0604]/75 pointer-events-none" />
      </div>

      <div className="absolute inset-y-0 left-0 w-full md:w-[50%] lg:w-[48%] bg-[#0B0604]" />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div
        data-jc-frame
        className="absolute inset-5 md:inset-7 pointer-events-none border border-[#E0AE6D]/15"
      />

      <div className="relative z-10 min-h-screen grid grid-rows-[auto_1fr_auto] px-10 md:px-14 lg:px-20 py-8 md:py-10">
        <header className="flex items-start justify-between gap-8">
          <div data-jc-mark>
            <div className="text-display text-xl md:text-2xl text-[#F2C99E] leading-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">
              Thridha Varnam
            </div>
            <div data-jc-rule className="gold-rule w-10 my-1.5" />
            <div className="eyebrow text-[0.5rem] text-[#F2C99E]/80 tracking-[0.4em]">
              The Journey · Deep Archive
            </div>
          </div>
          <div data-jc-end className="text-right">
            <div className="eyebrow text-[0.5rem] text-[#F2C99E]/70 mb-1 tracking-[0.4em]">
              End of the archive
            </div>
            <div className="text-display text-xl md:text-2xl text-[#E0AE6D] leading-none">
              VI / VI
            </div>
          </div>
        </header>

        <main className="flex items-center">
          <div className="w-full md:w-[48%] lg:w-[44%] pr-0 md:pr-4">
            <div className="flex items-baseline gap-3 mb-6">
              <span
                data-jc-eyebrow
                className="eyebrow text-[#E0AE6D]/80 tracking-[0.4em] text-[0.55rem] md:text-[0.6rem]"
              >
                The long read · finished
              </span>
            </div>

            <h2 className="text-display text-[11vw] md:text-[5.2vw] lg:text-[4.2vw] xl:text-[3.6vw] leading-[0.92] tracking-tight text-ivory drop-shadow-[0_4px_22px_rgba(0,0,0,0.6)] overflow-hidden">
              <span data-jc-head-1 className="block">Now read</span>
              <span data-jc-head-2 className="block">
                <em className="text-serif italic font-light text-[#F2C99E]">the pieces.</em>
              </span>
            </h2>

            <p
              data-jc-desc
              className="text-serif text-base md:text-lg text-ivory/80 leading-snug font-light mt-5"
            >
              Six traditions, in your hand at last.
              The house is open.
            </p>

            <div
              data-jc-cta
              className="mt-7 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8"
            >
              <Link
                href="/shop"
                className="group relative inline-flex items-center justify-between gap-8 bg-[#E0AE6D] text-[#3F3F3F] pl-6 pr-5 py-[0.9rem] hover:bg-[#F2C99E] transition-colors duration-500 shadow-[0_10px_40px_-12px_rgba(201,169,97,0.55)] whitespace-nowrap"
              >
                <span className="eyebrow text-[0.6rem] tracking-[0.35em]">
                  See the pieces
                </span>
                <span className="text-base leading-none translate-y-[-1px]">→</span>
                <span className="absolute inset-0 border border-[#F2C99E]/40 pointer-events-none" />
              </Link>
              <Link
                href="/"
                className="group inline-flex items-center gap-3 text-ivory/65 hover:text-[#F2C99E] transition-colors py-2 whitespace-nowrap"
              >
                <span className="w-8 h-px bg-ivory/40 group-hover:bg-[#F2C99E] transition-colors" />
                <span className="eyebrow text-[0.6rem] tracking-[0.35em]">
                  Replay the cinematic
                </span>
              </Link>
            </div>
          </div>
        </main>

        <footer
          data-jc-foot
          className="flex items-end"
        >
          <div className="eyebrow text-[0.5rem] text-ivory/50 tracking-[0.4em] whitespace-nowrap">
            Hand-woven in India · Shipped worldwide
          </div>
        </footer>
      </div>
    </section>
  );
}
