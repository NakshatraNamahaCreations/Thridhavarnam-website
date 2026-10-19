'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Tier, Weave } from '@/lib/sarees';
import { storefrontInitApi, type BackendPriceBucket } from '@/lib/api';

// Static fallback used only if the categoriesApi call fails or returns
// nothing. Kept small so the rail isn't empty on the first render.
const FALLBACK_WEAVES: Weave[] = [
  'Kanjivaram', 'Banarasi', 'Mysore Silk', 'Mangalagiri',
  'Pochampally', 'Gadwal', 'Patola', 'Fancy Sarees', 'Mixed Pattu Sarees',
];

// Admin-stored category names sometimes come through as slugs
// ("fancy-sarees") or snake_case; title-case them for display without
// touching the raw value we use for filter matching.
function humanizeWeaveLabel(raw: string): string {
  const parts = raw.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().split(' ');
  return parts.map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w)).join(' ');
}

// Fallback price options used only when the admin hasn't configured
// any Shop by Price buckets yet. `max: 0` means "no upper bound".
// The real list comes from the admin's buckets so a bucket change
// (new label, new max price) flows through to this filter too.
const FALLBACK_PRICE_BRACKETS: { id: string; label: string; min: number; max: number }[] = [
  { id: 'under-5k', label: 'Under ₹5,000', min: 0, max: 5000 },
  { id: '5-15k', label: '₹5,000 – ₹15,000', min: 5000, max: 15000 },
  { id: '15-30k', label: '₹15,000 – ₹30,000', min: 15000, max: 30000 },
  { id: '30-60k', label: '₹30,000 – ₹60,000', min: 30000, max: 60000 },
  { id: 'above-60k', label: 'Above ₹60,000', min: 60000, max: 0 },
];

export type FilterState = {
  tiers: Tier[];
  weaves: Weave[];
  // Price range in rupees. 0 on either side means unbounded on that side.
  minPrice: number;
  maxPrice: number;
  sale: boolean;
  occasions: string[]; // backend occasion ids
  flags: string[]; // 'bestseller' | 'new_in'
  q: string; // free-text search from the navbar
};

export const EMPTY_FILTERS: FilterState = {
  tiers: [], weaves: [], minPrice: 0, maxPrice: 0, sale: false, occasions: [], flags: [], q: '',
};

export const CATEGORY_FLAGS: { key: string; label: string }[] = [
  { key: 'new_in', label: 'New in' },
  { key: 'bestseller', label: 'Bestseller' },
];

export type OccasionOption = { id: string; name: string };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-4 border-b border-gray-200">
      <div className="text-sm font-bold text-gray-900 mb-2.5 uppercase tracking-wide">
        {title}
      </div>
      {children}
    </div>
  );
}

function Check({
  label, checked, onChange, count,
}: { label: string; checked: boolean; onChange: () => void; count?: number }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-1">
      <span className={`w-4 h-4 border flex items-center justify-center transition-colors shrink-0 ${
        checked ? 'border-gray-900 bg-gray-900' : 'border-gray-400 group-hover:border-gray-900'
      }`}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white" aria-hidden>
            <path d="M2 6.5 5 9l5-6.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className={`text-sm leading-tight flex-1 ${checked ? 'text-gray-900 font-medium' : 'text-gray-700 group-hover:text-gray-900'}`}>
        {label}
      </span>
      {typeof count === 'number' && (
        <span className="text-xs text-gray-500 tabular-nums">{count}</span>
      )}
    </label>
  );
}

