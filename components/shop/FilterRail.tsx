'use client';

import { STANDARD_COLORWAYS } from '@/lib/sarees';
import type { Tier, Weave } from '@/lib/sarees';

const WEAVES: Weave[] = [
  'Kanjivaram', 'Banarasi', 'Mysore Silk', 'Mangalagiri',
  'Pochampally', 'Gadwal', 'Patola', 'Fancy Sarees', 'Mixed Pattu Sarees',
];

const PRICE_BRACKETS: { id: string; label: string; min: number; max: number }[] = [
  { id: 'under-5k', label: 'Under ₹5,000', min: 0, max: 5000 },
  { id: '5-15k', label: '₹5,000 – ₹15,000', min: 5000, max: 15000 },
  { id: '15-30k', label: '₹15,000 – ₹30,000', min: 15000, max: 30000 },
  { id: '30-60k', label: '₹30,000 – ₹60,000', min: 30000, max: 60000 },
  { id: 'above-60k', label: 'Above ₹60,000', min: 60000, max: Infinity },
];

export type FilterState = {
  tiers: Tier[];
  weaves: Weave[];
  bracket: string | null;
  sale: boolean;
  colors: string[]; // STANDARD_COLORWAYS ids
  occasions: string[]; // backend occasion ids
  flags: string[]; // 'bestseller' | 'new_in'
};

export const EMPTY_FILTERS: FilterState = {
  tiers: [], weaves: [], bracket: null, sale: false, colors: [], occasions: [], flags: [],
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
  filters, counts, occasions = [], onChange, onClear,
}: {
  filters: FilterState;
  counts: {
    tier: Record<Tier, number>;
    weave: Record<string, number>;
    color: Record<string, number>;
    occasion: Record<string, number>;
    flag: Record<string, number>;
    sale: number;
  };
  occasions?: OccasionOption[];
  onChange: (next: FilterState) => void;
  onClear: () => void;
}) {
  const activeCount =
    filters.tiers.length + filters.weaves.length +
    (filters.bracket ? 1 : 0) + (filters.sale ? 1 : 0) +
    filters.colors.length + filters.occasions.length + filters.flags.length;

  const toggleWeave = (w: Weave) => onChange({
    ...filters,
    weaves: filters.weaves.includes(w) ? filters.weaves.filter((x) => x !== w) : [...filters.weaves, w],
  });
  const selectBracket = (id: string) => onChange({
    ...filters, bracket: filters.bracket === id ? null : id,
  });
  const toggleColor = (id: string) => onChange({
    ...filters,
    colors: filters.colors.includes(id)
      ? filters.colors.filter((x) => x !== id)
      : [...filters.colors, id],
  });
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
        {WEAVES.map((w) => (
          <Check
            key={w}
            label={w}
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

      <Section title="Color">
        <div className="flex flex-wrap gap-2">
          {STANDARD_COLORWAYS.map((c) => {
            const active = filters.colors.includes(c.id);
            const count = counts.color[c.id] ?? 0;
            const disabled = count === 0 && !active;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleColor(c.id)}
                aria-label={`Filter by ${c.name} (${count})`}
                aria-pressed={active}
                disabled={disabled}
                title={`${c.name} (${count})`}
                className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                  active
                    ? 'border-gray-900 p-0.5'
                    : disabled
                    ? 'border-transparent opacity-30 cursor-not-allowed p-0.5'
                    : 'border-transparent hover:border-gray-400 p-0.5'
                }`}
              >
                <span
                  className="block w-full h-full rounded-full border border-gray-200"
                  style={{ backgroundColor: c.hex }}
                />
              </button>
            );
          })}
        </div>
        {filters.colors.length > 0 && (
          <div className="mt-2 text-xs text-gray-600">
            {filters.colors
              .map((id) => STANDARD_COLORWAYS.find((c) => c.id === id)?.name)
              .filter(Boolean)
              .join(' · ')}
          </div>
        )}
      </Section>

      <Section title="Price">
        {PRICE_BRACKETS.map((b) => (
          <Radio
            key={b.id}
            label={b.label}
            checked={filters.bracket === b.id}
            onChange={() => selectBracket(b.id)}
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

export { PRICE_BRACKETS };
