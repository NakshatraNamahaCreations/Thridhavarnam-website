'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useAudio } from '@/components/AudioProvider';
import { useScrollLock } from '@/lib/scroll-lock';
import { storiesApi, type BackendStory } from '@/lib/api';

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

// Hard-navigate out of the story page. next/link's client-side transition
// throws `NotFoundError: Failed to execute 'insertBefore'` here because
// Lenis (and any GSAP DOM work on this page) mutate the tree out from
// under React's reconciler. A full-page assign sidesteps it.
function leaveStory(href: string) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    window.location.assign(href);
  };
}

// Shape used by the tile / detail rendering. Records are fetched from
// the backend Stories collection (admin-managed via the admin panel).
type Category = {
  id: string;
  name: string;
  region: string;
  state: string;
  era: string;
  image: string;
  palette: [string, string, string];
  intro: string;
  origins: string;
  technique: string;
  look_for: [string, string, string];
  pull_quote: string;
};

// Map a backend Story record into the local Category shape used by the
// tile / detail rendering. Missing text fields fall back to empty
// strings so the tile doesn't crash; palette + look_for are padded to
// three entries because the layout indexes into them directly.
function storyToCategory(s: BackendStory): Category {
  const pal = Array.isArray(s.palette) ? s.palette : [];
  const look = Array.isArray(s.look_for) ? s.look_for : [];
  return {
    id: s.id,
    name: s.name ?? '',
    region: s.region ?? '',
    state: s.state ?? '',
    era: s.era ?? '',
    image: s.image ?? '',
    palette: [pal[0] ?? '#6B0E1F', pal[1] ?? '#0E4D5C', pal[2] ?? '#E2C98A'],
    intro: s.intro ?? '',
    origins: s.origins ?? '',
    technique: s.technique ?? '',
    look_for: [look[0] ?? '', look[1] ?? '', look[2] ?? ''],
    pull_quote: s.pull_quote ?? '',
  };
}

