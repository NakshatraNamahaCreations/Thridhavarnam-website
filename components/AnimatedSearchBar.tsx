'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { productsApi, storefrontInitApi, backendToSaree } from '@/lib/api';
import { formatINR, productSlug, type Saree } from '@/lib/sarees';
import { getProductHero } from '@/lib/product-images';
import { PRODUCT_BLUR_DATA_URL } from '@/lib/image-blur';

/**
 * AnimatedSearchBar — typewriter placeholder mirroring the Kalki Fashion
 * search-bar pattern. The placeholder cycles through saree categories so
 * the visitor sees a live suggestion of what they could search for.
 *
 * Animation stops the moment the input gains focus or has a value, so the
 * typewriter never fights the user's own typing.
 */

const PHRASES = [
  'Kanjeevaram sarees',
  'Banarasi sarees',
  'Mysore Silk',
  'Mangalagiri sarees',
  'Pochampally ikats',
  'Gadwal sarees',
  'Patola sarees',
  'Fancy Sarees',
  'Mixed Pattu',
  'Bridal sarees',
  'Sale',
];

// Animation timings — short enough to feel alive, long enough to read.
const TYPE_MS = 70;
const ERASE_MS = 35;
const HOLD_MS = 1400;

// Max product suggestions rendered in the dropdown. Beyond this the
// "See all results" footer carries the user through to the shop view.
const MAX_SUGGESTIONS = 6;

