'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useScrollLock } from '@/lib/scroll-lock';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  TIERS,
  STANDARD_COLORWAYS,
  sareeMatchesColor,
  getSareeColorGroup,
  type Saree,
} from '@/lib/sarees';
import type { Tier, Weave } from '@/lib/sarees';
import { productsApi, occasionsApi, backendToSaree, type BackendOccasion } from '@/lib/api';
import ProductCard from './ProductCard';
import FilterRail, {
  EMPTY_FILTERS,
  PRICE_BRACKETS,
  CATEGORY_FLAGS,
  type FilterState,
} from './FilterRail';
import WishlistPanel from './WishlistPanel';
import BagPanel from './BagPanel';
import SaleHero from './SaleHero';
import CategoryStory from './CategoryStory';
import CategoryTiles from './CategoryTiles';
import ExploreMore from './ExploreMore';
import SeoContent from './SeoContent';
import TrustBanner from './TrustBanner';
import ExpertTips from './ExpertTips';

type Sort = 'curated' | 'price-asc' | 'price-desc' | 'name';

const SORT_LABELS: Record<Sort, string> = {
  curated: 'Featured',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  name: 'Name: A to Z',
};

// "Sale" is controlled from the admin panel — a saree appears here only if
// the admin ticked the "Sale" flag on it.
const isOnSale = (s: Saree) => Array.isArray(s.flags) && s.flags.includes('sale');

function parseFiltersFromSearch(params: URLSearchParams): FilterState {
  const tierCsv = params.get('tier');
  const weaveCsv = params.get('weave');
  const bracket = params.get('bracket');
  const sale = params.get('sale') === '1';
  const colorCsv = params.get('color');
  const occasionCsv = params.get('occasion');
  const flagCsv = params.get('flag');

  const tiers = tierCsv
    ? (tierCsv.split(',').filter((t) => t in TIERS) as Tier[])
    : [];
  const weaves = weaveCsv
    ? (weaveCsv.split(',') as Weave[])
    : [];
  const validColorIds = new Set(STANDARD_COLORWAYS.map((c) => c.id));
  const colors = colorCsv
    ? colorCsv.split(',').filter((id) => validColorIds.has(id))
    : [];
  const occasions = occasionCsv ? occasionCsv.split(',').filter(Boolean) : [];
  const validFlags = new Set(CATEGORY_FLAGS.map((f) => f.key));
  const flags = flagCsv ? flagCsv.split(',').filter((f) => validFlags.has(f)) : [];

  return { tiers, weaves, bracket, sale, colors, occasions, flags };
}

function writeFiltersToSearch(
  params: URLSearchParams,
  filters: FilterState,
): URLSearchParams {
  const next = new URLSearchParams(params);
  if (filters.tiers.length) next.set('tier', filters.tiers.join(','));
  else next.delete('tier');
  if (filters.weaves.length) next.set('weave', filters.weaves.join(','));
  else next.delete('weave');
  if (filters.bracket) next.set('bracket', filters.bracket);
  else next.delete('bracket');
  if (filters.sale) next.set('sale', '1');
  else next.delete('sale');
  if (filters.colors.length) next.set('color', filters.colors.join(','));
  else next.delete('color');
  if (filters.occasions.length) next.set('occasion', filters.occasions.join(','));
  else next.delete('occasion');
  if (filters.flags.length) next.set('flag', filters.flags.join(','));
  else next.delete('flag');
  return next;
}