export default function HeritageScroll() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [fetchedCategories, setFetchedCategories] = useState<Category[]>([]);
  const { unlocked } = useAudio();

  // Fetch heritage stories on mount. Failures are silent — the fallback
  // static list keeps the intro scroll rendering even without a backend.
  useEffect(() => {
    let cancelled = false;
    storiesApi
      .list()
      .then((rows) => {
        if (cancelled) return;
        setFetchedCategories(rows.map(storyToCategory));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const CATEGORIES: Category[] = fetchedCategories;

  // Section reveal — runs once when the welcome gate unlocks. Header lifts
  // first, then the tiles fade up in sequence.
  useEffect(() => {
    if (!unlocked || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-h-mark]', {
        y: -14,
        autoAlpha: 0,
        duration: 0.7,
        ease: 'power3.out',
      });
      gsap.from('[data-h-eyebrow]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.6,
        delay: 0.15,
        ease: 'power3.out',
      });
      gsap.from('[data-h-line]', {
        yPercent: 110,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.1,
        delay: 0.25,
        ease: 'power4.out',
      });
      gsap.from('[data-h-lede]', {
        y: 18,
        autoAlpha: 0,
        duration: 0.6,
        delay: 0.85,
        ease: 'power3.out',
      });
      gsap.from('[data-h-tile]', {
        y: 32,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.08,
        delay: 1.0,
        ease: 'power3.out',
      });
      gsap.from('[data-h-foot]', {
        y: 12,
        autoAlpha: 0,
        duration: 0.5,
        delay: 1.5,
        ease: 'power3.out',
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [unlocked]);

  // Body scroll-lock + Lenis cooperation are handled by useScrollLock
  // (counter-based) + the data-lenis-prevent attribute on the modal
  // overlay below. See lib/scroll-lock.ts for the why — lenis.stop()
  // breaks native scroll inside the modal.
  useScrollLock(openId !== null);

  const openTile = useCallback((id: string) => {
    setOpenId(id);
  }, []);

  const closeTile = useCallback(() => {
    setOpenId(null);
  }, []);

  // ESC closes the modal
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTile();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openId, closeTile]);

  const openCategory = openId ? CATEGORIES.find((c) => c.id === openId) ?? null : null;

  return (
    <>
      <section
        ref={sectionRef}
        className="relative bg-[#4D0015] text-ivory overflow-hidden"
        aria-label="Thridha Varnam — stories from the loom"
      >
        {/* Faint film-grain over everything */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        {/* Repeating brand star-flower at low opacity — matches the
            "MAHA GAURI" reference's tiled-pattern maroon ground. */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage: "url('/brand/pattern-title.svg')",
            backgroundRepeat: 'repeat',
            backgroundSize: '280px auto',
          }}
        />

        <div className="relative px-6 md:px-12 lg:px-20 pt-8 md:pt-10 pb-14 md:pb-20">
          <div className="max-w-[1720px] mx-auto">

            {/* ─── Masthead — centred cream logo on maroon, flanked by
                gold hairlines that fade toward the edges. */}
            <header
              data-h-mark
              className="flex items-center justify-center gap-5 md:gap-8 lg:gap-10 mb-10 md:mb-14"
            >
              <div
                aria-hidden
                className="hidden sm:block flex-1 max-w-[320px] h-px"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(224,174,109,0.4) 60%, rgba(224,174,109,0.7) 100%)',
                }}
              />

              <div className="overflow-hidden h-20 md:h-24 lg:h-28 shrink-0">
                <img
                  src="/brand/cream-logo-horizontal.svg"
                  alt="Thridha Varnam"
                  width={420}
                  height={420}
                  className="h-36 md:h-44 lg:h-52 w-auto select-none -mt-8 md:-mt-10 lg:-mt-12"
                  draggable={false}
                />
              </div>

              <div
                aria-hidden
                className="hidden sm:block flex-1 max-w-[320px] h-px"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(224,174,109,0.7) 0%, rgba(224,174,109,0.4) 40%, transparent 100%)',
                }}
              />
            </header>

            {/* ─── Introduction ─── */}
            {/* Eyebrow row — pairs the section eyebrow with the
                "Step inside" shortcut. Editorial pill would fight the
                cinematic mood, so we match the old bottom CTA style
                (gold hairline + arrow) and sit it opposite the eyebrow. */}
            <div className="mb-4 md:mb-6 flex flex-wrap items-center justify-between gap-3">
              <div
                data-h-eyebrow
                className="eyebrow text-[#E0AE6D]/85 text-[0.55rem] tracking-[0.45em]"
              >
                An introduction · The house
              </div>
              <a
                href="/home"
                onClick={leaveStory('/home')}
                className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-[#F5D89C] via-[#DDB067] to-[#B78846] text-white px-6 py-3 hover:from-[#FCE3AF] hover:via-[#E9BE7B] hover:to-[#C69553] transition-all duration-500 shadow-[0_10px_32px_-6px_rgba(184,134,63,0.7),0_2px_6px_-2px_rgba(76,42,14,0.4),inset_0_1px_0_rgba(255,240,210,0.6),inset_0_-1px_0_rgba(76,42,14,0.25)] hover:shadow-[0_16px_42px_-6px_rgba(224,174,109,0.9),0_3px_8px_-2px_rgba(76,42,14,0.4),inset_0_1px_0_rgba(255,240,210,0.7),inset_0_-1px_0_rgba(76,42,14,0.3)] whitespace-nowrap overflow-hidden"
              >
                <span className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_top,rgba(255,240,210,0.35),transparent_60%)] pointer-events-none" />
                <span className="absolute -inset-y-1 -left-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm transition-all duration-700 group-hover:left-full pointer-events-none" />
                <span className="relative eyebrow text-[0.72rem] md:text-[0.78rem] tracking-[0.35em] font-bold text-white drop-shadow-[0_1px_2px_rgba(76,42,14,0.5)]">
                  Step inside
                </span>
                <span className="relative text-base leading-none translate-y-[-1px] text-white font-bold drop-shadow-[0_1px_2px_rgba(76,42,14,0.5)] transition-transform duration-300 group-hover:translate-x-1">→</span>
                <span className="absolute inset-0 rounded-full border border-[#7A4A1E]/30 pointer-events-none" />
              </a>
            </div>

            <div className="grid md:grid-cols-[1.15fr_1fr] gap-x-12 gap-y-6 items-start mb-10 md:mb-14">
              <div>
                <h1 className="text-display text-[6vw] sm:text-[5vw] md:text-[3.2vw] lg:text-[3.4vw] xl:text-[2.8rem] leading-tight tracking-tight text-ivory">
                  <span className="block overflow-hidden pb-[0.2em]">
                    <span data-h-line className="block whitespace-nowrap">
                      Tradition, in every color.
                    </span>
                  </span>
                </h1>
              </div>
              <div className="md:pb-3">
                <p
                  data-h-lede
                  className="font-sans text-[0.95rem] md:text-base text-ivory/80 leading-relaxed font-light"
                >
                  Thridha Varnam is a premium saree house — a celebration of
                  the beauty, grace, and cultural richness of Indian
                  womanhood. Every drape, carefully curated, is rooted in
                  tradition and made for today. Below, a few of the weaves
                  we carry —{' '}
                  <span className="text-[#F2C99E]">
                    click any one to step inside its story.
                  </span>
                </p>
              </div>
            </div>

            {/* ─── Tiles ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
              {CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.id}
                  type="button"
                  data-h-tile
                  onClick={() => openTile(cat.id)}
                  aria-label={`Read about ${cat.name}`}
                  // Temple-arch portal — elliptical top corners + a thin
                  // cream inner ring evoke the gopuram/mehrab vocabulary
                  // from the reference. `overflow-hidden` clips the
                  // photograph to the arch shape.
                  className="group relative aspect-[3/5] overflow-hidden bg-[#2A0010] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0AE6D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#4D0015] border border-[#F2C99E]/25 hover:border-[#F2C99E]/50 transition-colors duration-500"
                  style={{
                    borderTopLeftRadius: '50% 28%',
                    borderTopRightRadius: '50% 28%',
                  }}
                >
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 20vw"
                    quality={92}
                    className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(45,0,12,0.18) 0%, rgba(45,0,12,0.4) 50%, rgba(45,0,12,0.94) 100%)',
                    }}
                  />

                  {/* Inner cream hairline frame — sits 6px inside the
                      arch so the photograph reads as a portal vignette. */}
                  <div
                    aria-hidden
                    className="absolute inset-[6px] border border-[#F2C99E]/25 pointer-events-none"
                    style={{
                      borderTopLeftRadius: '50% 28%',
                      borderTopRightRadius: '50% 28%',
                    }}
                  />

                  {/* Crown — Roman numeral inside a small ornament, centered at the apex of the arch */}
                  <div className="absolute top-5 inset-x-0 z-10 flex flex-col items-center pointer-events-none">
                    <div className="text-display text-sm text-[#E0AE6D] leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                      {ROMAN[idx]}
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      {cat.palette.map((hex, hi) => (
                        <span
                          key={hi}
                          className="block w-1 h-1 rounded-full"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Bottom — centred weave name + region, like a temple plaque */}
                  <div className="absolute inset-x-0 bottom-0 px-4 pb-5 md:pb-6 z-10 text-center">
                    <div className="text-display text-xl md:text-2xl leading-tight text-ivory mb-1 drop-shadow-[0_2px_14px_rgba(0,0,0,0.7)]">
                      {cat.name}
                    </div>
                    <div className="eyebrow text-[0.45rem] md:text-[0.5rem] text-[#F2C99E]/80 tracking-[0.4em]">
                      {cat.region}
                    </div>
                    <span
                      aria-hidden
                      className="block mx-auto mt-2 h-px w-6 bg-[#E0AE6D]/60 transition-all duration-500 group-hover:w-12 group-hover:bg-[#F2C99E]"
                    />
                  </div>

                  {/* Watermark logomark — bottom-left, kept subtle so it
                      doesn't compete with the centred plaque. */}
                  <img
                    src="/brand/logomark-cream.svg"
                    alt=""
                    aria-hidden
                    className="absolute bottom-3 left-3 z-10 h-5 md:h-6 w-auto opacity-40 select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] pointer-events-none"
                    draggable={false}
                  />
                </button>
              ))}
            </div>

            {/* ─── Footer band — "Step inside" CTA lives at the top of
                the section now; this band just carries the origin tag. */}
            <div
              data-h-foot
              className="mt-10 md:mt-14 border-t border-ivory/10 pt-7"
            >
              <div className="eyebrow text-[0.55rem] tracking-[0.4em] text-ivory/45">
                Hand-woven in India · Shipped worldwide
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Modal — opens when a tile is clicked ─── */}
      {openCategory && (
        <ChapterModal category={openCategory} onClose={closeTile} />
      )}
    </>
  );
}