function Radio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-1">
      <span className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
        checked ? 'border-gray-900' : 'border-gray-400 group-hover:border-gray-900'
      }`}>
        {checked && <span className="w-2 h-2 rounded-full bg-gray-900" />}
      </span>
      <input type="radio" checked={checked} onChange={onChange} className="sr-only" />
      <span className={`text-sm leading-tight flex-1 ${checked ? 'text-gray-900 font-medium' : 'text-gray-700 group-hover:text-gray-900'}`}>
        {label}
      </span>
    </label>
  );
}

export default function FilterRail({
  filters, counts, occasions = [], priceBuckets = [], onChange, onClear,
}: {
  filters: FilterState;
  counts: {
    tier: Record<Tier, number>;
    weave: Record<string, number>;
    occasion: Record<string, number>;
    flag: Record<string, number>;
    sale: number;
  };
  occasions?: OccasionOption[];
  // Admin-managed "Shop by Price" buckets. When present they drive
  // the Price radios so changes in the admin panel show up here
  // without a code change.
  priceBuckets?: BackendPriceBucket[];
  onChange: (next: FilterState) => void;
  onClear: () => void;
}) {
  const hasPriceFilter = filters.minPrice > 0 || filters.maxPrice > 0;
  const activeCount =
    filters.tiers.length + filters.weaves.length +
    (hasPriceFilter ? 1 : 0) + (filters.sale ? 1 : 0) +
    filters.occasions.length + filters.flags.length;

  // Weave options come from the backend Categories taxonomy so adding /
  // renaming a category in the admin panel is reflected here without a
  // code change. Fetch fires once on mount. Until it resolves (or if it
  // fails) we fall back to the static list so the section is never empty.
  const [fetchedWeaves, setFetchedWeaves] = useState<Weave[]>([]);
  useEffect(() => {
    let cancelled = false;
    storefrontInitApi
      .get()
      .then(({ categories }) => {
        if (cancelled) return;
        setFetchedWeaves(categories.filter((c) => c.name).map((c) => c.name));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  const weaveOptions =
    fetchedWeaves.length > 0 ? fetchedWeaves : FALLBACK_WEAVES;

  // Build the price radio list from the admin's active buckets
  // (sorted by `order`). Fall back to the static ranges if the
  // admin hasn't configured any yet.
  const priceOptions = useMemo(() => {
    const active = priceBuckets.filter((b) => b.active !== false);
    if (active.length === 0) return FALLBACK_PRICE_BRACKETS;
    return active
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((b) => ({
        id: b.id,
        label: b.label ?? '',
        min: b.minPrice ?? 0,
        max: b.maxPrice ?? 0,
      }));
  }, [priceBuckets]);

  const toggleWeave = (w: Weave) => onChange({
    ...filters,
    weaves: filters.weaves.includes(w) ? filters.weaves.filter((x) => x !== w) : [...filters.weaves, w],
  });
  const selectBracket = (min: number, max: number) => {
    // Toggle off when the user clicks the already-selected radio.
    const same = filters.minPrice === min && filters.maxPrice === max;
    onChange({
      ...filters,
      minPrice: same ? 0 : min,
      maxPrice: same ? 0 : max,
    });
  };
  const toggleOccasion = (id: string) => onChange({
    ...filters,
    occasions: filters.occasions.includes(id)
      ? filters.occasions.filter((x) => x !== id)
      : [...filters.occasions, id],
  });
  const toggleFlag = (id: string) => onChange({
    ...filters,
    flags: filters.flags.includes(id)
      ? filters.flags.filter((x) => x !== id)
      : [...filters.flags, id],
  });

  return (
    <aside className="w-full lg:w-[240px] shrink-0">
      <div className="flex items-center justify-between pb-3 border-b-2 border-gray-900">
        <div className="text-base font-bold text-gray-900 uppercase tracking-wide">Filters</div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-bold text-[#75001F] hover:underline uppercase"
          >
            Clear ({activeCount})
          </button>
        )}
      </div>

      <Section title="Category">
        {CATEGORY_FLAGS.map((f) => (
          <Check
            key={f.key}
            label={f.label}
            checked={filters.flags.includes(f.key)}
            onChange={() => toggleFlag(f.key)}
            count={counts.flag?.[f.key] ?? 0}
          />
        ))}
      </Section>

      <Section title="Weave">
        {weaveOptions.map((w) => (
          <Check
            key={w}
            label={humanizeWeaveLabel(w)}
            checked={filters.weaves.includes(w)}
            onChange={() => toggleWeave(w)}
            count={counts.weave[w] ?? 0}
          />
        ))}
      </Section>

      {occasions.length > 0 && (
        <Section title="Occasion">
          {occasions.map((o) => (
            <Check
              key={o.id}
              label={o.name}
              checked={filters.occasions.includes(o.id)}
              onChange={() => toggleOccasion(o.id)}
              count={counts.occasion?.[o.id] ?? 0}
            />
          ))}
        </Section>
      )}

      <Section title="Price">
        {priceOptions.map((b) => (
          <Radio
            key={b.id}
            label={b.label}
            checked={filters.minPrice === b.min && filters.maxPrice === b.max}
            onChange={() => selectBracket(b.min, b.max)}
          />
        ))}
      </Section>

      <Section title="Offers">
        <Check
          label="On sale"
          checked={filters.sale}
          onChange={() => onChange({ ...filters, sale: !filters.sale })}
          count={counts.sale}
        />
      </Section>
    </aside>
  );
}

