# Tridhavarnam · Heirloom Weaves

A luxurious e-commerce experience for traditional Indian silk sarees — Banarasi,
Kanjivaram, Mysore, Paithani, Patola, Baluchari. Built with Next.js 14, GSAP
ScrollTrigger, and Lenis smooth scroll.

## Phase 1 — what's built

Two routes:

- **`/` — The Story page** (the cinematic opening)
  - Audio gate splash with mandala motif and "Enter with Sound / Enter in Silence"
  - Pinned ScrollTrigger journey through six weaving traditions, each revealing a
    strange historical fact (Akbar's thousand weavers, double-ikat Patola dyed
    before weaving, Baluchari pallu telling whole Mahabharata scenes, etc.)
  - A closing "Enter the Atelier" cinematic transition → `/home`

- **`/home` — The Home page** (the atelier itself)
  - Letterform-revealed hero (*"The house of silk"*)
  - Three drawing-rooms — **Aangan**, **Sringara**, **Virasat** — instead of
    premium / staged / basic
  - Featured-pieces editorial grid with hover story snippets
  - Four-step craft story (*"loom to ledger"*)
  - Worldwide shipping section with marquee ticker

- **Shared shell** — fixed nav that fades in only after the intro on `/`, always
  visible on `/home` and elsewhere; ambient raag audio toggle; smooth Lenis scroll
  wired to GSAP. Audio context persists between routes.

## Phase 2 — coming next (placeholder routes already exist)

- `/shop` — filterable atelier with price-range / weave filters
- `/shop/[id]` — product detail with gallery, story, enquiry CTA
- `/journey` — long-form weavers' archive
- `/about`, `/shipping`, `/contact`

## Running it

```powershell
npm install   # already done
npm run dev   # opens http://localhost:3000
```

Build for production:

```powershell
npm run build
npm run start
```

## Assets you need to provide

### Saree images — already partly in place ✓

You already dropped `c2.jpg` through `c13.jpg` and `p1.jpg` into
`public/images/`. These are wired into the product catalogue in
`lib/sarees.ts`. To replace any one of them, just overwrite the file at the
same path.

### Ambient raag audio — **REQUIRED for sound**

Drop a traditional Indian instrumental file at:

```
public/audio/raag-ambient.mp3
```

Suggestions are in `public/audio/PLACE-A-RAAG-HERE.txt`. The site degrades
gracefully without it — the splash still appears, the toggle just goes silent.

### Optional — replace `p1.jpg` hero image

`p1.jpg` is used as the wide hero photo. Replace with any 16:7-ish drape
shot for the strongest first impression.

## Design system

- **Display serif**: Italiana
- **Editorial serif**: Cormorant Garamond
- **UI sans**: Inter
- **Devanagari script**: Tiro Devanagari Sanskrit
- **Palette**: ivory `#FBF6EE`, deep maroon `#6B0E1F`, gold `#C9A961`, ink `#1B0E0A`

All tokens are in `tailwind.config.ts`.

## The three tiers — by design, never named

- **Aangan** (आँगन — courtyard) · from ₹2,500 · everyday grace
- **Sringara** (श्रृंगार — adornment) · ₹8,000 – ₹25,000 · festive heirlooms
- **Virasat** (विरासत — heritage) · ₹25,000 and beyond · bridal museum pieces

## File map

```
app/
  layout.tsx               # fonts, AudioProvider, SmoothScroll, SiteShell
  page.tsx                 # Phase 1 — intro + home stacked
  globals.css              # design tokens, reveal helpers
  shop|journey|about|...   # Phase 2 placeholders (no 404s)
components/
  AudioProvider.tsx        # global audio context + raag playback
  SmoothScroll.tsx         # Lenis wired into GSAP ticker
  Nav.tsx                  # fades in past 60vh of scroll
  Footer.tsx
  AudioToggle.tsx          # floating sound toggle (after intro)
  SiteShell.tsx
  intro/
    AudioGate.tsx          # splash with two-way entry (sound / silence)
    HeritageScroll.tsx     # pinned 6-panel saree heritage journey
  home/
    Hero.tsx               # letterform-reveal headline
    Tiers.tsx              # three drawing-rooms grid
    Featured.tsx           # editorial product grid
    CraftStory.tsx         # four-step weave process
    Worldwide.tsx          # India / USA / UK with marquee ticker
lib/
  sarees.ts                # tiers, regions, 12-piece product catalogue
public/
  images/                  # product photography (yours)
  audio/                   # raag (you provide)
```