function ChapterModal({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) {
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        backdropRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.35, ease: 'power2.out' },
      );
      gsap.fromTo(
        cardRef.current,
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.55, ease: 'power3.out', delay: 0.05 },
      );
      gsap.from('[data-m-line]', {
        yPercent: 110,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.04,
        delay: 0.2,
        ease: 'power4.out',
      });
      gsap.from('[data-m-body]', {
        y: 20,
        autoAlpha: 0,
        duration: 0.5,
        stagger: 0.09,
        delay: 0.35,
        ease: 'power3.out',
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${category.name} — chapter`}
      // data-lenis-prevent — Lenis bails out of preventDefault when a
      // wheel event passes through this element, so the modal's inner
      // overflow-y-auto scrolls natively while the page beneath stays
      // locked. See lib/scroll-lock.ts.
      data-lenis-prevent
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8 bg-[#0B0604]/82 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={cardRef}
        className="relative w-full max-w-[1080px] h-[88vh] max-h-[760px] overflow-hidden bg-[#1B0E0A] text-ivory shadow-[0_40px_80px_-20px_rgba(0,0,0,0.65)] border border-[#E0AE6D]/15 flex flex-col md:flex-row"
      >
        {/* Image side — explicit width + h-full so the photograph
            reliably fills its half (the earlier md:h-auto inside a
            grid was collapsing on some viewports). */}
        <div className="relative h-[32vh] md:h-full md:w-[44%] md:shrink-0 overflow-hidden">
          <Image
            src={category.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            quality={95}
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none md:bg-none"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, transparent 55%, rgba(27,14,10,0.6) 100%)',
            }}
          />
          <div
            aria-hidden
            className="hidden md:block absolute inset-y-0 right-0 w-24 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(27,14,10,0.6) 60%, rgba(27,14,10,1) 100%)',
            }}
          />
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between text-ivory">
            <div className="text-display text-lg text-[#E0AE6D] leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
              {category.region}
            </div>
            <div className="flex items-center gap-1.5">
              {category.palette.map((hex, hi) => (
                <span
                  key={hi}
                  className="block w-2 h-2 rounded-full"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
          <img
            src="/brand/logomark-cream.svg"
            alt=""
            aria-hidden
            className="absolute bottom-4 left-4 h-9 md:h-11 w-auto opacity-60 select-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)] pointer-events-none"
            draggable={false}
          />
        </div>

        {/* Content side */}
        <div className="relative flex-1 min-w-0 min-h-0 overflow-y-auto px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chapter"
            className="absolute top-5 right-5 w-9 h-9 inline-flex items-center justify-center border border-ivory/15 text-ivory/70 hover:text-[#F2C99E] hover:border-[#E0AE6D] transition-colors z-10"
          >
            <span className="text-lg leading-none">×</span>
          </button>

          <div className="eyebrow text-[#E0AE6D]/85 text-[0.55rem] tracking-[0.45em] mb-3">
            Chapter · {category.name}
          </div>

          <h3 className="text-display text-[2.2rem] md:text-[2.6rem] lg:text-[3rem] leading-[0.95] tracking-tight text-ivory mb-3 overflow-hidden">
            <span data-m-line className="inline-block">
              {category.name}
            </span>
          </h3>

          <div className="flex items-center gap-3 flex-wrap mb-5">
            <span className="eyebrow text-ivory/55 text-[0.55rem]">
              {category.region} · {category.state}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#E0AE6D]/55" />
            <span className="text-serif italic text-[0.85rem] text-[#E0AE6D]/80">
              {category.era}
            </span>
          </div>

          <p
            data-m-body
            className="font-sans text-[0.85rem] md:text-[0.9rem] text-ivory/80 leading-relaxed font-light mb-4"
          >
            <span className="text-[#E0AE6D]/85 text-[0.5rem] tracking-[0.4em] uppercase mr-2">
              Origins ·
            </span>
            {category.origins}
          </p>

          <p
            data-m-body
            className="font-sans text-[0.85rem] md:text-[0.9rem] text-ivory/80 leading-relaxed font-light mb-6"
          >
            <span className="text-[#E0AE6D]/85 text-[0.5rem] tracking-[0.4em] uppercase mr-2">
              Technique ·
            </span>
            {category.technique}
          </p>

          <div data-m-body className="mb-6">
            <div className="eyebrow text-[#E0AE6D]/85 text-[0.5rem] tracking-[0.4em] mb-2">
              What to look for
            </div>
            <ol className="space-y-1.5">
              {category.look_for.map((point, i) => (
                <li
                  key={i}
                  className="flex gap-3 font-sans text-[0.8rem] md:text-[0.85rem] text-ivory/75 leading-relaxed font-light"
                >
                  <span className="text-[#E0AE6D]/75 text-[0.65rem] shrink-0 w-5 pt-[3px]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ol>
          </div>

          <blockquote
            data-m-body
            className="relative border-l border-[#E0AE6D]/40 pl-4 text-serif italic text-[0.95rem] md:text-base text-[#E0AE6D]/85 leading-snug font-light mb-7"
          >
            {category.pull_quote}
          </blockquote>

          <div data-m-body className="flex flex-wrap items-center gap-5">
            <Link
              href="/shop"
              className="group relative inline-flex items-center justify-between gap-6 bg-[#E0AE6D] text-[#3F3F3F] pl-5 pr-4 py-3 hover:bg-[#F2C99E] transition-colors duration-500 shadow-[0_10px_30px_-12px_rgba(201,169,97,0.55)] whitespace-nowrap"
            >
              <span className="eyebrow text-[0.55rem] tracking-[0.35em]">
                See the pieces
              </span>
              <span className="text-sm leading-none translate-y-[-1px]">→</span>
              <span className="absolute inset-0 border border-[#F2C99E]/40 pointer-events-none" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="group inline-flex items-center gap-3 text-ivory/60 hover:text-[#F2C99E] transition-colors py-2"
            >
              <span className="w-7 h-px bg-ivory/40 group-hover:bg-[#F2C99E] transition-colors" />
              <span className="eyebrow text-[0.55rem] tracking-[0.35em]">
                Back to the weaves
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
