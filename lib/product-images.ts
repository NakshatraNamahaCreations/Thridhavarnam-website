import { SAREES, getColorways, type Weave } from './sarees';

type Saree = (typeof SAREES)[number];

/**
 * Per-product image map.
 *
 * Source-of-truth for which photographs map to which saree, independent of
 * the generic `saree.image` catalog placeholder that lives in `lib/sarees.ts`.
 * When real product photography is added, extend the entries here — every
 * card and the PDP gallery read through these helpers.
 *
 * `hero` is the primary product photograph used on cards and as the first
 * gallery frame. `extras` are additional shots that go into the PDP gallery
 * (back view, detail, etc.). Order matters: extras are shown after the hero
 * in the thumbnail rail.
 */
const PRODUCT_IMAGES: Record<string, { hero: string; extras?: string[] }> = {
  'banarasi-raktarani': {
    hero: '/bestsellers/raktharani%20banarasi.webp',
    extras: ['/newarrivals/sindhoori%20banarasi.webp'],
  },
  'kanjivaram-mayura': {
    hero: '/bestsellers/Mayura%20kanjee.webp',
    extras: ['/newarrivals/neelambari%20kanjivaram.webp'],
  },
  'fancy-haldi': {
    hero: '/Partysarees/P1.webp',
  },
  'fancy-mehndi': {
    hero: '/Partysarees/p2.webp',
  },
  'fancy-cocktail': {
    hero: '/Partysarees/p3.webp',
  },
  'patola-rasleela': {
    hero: '/bestsellers/Rasleela%20patola2.webp',
    extras: ['/newarrivals/rangraj%20patola.webp'],
  },
  'mysore-chandrika': {
    hero: '/bestsellers/chandrika%20mysuru.webp',
  },
  // ── Mangalagiri ──
  'mangalagiri-megha': {
    hero: '/mangalagiri%20sarees/m1.webp',
  },
  'mangalagiri-chandni': {
    hero: '/mangalagiri%20sarees/m2.webp',
  },
  'mangalagiri-tulsi': {
    hero: '/mangalagiri%20sarees/m3.webp',
  },
  // ── Pochampally ──
  'pochampally-aakash': {
    hero: '/pochampally%20sarees/po1.webp',
  },
  'pochampally-bandhakala': {
    hero: '/pochampally%20sarees/po2.webp',
  },
  'pochampally-meghala': {
    hero: '/pochampally%20sarees/po3.webp',
  },
  // ── Gadwal ──
  'gadwal-konark': {
    hero: '/Gadwal%20sarees/g1.webp',
  },
  'gadwal-krishna': {
    hero: '/Gadwal%20sarees/g2.webp',
  },
  'gadwal-aishwarya': {
    hero: '/Gadwal%20sarees/g3.webp',
  },
  // ── Mixed Pattu Sarees ──
  'mixedpattu-katha': {
    hero: '/pattu%20sarees/pa1.webp',
  },
  'mixedpattu-mor': {
    hero: '/pattu%20sarees/pa2.webp',
  },
  'mixedpattu-ramayana': {
    hero: '/pattu%20sarees/pa3.webp',
  },
  'mixedpattu-shubh': {
    hero: '/pattu%20sarees/pa4.webp',
  },
  // Products without dedicated photography fall through to the generic
  // catalog image; their gallery still pulls in the weave-story shot and
  // the by-weave swatch so the gallery is never four identical frames.
};

/**
 * Weave-level fallback imagery — used as additional gallery frames so every
 * product page can show 3-4 distinct photographs even when only the
 * generic catalog image is mapped for that specific id.
 */
// Weave-level "context" shot from /public/story/. Files on disk are named
// without a "story" suffix (banarasi.png, kanjeevaram.png, etc.) — the
// older "*story.png" naming pointed at files that were never there. For
// weaves without a dedicated /story/ shot we fall back to the by-weave
// swatch so the gallery still has a frame instead of a 404.
const WEAVE_STORY: Record<Weave, string> = {
  Banarasi: '/story/banarasi.webp',
  Kanjivaram: '/story/kanjeevaram.webp',
  'Mysore Silk': '/story/Mysore%20silk.webp',
  Mangalagiri: '/story/Mangalgiri.webp',
  Pochampally: '/Byweaves/Pochampally.webp',
  Gadwal: '/story/Gadwal.webp',
  Patola: '/Byweaves/Patola.webp',
  'Fancy Sarees': '/Byweaves/fancy-saree.webp',
  'Mixed Pattu Sarees': '/Byweaves/Mixed-pattu.webp',
};

const WEAVE_SWATCH: Record<Weave, string> = {
  Banarasi: '/Byweaves/banarasi.webp',
  Kanjivaram: '/Byweaves/kanjeevaram.webp',
  'Mysore Silk': '/Byweaves/Mysore%20silk.webp',
  Mangalagiri: '/Byweaves/mangalagiri.webp',
  Pochampally: '/Byweaves/Pochampally.webp',
  Gadwal: '/Byweaves/Gadwal.webp',
  Patola: '/Byweaves/Patola.webp',
  'Fancy Sarees': '/Byweaves/fancy-saree.webp',
  'Mixed Pattu Sarees': '/Byweaves/Mixed-pattu.webp',
};

