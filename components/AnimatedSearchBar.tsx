'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

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

export default function AnimatedSearchBar() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const phraseRef = useRef(0);
  const charRef = useRef(0);
  const phaseRef = useRef<'typing' | 'holding' | 'erasing'>('typing');
  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Pause the animation if the user has typed anything or focused the input.
  const shouldAnimate = !focused && value.length === 0;

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
    const lower = q.toLowerCase();
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
    <form
      role="search"
      onSubmit={onSubmit}
      className="flex items-stretch bg-gray-100 border border-transparent hover:border-gray-300 focus-within:border-gray-400 transition-colors w-full"
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={displayPlaceholder}
        aria-label="Search sarees"
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
