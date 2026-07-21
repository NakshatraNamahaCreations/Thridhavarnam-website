'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useScrollLock } from '@/lib/scroll-lock';

// Session-scoped so a single browse session sees it once; sessionStorage
// (not localStorage) means it returns on a fresh tab — appropriate for a
// promotion-of-the-week banner, not a one-time onboarding screen.
const STORAGE_KEY = 'tridha-promo-splash-dismissed';
const DELAY_MS = 4200;

export default function PromoSplash() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  // Cinematic narrative pages own the viewport and shouldn't be interrupted
  // by a marketing dialog. /journey is hidden from nav but still routable —
  // skip there too for the same reason.
  const immersive = pathname === '/' || pathname === '/journey';

  useEffect(() => {
    if (immersive) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') return;
    } catch {
      /* private mode — fall through and just show it */
    }
    const t = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(t);
  }, [immersive]);

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* private mode — silent */
    }
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 240);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-title"
      data-lenis-prevent
    >
      <button
        type="button"
        aria-label="Close promotion"
        onClick={dismiss}
        className={`absolute inset-0 bg-[#1B0E0A]/75 backdrop-blur-sm transition-opacity duration-300 ${
          closing ? 'opacity-0' : 'opacity-100'
        }`}
      />

      <div
        className={`relative w-full max-w-[680px] aspect-[16/10] max-h-[68vh] overflow-hidden shadow-2xl bg-[#1B0E0A] flex transition-all duration-300 ${
          closing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* Left — solid cocoa panel with all the text */}
        <div className="relative w-[55%] bg-[#1B0E0A] flex flex-col justify-between p-6 md:p-8 lg:p-9 text-ivory z-10">
          <div className="flex flex-col items-start">
            <img
              src="/brand/cream-logo-horizontal.svg"
              alt="Thridha Varnam"
              width={160}
              height={48}
              className="h-10 md:h-12 w-auto select-none"
              draggable={false}
            />
          </div>

          <div>
            <div className="text-[0.6rem] md:text-[0.65rem] tracking-[0.4em] uppercase text-gold">
              Festive Edit
            </div>
            <h2
              id="promo-title"
              className="mt-2 text-3xl md:text-4xl lg:text-[2.6rem] font-bold leading-[0.95] tracking-tight"
            >
              FLAT 20–30%<br />OFF
            </h2>
            <p className="mt-3 text-xs md:text-[0.85rem] text-ivory/85 leading-relaxed max-w-[34ch]">
              On select hand-loomed heirlooms across Kanjeevaram, Banarasi and Gadwal. This week only.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/shop?sale=1"
                onClick={dismiss}
                className="inline-flex items-center gap-2 bg-ivory text-ink px-5 py-2.5 text-xs font-semibold tracking-wide hover:bg-gold hover:text-ink transition-colors"
              >
                Shop the Edit
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
              <button
                type="button"
                onClick={dismiss}
                className="text-xs tracking-[0.18em] uppercase text-ivory/70 hover:text-ivory underline underline-offset-4 px-2 py-2"
              >
                Maybe later
              </button>
            </div>
          </div>

          <p className="text-[0.55rem] tracking-[0.32em] uppercase text-ivory/45">
            Limited time · T&amp;C apply
          </p>
        </div>

        {/* Right — image */}
        <div className="relative w-[45%]">
          <Image
            src="/homebanner/Haldi Paithani.webp"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            priority={false}
            className="object-cover object-[65%_8%]"
          />
          {/* Soft feather where the cocoa panel meets the image */}
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#1B0E0A] to-transparent pointer-events-none" />
        </div>

        {/* Close */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center text-ivory/90 hover:text-ivory bg-[#1B0E0A]/40 hover:bg-[#1B0E0A]/70 backdrop-blur-sm transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
