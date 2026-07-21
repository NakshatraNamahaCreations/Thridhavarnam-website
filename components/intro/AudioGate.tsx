'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAudio } from '@/components/AudioProvider';
import LotusTrioMotif from './LotusTrioMotif';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * AudioGate — the cinematic welcome.
 *
 * 1. Curtain lifts.
 * 2. Twin-elephant + lotus motif draws itself in stroke-by-stroke.
 * 3. The wordmark and body copy fade in beneath it.
 * 4. After a quiet hold, the gate dissolves and the story begins.
 */
export default function AudioGate() {
  const { startAudio, markEntered } = useAudio();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const motifRef = useRef<HTMLDivElement | null>(null);
  const exitedRef = useRef(false);

  useEffect(() => {
    if (!rootRef.current) return;

    // Prevent the browser from restoring a previous scroll position on reload —
    // otherwise when the gate dismisses we hand the visitor off mid-story
    // (e.g. landing on the closing EnterAtelier panel) instead of chapter I.
    const prevScrollRestoration =
      'scrollRestoration' in history ? history.scrollRestoration : 'auto';
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Lock body scroll while the cinema plays
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('lenis-stopped');

    // Stop the smooth-scroll engine entirely. Without this, Lenis keeps
    // intercepting wheel/touch events at window level even though body is
    // overflow:hidden — it accumulates an internal targetScroll across the
    // 5–8 s preloader and then dumps the visitor near the bottom of the
    // (now very tall) pinned story when it restarts.
    const lenis = window.__lenis;
    lenis?.stop();
    lenis?.scrollTo(0, { immediate: true, force: true });

    const restoreScroll = () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.classList.remove('lenis-stopped');
    };

    const ctx = gsap.context(() => {
      // ── 0. Continuous gold-glow breathing (preloader heartbeat) ──────
      // Deep fade so the glow visibly swells and ebbs rather than holding.
      gsap.to('[data-gate-glow]', {
        opacity: 0.25,
        scale: 1.06,
        transformOrigin: '50% 46%',
        duration: 3.6,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
      gsap.to('[data-gate-halo]', {
        opacity: 0.3,
        scale: 1.12,
        transformOrigin: '50% 42%',
        duration: 2.8,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
      gsap.to('[data-gate-pinpoint]', {
        opacity: 0.35,
        scale: 1.18,
        transformOrigin: '50% 44%',
        duration: 2.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      // ── 1. Prep stroke-draw on every motif path/circle ───────────────
      const drawables = motifRef.current?.querySelectorAll<SVGGeometryElement>(
        '[data-draw]',
      );
      drawables?.forEach((el) => {
        try {
          const length = el.getTotalLength?.() ?? 0;
          if (!length) return;
          el.style.strokeDasharray = String(length);
          el.style.strokeDashoffset = String(length);
        } catch {
          // Filled-only circles (no stroke) ignore — they'll just fade in.
        }
      });

      // ── 2. Master entrance timeline ──────────────────────────────────
      const intro = gsap.timeline();

      intro
        // Curtain lifts
        .to('[data-gate-curtain]', { opacity: 0, duration: 1.2, ease: 'power2.out' }, 0)

        // Motif strokes draw in — short per-path duration with a tight
        // stagger so the *total* draw time is bounded (~90 paths × 0.005s
        // stagger + 1.8s = ~2.25s) instead of dragging on indefinitely.
        .to(
          '[data-draw]',
          {
            strokeDashoffset: 0,
            duration: 1.8,
            ease: 'power2.inOut',
            stagger: { each: 0.005, from: 'random' },
          },
          0.6,
        )
        // Fill-only stigma dots fade in alongside the strokes
        .from(
          '[data-draw][stroke="none"]',
          { opacity: 0, duration: 0.5, stagger: 0.01, ease: 'power2.out' },
          0.6,
        )

        // Short hold so the lotus is admired before the wordmark forms
        .to({}, { duration: 0.3 })

        // ─── Brand name reveal — the preloader's signature moment ──────
        // Soft halo pulses up behind the wordmark first
        .fromTo(
          '[data-gate-brandglow]',
          { opacity: 0, scale: 0.6 },
          { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' },
          '>-0.1',
        )
        // Each letter of THRIDHA VARNAM rises into place with a stagger
        .from(
          '[data-gate-letter]',
          {
            opacity: 0,
            y: 18,
            filter: 'blur(6px)',
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.05,
          },
          '<0.1',
        )
        // The halo settles to its quiet ambient level
        .to(
          '[data-gate-brandglow]',
          { opacity: 0.55, duration: 0.8, ease: 'power2.inOut' },
          '>-0.2',
        )
        // Gold rule draws under the wordmark
        .from(
          '[data-gate-rule]',
          { scaleX: 0, transformOrigin: 'center', duration: 1.0, ease: 'power3.out' },
          '<-0.2',
        )
        // Tagline beneath
        .from(
          '[data-gate-tagline]',
          { opacity: 0, y: 10, duration: 0.8, ease: 'power3.out' },
          '<0.1',
        );
    }, rootRef);

    // Audio begins as the motif starts drawing
    const audioTimer = window.setTimeout(() => {
      startAudio();
    }, 1500);

    // ── Preloader behaviour ──────────────────────────────────────────
    // Dismiss when both:
    //   (a) the welcome animation has had a minimum hold time, and
    //   (b) the document has fully loaded (window 'load' event)
    // With a hard ceiling so a stuck network never traps the visitor.
    const MIN_DISPLAY_MS = 5000; // floor — quick admire, then move on
    const MAX_DISPLAY_MS = 8000; // ceiling — dismiss even if 'load' never fires
    const startedAt = performance.now();

    let exitTimer: number | undefined;

    const scheduleExit = () => {
      const elapsed = performance.now() - startedAt;
      const wait = Math.max(0, MIN_DISPLAY_MS - elapsed);
      exitTimer = window.setTimeout(triggerExit, wait);
    };

    if (document.readyState === 'complete') {
      scheduleExit();
    } else {
      window.addEventListener('load', scheduleExit, { once: true });
    }

    // Hard ceiling — fires regardless of load state
    const maxTimer = window.setTimeout(triggerExit, MAX_DISPLAY_MS);

    function triggerExit() {
      if (exitedRef.current || !rootRef.current) return;
      exitedRef.current = true;
      const el = rootRef.current;

      const out = gsap.timeline({
        onComplete: () => {
          el.style.display = 'none';
          // Guarantee the story opens at chapter I, not wherever the browser
          // (or a stray pre-lock nudge) left the scroll position.
          window.scrollTo(0, 0);
          const lenisNow = window.__lenis;
          lenisNow?.scrollTo(0, { immediate: true, force: true });
          restoreScroll();
          markEntered();
          // The pinned ScrollTriggers in HeritageScroll + EnterAtelier mount
          // when `unlocked` flips. Refresh after layout settles, then snap
          // both Lenis and native scroll back to top once more — pin
          // measurement can nudge scroll position. Only then resume Lenis.
          requestAnimationFrame(() => {
            ScrollTrigger.refresh();
            window.scrollTo(0, 0);
            const l = window.__lenis;
            l?.scrollTo(0, { immediate: true, force: true });
            l?.start();
          });
        },
      });
      out
        .to(
          ['[data-gate-rule]', '[data-gate-mark]'],
          { opacity: 0, y: -18, duration: 0.7, ease: 'power2.in', stagger: 0.04 },
          0,
        )
        .to(
          '[data-motif-wrap]',
          { opacity: 0, scale: 0.96, duration: 1.0, ease: 'power2.inOut' },
          0.1,
        )
        .to(
          '[data-gate-curtain-out]',
          { opacity: 1, duration: 0.9, ease: 'power2.in' },
          0.3,
        )
        .to(el, { opacity: 0, duration: 0.8, ease: 'power2.inOut' }, '-=0.15');
    }

    return () => {
      ctx.revert();
      clearTimeout(audioTimer);
      if (exitTimer !== undefined) clearTimeout(exitTimer);
      clearTimeout(maxTimer);
      window.removeEventListener('load', scheduleExit);
      restoreScroll();
      // Make sure Lenis is running again if we unmount before triggerExit
      // ever ran (e.g. fast nav away during the preloader).
      window.__lenis?.start();
      if ('scrollRestoration' in history) {
        history.scrollRestoration = prevScrollRestoration as ScrollRestoration;
      }
    };
  }, [startAudio, markEntered]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] no-select overflow-hidden text-ivory"
      style={{
        // Deep cordovan base — clean, cool-leaning dark with a whisper of
        // aubergine in the corners. Keeps the field dark enough that the
        // gold glow above it actually reads as light, not as warm tint.
        background: [
          'radial-gradient(100% 80% at 50% 50%, #150A08 0%, #0A0504 60%, #050201 100%)',
          'radial-gradient(140% 100% at 50% 120%, rgba(60,8,18,0.35) 0%, rgba(60,8,18,0) 55%)',
        ].join(', '),
      }}
    >
      {/* Wide gold ambient — soft warm wash filling the upper half. */}
      <div
        data-gate-glow
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(50% 45% at 50% 46%, rgba(244,228,181,0.22) 0%, rgba(226,201,138,0.10) 35%, rgba(201,169,97,0.03) 60%, rgba(11,6,4,0) 80%)',
          mixBlendMode: 'screen',
        }}
      />
      {/* Tight gold core — the actual "lit" centre directly behind the motif. */}
      <div
        data-gate-halo
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(18% 22% at 50% 42%, rgba(255,240,200,0.55) 0%, rgba(244,228,181,0.28) 30%, rgba(201,169,97,0.10) 55%, rgba(11,6,4,0) 78%)',
          mixBlendMode: 'screen',
        }}
      />
      {/* Inner pinpoint — the brightest spike of light at the very centre. */}
      <div
        data-gate-pinpoint
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(7% 9% at 50% 44%, rgba(255,248,220,0.45) 0%, rgba(255,240,200,0.15) 40%, rgba(11,6,4,0) 75%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Faint paisley wash so the background isn't a flat black slab */}
      <div className="absolute inset-0 paisley-bg opacity-20 pointer-events-none" />

      {/* Fine grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Opening curtain — black, fades out as the page reveals */}
      <div
        data-gate-curtain
        className="absolute inset-0 bg-[#0B0604] pointer-events-none z-20"
      />
      {/* Closing curtain — transparent, fades in on exit */}
      <div
        data-gate-curtain-out
        className="absolute inset-0 bg-[#0B0604] opacity-0 pointer-events-none z-20"
      />

      {/* Centred stage — content sized to fit any reasonable viewport */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 py-6 text-center">
        {/* Animated motif */}
        <div
          ref={motifRef}
          data-motif-wrap
          className="text-[#F2C99E] mb-6 md:mb-8 drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex justify-center"
        >
          <LotusTrioMotif className="w-[110px] sm:w-[130px] md:w-[150px] lg:w-[170px]" />
        </div>

        {/* Wordmark — fades in letter by letter with a glowing halo */}
        <div data-gate-mark className="relative">
          {/* Soft gold glow behind the brand name */}
          <div
            data-gate-brandglow
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] md:w-[680px] h-[140px] md:h-[180px] pointer-events-none"
            style={{
              background:
                'radial-gradient(50% 60% at 50% 50%, rgba(244,228,181,0.35) 0%, rgba(201,169,97,0.15) 45%, rgba(11,6,4,0) 75%)',
            }}
          />
          {/* Cream logo lockup — visible on the dark preloader bg */}
          <div data-gate-letter className="relative inline-block">
            <img
              src="/brand/cream-logo-vertical.svg"
              alt="Thridha Varnam — Tradition in every color"
              width={280}
              height={240}
              className="h-32 md:h-44 lg:h-52 w-auto select-none mx-auto"
              draggable={false}
            />
          </div>
          <div data-gate-rule className="gold-rule w-48 md:w-64 mx-auto my-4" />
          <div
            data-gate-tagline
            className="text-[0.55rem] md:text-[0.65rem] tracking-[0.5em] uppercase text-[#F2C99E]/85"
          >
            Estd. Heritage
          </div>
        </div>

      </div>
    </div>
  );
}