/**
 * Hero image for a saree — the single best photograph for cards and PDP
 * primary frame. Falls back to the catalog placeholder.
 */
export function getProductHero(saree: Saree): string {
  return PRODUCT_IMAGES[saree.id]?.hero ?? saree.image;
}

/**
 * Gallery for the PDP — 3-4 distinct frames assembled from the hero, any
 * extras, the weave-level story shot, and the by-weave swatch. Duplicates
 * are filtered out so the rail never shows the same photograph twice.
 */
export function getProductGallery(saree: Saree): string[] {
  // Admin-uploaded images take precedence when present so the PDP shows
  // exactly what was set in the admin panel, even if colour labels aren't
  // filled in (which would otherwise skip the colorway filter path).
  const adminUrls = (saree.images ?? []).map((i) => i.url).filter(Boolean);
  const mapped = PRODUCT_IMAGES[saree.id];
  const hero = mapped?.hero ?? saree.image;
  const candidates = [
    ...adminUrls,
    hero,
    ...(mapped?.extras ?? []),
    WEAVE_STORY[saree.weave],
    WEAVE_SWATCH[saree.weave],
    // The original catalog image is kept last so it serves as a detail-shot
    // fallback when nothing else is available for that saree.
    saree.image,
  ];
  // De-duplicate while preserving order.
  const seen = new Set<string>();
  return candidates.filter((src) => {
    if (!src || seen.has(src)) return false;
    seen.add(src);
    return true;
  });
}

// ── Colorway galleries ────────────────────────────────────────────────────
//
// When the user clicks a colorway swatch on the PDP, the gallery on the
// left should swap entirely to images of sarees in THAT colour. We don't
// have real per-variant photography, so the gallery is sourced from other
// sarees in the catalog whose primary palette tone is closest to the
// picked colour — pick yellow and you should see only yellow sarees,
// pick maroon and you should see only maroon sarees, etc. Each matching
// saree contributes both its hero AND extras so the rail is built from
// "different view images" (multiple photos), not just one shot per saree.

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '').padEnd(6, '0');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbDistance(a: string, b: string): number {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

const MAX_GALLERY = 4;

export function getColorwayGallery(saree: Saree, colorwayId: string): string[] {
  const colorways = getColorways(saree);
  if (colorways.length === 0) return getProductGallery(saree);
  const primary = colorways[0];
  const selected = colorways.find((c) => c.id === colorwayId) ?? primary;

  // Admin panel path: show every uploaded thumbnail in the rail, ordered
  // so the selected colour's image is first (it becomes the main frame
  // because ProductGallery mounts fresh when colorId changes, defaulting
  // active to index 0). Rest of the admin gallery follows in original
  // order so the user can still browse all variants.
  const adminImages = (saree.images ?? []).filter((i) => i.url);
  if (adminImages.length > 0) {
    const target = selected.id; // getColorways stores the lowercased label as id
    const matching = adminImages.filter((i) => (i.color ?? '').trim().toLowerCase() === target);
    const others = adminImages.filter((i) => (i.color ?? '').trim().toLowerCase() !== target);
    const seen = new Set<string>();
    const out: string[] = [];
    for (const i of [...matching, ...others]) {
      if (!i.url || seen.has(i.url)) continue;
      seen.add(i.url);
      out.push(i.url);
    }
    if (out.length > 0) return out;
  }

  // First colorway = the saree as photographed → its own full gallery
  // (hero + extras + weave shots) so the default view is unchanged.
  if (selected.id === primary.id) {
    return getProductGallery(saree);
  }

  // Other colorways → pull from the rest of the catalog, ranked by RGB
  // distance to the picked hex. For each matching saree we take its
  // hero AND any extras (multiple views of that saree), then continue
  // down the ranked list until we have MAX_GALLERY images.
  const ranked = SAREES
    .filter((s) => s.id !== saree.id)
    .map((s) => ({ s, d: rgbDistance(s.palette[0] ?? '#000000', selected.hex) }))
    .sort((a, b) => a.d - b.d);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const { s } of ranked) {
    if (out.length >= MAX_GALLERY) break;
    const mapped = PRODUCT_IMAGES[s.id];
    const hero = mapped?.hero ?? s.image;
    const candidates = [hero, ...(mapped?.extras ?? []), s.image];
    for (const src of candidates) {
      if (out.length >= MAX_GALLERY) break;
      if (!src || seen.has(src)) continue;
      seen.add(src);
      out.push(src);
    }
  }
  // Gallery is never allowed to go empty.
  return out.length > 0 ? out : [getProductHero(saree)];
}