export default function ShopView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const mode = searchParams.get('wishlist') === '1'
    ? 'wishlist'
    : searchParams.get('bag') === '1'
    ? 'bag'
    : 'grid';

  const filters = useMemo(
    () => parseFiltersFromSearch(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  // Validate against SORT_LABELS so a stray `?sort=trending` (or anything
  // else not in the canonical set) falls back to the default instead of
  // leaving the trigger label blank.
  const rawSort = searchParams.get('sort');
  const sort: Sort =
    rawSort && rawSort in SORT_LABELS ? (rawSort as Sort) : 'curated';

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Catalogue is 100% backend-driven — no static SAREES fallback. `null`
  // while the fetch is in flight; `[]` if the backend returns nothing or
  // errors, which renders the empty state.
  const [catalog, setCatalog] = useState<Saree[] | null>(null);
  const [occasions, setOccasions] = useState<BackendOccasion[]>([]);
  useEffect(() => {
    let cancelled = false;
    productsApi
      .list()
      .then((rows) => {
        if (cancelled) return;
        setCatalog(rows.map(backendToSaree));
      })
      .catch(() => {
        if (!cancelled) setCatalog([]);
      });
    occasionsApi
      .list()
      .then((rows) => {
        if (!cancelled) setOccasions(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Lock body scroll (with Lenis cooperation — see lib/scroll-lock.ts) and
  // listen for Escape while the mobile filter drawer is open. The overlay
  // is tagged with `data-lenis-prevent` so Lenis doesn't drive the page
  // underneath while the user is scrolling the filter list.
  useScrollLock(filterDrawerOpen);
  useEffect(() => {
    if (!filterDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFilterDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filterDrawerOpen]);

  const updateUrl = useCallback(
    (next: URLSearchParams) => {
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const onFilterChange = useCallback(
    (next: FilterState) => {
      const params = writeFiltersToSearch(
        new URLSearchParams(searchParams.toString()),
        next,
      );
      updateUrl(params);
    },
    [searchParams, updateUrl],
  );

  const onClearFilters = useCallback(() => {
    onFilterChange(EMPTY_FILTERS);
  }, [onFilterChange]);

  const onSortChange = useCallback(
    (s: Sort) => {
      const params = new URLSearchParams(searchParams.toString());
      if (s === 'curated') params.delete('sort');
      else params.set('sort', s);
      updateUrl(params);
    },
    [searchParams, updateUrl],
  );

  // ── Filter + sort the catalog ─────────────────────────────────────────
  const filtered = useMemo(() => {
    let items: Saree[] = (catalog ?? []).slice();

    if (filters.tiers.length) {
      items = items.filter((s) => filters.tiers.includes(s.tier));
    }
    if (filters.weaves.length) {
      items = items.filter((s) => filters.weaves.includes(s.weave));
    }
    if (filters.bracket) {
      const bracket = PRICE_BRACKETS.find((b) => b.id === filters.bracket);
      if (bracket) {
        items = items.filter(
          (s) => s.price >= bracket.min && s.price < bracket.max,
        );
      }
    }
    if (filters.sale) {
      items = items.filter(isOnSale);
    }
    if (filters.colors.length) {
      items = items.filter((s) =>
        filters.colors.some((id) => sareeMatchesColor(s, id)),
      );
    }
    if (filters.occasions.length) {
      items = items.filter((s) => s.occasion && filters.occasions.includes(s.occasion));
    }
    if (filters.flags.length) {
      items = items.filter((s) => Array.isArray(s.flags) && filters.flags.some((f) => s.flags!.includes(f)));
    }

    switch (sort) {
      case 'price-asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return items;
  }, [filters, sort, catalog]);

  // ── Pre-computed counts for the filter rail ───────────────────────────
  const counts = useMemo(() => {
    const tierCounts: Record<Tier, number> = {
      bridal: 0,
      festive: 0,
      everyday: 0,
    };
    const weaveCounts: Record<string, number> = {};
    const colorCounts: Record<string, number> = {};
    const occasionCounts: Record<string, number> = {};
    const flagCounts: Record<string, number> = {};
    let saleCount = 0;
    (catalog ?? []).forEach((s) => {
      if (s.tier in tierCounts) tierCounts[s.tier] += 1;
      if (s.weave) weaveCounts[s.weave] = (weaveCounts[s.weave] ?? 0) + 1;
      if (isOnSale(s)) saleCount += 1;
      const group = getSareeColorGroup(s);
      colorCounts[group] = (colorCounts[group] ?? 0) + 1;
      if (s.occasion) occasionCounts[s.occasion] = (occasionCounts[s.occasion] ?? 0) + 1;
      if (Array.isArray(s.flags)) {
        s.flags.forEach((f) => { flagCounts[f] = (flagCounts[f] ?? 0) + 1; });
      }
    });
    return { tier: tierCounts, weave: weaveCounts, color: colorCounts, occasion: occasionCounts, flag: flagCounts, sale: saleCount };
  }, [catalog]);

  // ── Page heading derived from filter state ────────────────────────────
  const heading = useMemo(() => {
    if (mode === 'wishlist') return { title: 'Wishlist', sub: '' };
    if (mode === 'bag') return { title: 'Shopping Bag', sub: '' };
    if (filters.sale) return { title: 'Sarees on Sale', sub: '' };
    if (filters.tiers.length === 1) {
      const t = TIERS[filters.tiers[0]];
      return { title: `${t.sub} Sarees`, sub: '' };
    }
    if (filters.weaves.length === 1) {
      return { title: `${filters.weaves[0]} Sarees`, sub: '' };
    }
    return { title: 'All Sarees', sub: '' };
  }, [filters, mode]);

  // SaleHero only on the default browse view — promoting the sale on top
  // of an already-filtered view (e.g. ?sale=1 or ?weave=Banarasi) is noise.
  const isDefaultBrowse =
    mode === 'grid' &&
    !filters.tiers.length &&
    !filters.weaves.length &&
    !filters.bracket &&
    !filters.sale &&
    !filters.colors.length &&
    !filters.occasions.length &&
    !filters.flags.length;

  // Filter-active flag — true when at least one filter chip is on. Drives
  // the "Filtered by:" chip row inside the header.
  const hasActiveFilters =
    filters.tiers.length > 0 ||
    filters.weaves.length > 0 ||
    !!filters.bracket ||
    filters.sale ||
    filters.colors.length > 0 ||
    filters.occasions.length > 0 ||
    filters.flags.length > 0;

  // ──────────────────────────────────────────────────────────────────────
  if (mode === 'wishlist') return <WishlistPanel heading={heading} />;
  if (mode === 'bag') return <BagPanel heading={heading} />;

  return (
    <div className="bg-white min-h-screen text-gray-900">
      {isDefaultBrowse && <SaleHero />}
      {isDefaultBrowse && <CategoryTiles />}

      {/* Category story — only when viewing a single weave and no other
          filters are layered on. Keeps the heritage copy from showing up
          on "Sale" or multi-weave views where it would read as noise. */}
      {filters.weaves.length === 1 &&
        !filters.tiers.length &&
        !filters.bracket &&
        !filters.sale &&
        !filters.colors.length && (
          <CategoryStory weave={filters.weaves[0]} />
        )}

      {/* Page header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-4 lg:py-5">
          <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-2">
            <Link href="/home" className="hover:text-gray-900">Home</Link>
            <span className="mx-1.5">/</span>
            <span className="text-gray-900">{heading.title}</span>
          </nav>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
              {heading.title}
              <span className="ml-2 text-sm text-gray-500 font-normal tabular-nums">
                ({filtered.length} {filtered.length === 1 ? 'item' : 'items'})
              </span>
            </h1>
          </div>

          {hasActiveFilters ? (
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mr-1">
                Filtered by:
              </span>
              {filters.tiers.map((t) => (
                <FilterChip
                  key={`tier-${t}`}
                  label={TIERS[t].sub}
                  onRemove={() => onFilterChange({ ...filters, tiers: filters.tiers.filter((x) => x !== t) })}
                />
              ))}
              {filters.weaves.map((w) => (
                <FilterChip
                  key={`weave-${w}`}
                  label={w}
                  onRemove={() => onFilterChange({ ...filters, weaves: filters.weaves.filter((x) => x !== w) })}
                />
              ))}
              {filters.bracket && (
                <FilterChip
                  label={PRICE_BRACKETS.find((b) => b.id === filters.bracket)?.label ?? 'Price'}
                  onRemove={() => onFilterChange({ ...filters, bracket: null })}
                />
              )}
              {filters.sale && (
                <FilterChip
                  label="On sale"
                  onRemove={() => onFilterChange({ ...filters, sale: false })}
                />
              )}
              {filters.occasions.map((oid) => {
                const label = occasions.find((o) => o.id === oid)?.name ?? oid;
                return (
                  <FilterChip
                    key={`occasion-${oid}`}
                    label={label}
                    onRemove={() => onFilterChange({ ...filters, occasions: filters.occasions.filter((x) => x !== oid) })}
                  />
                );
              })}
              {filters.flags.map((fid) => {
                const label = CATEGORY_FLAGS.find((x) => x.key === fid)?.label ?? fid;
                return (
                  <FilterChip
                    key={`flag-${fid}`}
                    label={label}
                    onRemove={() => onFilterChange({ ...filters, flags: filters.flags.filter((x) => x !== fid) })}
                  />
                );
              })}
              <button
                type="button"
                onClick={onClearFilters}
                className="text-xs font-bold text-[#75001F] hover:underline ml-1 uppercase"
              >
                Clear All
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {/* Sort + filter bar */}
      <div className="border-b border-gray-200 sticky top-0 z-20 bg-white/95 backdrop-blur-sm">
        <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            className="lg:hidden flex items-center gap-1.5 border border-gray-300 px-3 py-1.5 text-sm font-bold text-gray-900 hover:border-gray-900"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M3 6h18M6 12h12M10 18h4" strokeLinecap="round" />
            </svg>
            FILTERS
          </button>
          <div className="hidden lg:block text-sm text-gray-600">
            <strong className="text-gray-900 font-bold">{filtered.length}</strong> {filtered.length === 1 ? 'item' : 'items'}
          </div>

          <div className="flex items-center gap-2 text-sm ml-auto">
            <span className="text-gray-600 hidden sm:inline font-medium">Sort by:</span>
            <SortSelect value={sort} onChange={onSortChange} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-5 lg:py-6">
        <div className="flex gap-6 lg:gap-8 items-start">
          {/* Filter rail — `top-[180px]` parks it just below the fixed
              site nav (~176px tall on lg) so it's actually visible when
              stuck, not hidden behind the nav. `overflow-x-hidden`
              suppresses the horizontal scrollbar that the CSS spec
              auto-promotes whenever `overflow-y` is `auto`, which was
              clipping the filter counts on the right. */}
          <div className="hidden lg:block w-[260px] shrink-0 sticky top-[180px] max-h-[calc(100vh-200px)] overflow-y-auto overflow-x-hidden pr-1">
            <FilterRail
              filters={filters}
              counts={counts}
              occasions={occasions}
              onChange={onFilterChange}
              onClear={onClearFilters}
            />
          </div>

          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              (() => {
                // "Coming Soon" panel fires only when the user is looking at
                // a single weave with nothing else applied — i.e. they picked
                // a category from the nav / rail and it has no products yet.
                // Any other empty state (weave + colour + bracket, etc.) is
                // more likely an over-filtered view, so we keep the generic
                // "adjust filters" copy for those cases.
                const isSoloWeave =
                  filters.weaves.length === 1 &&
                  filters.tiers.length === 0 &&
                  filters.colors.length === 0 &&
                  filters.occasions.length === 0 &&
                  filters.flags.length === 0 &&
                  !filters.bracket &&
                  !filters.sale;
                if (isSoloWeave) {
                  const weaveName = filters.weaves[0];
                  return (
                    <div className="text-center py-16 max-w-md mx-auto">
                      <div className="eyebrow text-[0.65rem] tracking-[0.4em] text-maroon/75 mb-3 font-semibold uppercase">
                        {weaveName} · Unwrapping soon
                      </div>
                      <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink mb-3">
                        Almost ready to drape.
                      </h2>
                      <p className="text-sm text-ink/65 leading-relaxed mb-6">
                        Our {weaveName} collection is still on the loom. Check
                        back soon — or unfold the rest of the atelier in the
                        meantime.
                      </p>
                      <button
                        type="button"
                        onClick={onClearFilters}
                        className="inline-block bg-gray-900 text-white px-6 py-2.5 text-sm font-bold uppercase tracking-wide hover:bg-[#75001F] transition-colors"
                      >
                        Explore all sarees
                      </button>
                    </div>
                  );
                }
                return (
                  <div className="text-center py-16 max-w-md mx-auto">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">No results found</h2>
                    <p className="text-sm text-gray-600 mb-5">
                      Try adjusting your filters to see more sarees.
                    </p>
                    <button
                      type="button"
                      onClick={onClearFilters}
                      className="inline-block bg-gray-900 text-white px-6 py-2.5 text-sm font-bold uppercase tracking-wide hover:bg-[#75001F] transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                );
              })()
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-6 lg:gap-x-4 lg:gap-y-7">
                {filtered.map((saree, i) => (
                  <Fragment key={saree.id}>
                    <ProductCard saree={saree} priority={i < 4} />
                    {i === 7 && filtered.length > 8 && <TrustBanner />}
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* On a filtered view the category tiles render here, BELOW the grid,
          so the visitor sees their actual results first. */}
      {!isDefaultBrowse && <CategoryTiles />}

      {/* Bottom sections — shown on every URL for cross-nav and SEO. */}
      <ExploreMore />
      <ExpertTips />
      <SeoContent />

      {/* Filter drawer — mobile */}
      {filterDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" data-lenis-prevent>
          <button
            type="button"
            aria-label="Close filters"
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setFilterDrawerOpen(false)}
          />
          <div className="w-[320px] max-w-[85vw] bg-white h-full overflow-y-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-base font-bold text-gray-900 uppercase tracking-wide">Filters</div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setFilterDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900"
              >
                ✕
              </button>
            </div>
            <FilterRail
              filters={filters}
              counts={counts}
              occasions={occasions}
              onChange={onFilterChange}
              onClear={onClearFilters}
            />
            <button
              type="button"
              onClick={() => setFilterDrawerOpen(false)}
              className="mt-4 w-full bg-gray-900 text-white py-3 text-sm font-bold uppercase tracking-wide hover:bg-[#75001F] transition-colors"
            >
              Show {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-300 px-2 py-1 text-xs font-medium text-gray-900">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${label}`}
        className="text-gray-500 hover:text-[#75001F] text-base leading-none ml-0.5"
      >
        ×
      </button>
    </span>
  );
}

/**
 * Custom sort dropdown — replaces a native <select>. Native <option>
 * elements ignore Tailwind text-sm on mobile (Safari/Chrome render the
 * picker with the system font size, which made the options balloon to
 * ~24px on phones while the rest of the page stayed at 13px). Rendering
 * the panel as plain HTML keeps the option font-size consistent across
 * breakpoints. The trigger button mirrors the previous <select>'s
 * styling so desktop is visually unchanged.
 */
function SortSelect({
  value,
  onChange,
}: {
  value: Sort;
  onChange: (s: Sort) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center justify-between gap-2 bg-white border border-gray-300 pl-3 pr-3 py-1.5 text-sm font-semibold text-gray-900 hover:border-gray-900 cursor-pointer focus:outline-none focus:border-gray-900 min-w-[140px]"
      >
        <span className="truncate">{SORT_LABELS[value]}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`text-gray-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          <path d="M3 4.5 6 8l3-3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-1 min-w-[180px] bg-white border border-gray-200 shadow-lg z-30 py-1"
        >
          {(Object.keys(SORT_LABELS) as Sort[]).map((s) => {
            const selected = s === value;
            return (
              <li key={s}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(s);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    selected
                      ? 'bg-gray-100 font-semibold text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {SORT_LABELS[s]}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