export default function AnimatedSearchBar() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [catalog, setCatalog] = useState<Saree[] | null>(null);
  const [open, setOpen] = useState(false);
  const phraseRef = useRef(0);
  const charRef = useRef(0);
  const phaseRef = useRef<'typing' | 'holding' | 'erasing'>('typing');
  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Pause the animation if the user has typed anything or focused the input.
  const shouldAnimate = !focused && value.length === 0;

  // Lazy-load the catalogue on the first focus so the navbar's initial
  // paint doesn't block on it. Cached after the first fetch.
  useEffect(() => {
    if (!focused || catalog !== null) return;
    let cancelled = false;
    Promise.all([
      productsApi.list(),
      storefrontInitApi.get().catch(() => ({ categories: [], occasions: [], banners: [], priceBuckets: [], coupons: [] })),
    ])
      .then(([rows, init]) => {
        if (cancelled) return;
        const categoryMap: Record<string, string> = {};
        for (const c of init.categories) {
          if (c.id && c.name) categoryMap[c.id] = c.name;
        }
        setCatalog(rows.map((p) => backendToSaree(p, categoryMap)));
      })
      .catch(() => {
        if (!cancelled) setCatalog([]);
      });
    return () => {
      cancelled = true;
    };
  }, [focused, catalog]);

  // Close the dropdown on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Suggestions — token-match the query across name + weave + occasion so
  // "red kanjivaram" narrows instead of OR-ing. Capped at MAX_SUGGESTIONS.
  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q || !catalog) return [] as Saree[];
    const tokens = q.split(/\s+/).filter(Boolean);
    const matched: Saree[] = [];
    for (const s of catalog) {
      const hay = `${s.name} ${s.weave ?? ''} ${s.occasion ?? ''} ${s.tier ?? ''}`.toLowerCase();
      if (tokens.every((t) => hay.includes(t))) {
        matched.push(s);
        if (matched.length >= MAX_SUGGESTIONS) break;
      }
    }
    return matched;
  }, [value, catalog]);

  const dropdownOpen = open && focused && value.trim().length > 0;

  useEffect(() => {
    if (!shouldAnimate) {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const tick = () => {
      const phrase = PHRASES[phraseRef.current];

      if (phaseRef.current === 'typing') {
        if (charRef.current < phrase.length) {
          charRef.current += 1;
          setPlaceholder(phrase.slice(0, charRef.current));
          timerRef.current = window.setTimeout(tick, TYPE_MS);
        } else {
          phaseRef.current = 'holding';
          timerRef.current = window.setTimeout(tick, HOLD_MS);
        }
      } else if (phaseRef.current === 'holding') {
        phaseRef.current = 'erasing';
        timerRef.current = window.setTimeout(tick, ERASE_MS);
      } else {
        if (charRef.current > 0) {
          charRef.current -= 1;
          setPlaceholder(phrase.slice(0, charRef.current));
          timerRef.current = window.setTimeout(tick, ERASE_MS);
        } else {
          phaseRef.current = 'typing';
          phraseRef.current = (phraseRef.current + 1) % PHRASES.length;
          timerRef.current = window.setTimeout(tick, 250);
        }
      }
    };

    tick();
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [shouldAnimate]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    setOpen(false);
    inputRef.current?.blur();
    // Best-effort search: map common weave names to the shop's weave filter,
    // otherwise pass the query through. The shop catalogue is small enough
    // that this is good enough; can be replaced with a real search endpoint.
    const KNOWN_WEAVES: Record<string, string> = {
      banarasi: 'Banarasi',
      kanjivaram: 'Kanjivaram',
      kanjeevaram: 'Kanjivaram',
      mysore: 'Mysore Silk',
      'mysore silk': 'Mysore Silk',
      mangalagiri: 'Mangalagiri',
      pochampally: 'Pochampally',
      gadwal: 'Gadwal',
      patola: 'Patola',
      fancy: 'Fancy Sarees',
      'fancy sarees': 'Fancy Sarees',
      'mixed pattu': 'Mixed Pattu Sarees',
      'mixed pattu sarees': 'Mixed Pattu Sarees',
      pattu: 'Mixed Pattu Sarees',
    };
    // Normalise so "Kanjeevaram sarees" (what the typewriter placeholder
    // shows) still matches the bare-word keys in KNOWN_WEAVES. Collapse
    // whitespace and strip a trailing "saree" / "sarees" before lookup.
    const lower = q
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/\s+sarees?$/, '')
      .trim();
    const matchedWeave = KNOWN_WEAVES[lower];
    if (matchedWeave) {
      router.push(`/shop?weave=${encodeURIComponent(matchedWeave)}`);
    } else if (lower === 'bridal' || lower === 'wedding') {
      router.push('/shop?tier=bridal');
    } else if (lower === 'festive' || lower === 'party' || lower === 'party wear') {
      router.push('/shop?tier=festive');
    } else if (lower === 'sale') {
      router.push('/shop?sale=1');
    } else {
      router.push(`/shop?q=${encodeURIComponent(q)}`);
    }
  };

  // Show "Search for {phrase}" while idle; just "Search for sarees…" on focus.
  const displayPlaceholder = focused
    ? 'Search for sarees…'
    : placeholder
    ? `Search for ${placeholder}`
    : 'Search for sarees…';

  return (
    <div ref={rootRef} className="relative w-full">
      <form
        role="search"
        onSubmit={onSubmit}
        className="flex items-stretch bg-gray-100 border border-transparent hover:border-gray-300 focus-within:border-gray-400 transition-colors w-full"
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setFocused(true);
            if (value.trim()) setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
          placeholder={displayPlaceholder}
          aria-label="Search sarees"
          aria-autocomplete="list"
          aria-expanded={dropdownOpen}
          className="flex-1 min-w-0 bg-transparent pl-4 pr-3 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="shrink-0 w-12 bg-maroon-deep text-ivory flex items-center justify-center hover:bg-maroon transition-colors"
        >
          <SearchIcon />
        </button>
      </form>

      {dropdownOpen && (
        <div
          role="listbox"
          // Keep focus on the input when clicking a suggestion — otherwise
          // the input's onBlur fires between mousedown and click, unmounts
          // the dropdown, and the navigation never happens.
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 shadow-lg z-50 max-h-[70vh] overflow-y-auto"
        >
          {catalog === null ? (
            <div className="px-4 py-6 text-sm text-gray-500 text-center">Searching…</div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-500 text-center">
              No matches for "{value.trim()}".
            </div>
          ) : (
            <>
              <ul className="py-1">
                {suggestions.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/shop/${productSlug(s)}`}
                      role="option"
                      onClick={() => {
                        setOpen(false);
                        setValue('');
                      }}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <div className="relative w-12 h-16 shrink-0 bg-gray-100 overflow-hidden">
                        <Image
                          src={getProductHero(s)}
                          alt=""
                          fill
                          sizes="48px"
                          placeholder="blur"
                          blurDataURL={PRODUCT_BLUR_DATA_URL}
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">{s.name}</div>
                        <div className="text-xs text-gray-500 truncate">{s.weave}</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 shrink-0 tabular-nums">
                        {formatINR(s.price)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push(`/shop?q=${encodeURIComponent(value.trim())}`);
                }}
                className="block w-full border-t border-gray-200 px-4 py-2.5 text-xs font-semibold text-maroon-deep hover:bg-gray-50 text-center uppercase tracking-wide"
              >
                See all results for "{value.trim()}"
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
