'use client';

type Story = {
  region: string;
  tagline: string;
  body: string;
};

const STORIES: Record<string, Story> = {
  Kanjivaram: {
    region: 'Kanchipuram, Tamil Nadu',
    tagline: 'The bride’s first weight of silk.',
    body:
      'Born in the temple town of Kanchipuram, Kanjivaram is woven from three twisted silk strands with pure zari coiled around silver and dipped in gold. Body and pallu are woven separately and interlocked by hand — the famed korvai join — so the contrasting border can never fray away.',
  },
  Banarasi: {
    region: 'Varanasi, Uttar Pradesh',
    tagline: 'Mughal brocade from the holy city.',
    body:
      'From the narrow lanes of Varanasi, where pit looms still hum at dawn. Mughal kalga‑and‑bel vines, meenakari accents and silver‑gilt brocade are coaxed line by line over months of weaving. A Banarasi takes the light differently in every fold.',
  },
  'Mysore Silk': {
    region: 'Mysuru, Karnataka',
    tagline: 'A century of crepe‑silk discipline.',
    body:
      'KSIC has been weaving pure mulberry silk with 100% gold zari since 1912 — light enough for the long day yet rich enough for the lit hour. Look inside the pallu for the gold‑foil hologram; that is the maker’s word.',
  },
  Mangalagiri: {
    region: 'Andhra Pradesh',
    tagline: 'Crisp cotton, Nizam borders.',
    body:
      'From the foothills of Mangalagiri, where weavers work cotton and silk‑cotton blends framed by stark, geometric Nizam borders. Breathable, drapeable, GI‑tagged — the everyday saree refined into an art.',
  },
  Pochampally: {
    region: 'Bhoodan Pochampally, Telangana',
    tagline: 'Ikat with a thousand‑step rhythm.',
    body:
      'In the Silk City of India, yarn is resist‑tied and dyed before it ever meets the loom. The pattern reveals itself only as the weft crosses the warp — a discipline of geometry, patience, and inherited muscle memory.',
  },
  Gadwal: {
    region: 'Jogulamba Gadwal, Telangana',
    tagline: 'Cotton body, silk pallu.',
    body:
      'A cotton body wedded to a silk pallu and silk border through the native interlock join. Light as breath, regal at the pallu — famously folded so small it was once said to pass through a matchbox.',
  },
  Patola: {
    region: 'Patan, Gujarat',
    tagline: 'Double‑ikat from the Salvi looms.',
    body:
      'A single Patola can take six months and three weavers. Both warp and weft are tie‑dyed before being aligned thread by thread on the loom — a geometry the Salvi family has guarded across generations.',
  },
  'Fancy Sarees': {
    region: 'Contemporary',
    tagline: 'Statement, without the heirloom weight.',
    body:
      'Modern silhouettes, contemporary motifs, party‑ready palettes — designed for the wedding‑adjacent moments: engagements, receptions, sangeet evenings. Lighter on the shoulder, easier on the loom, every bit as photographed.',
  },
  'Mixed Pattu Sarees': {
    region: 'Fusion drapes',
    tagline: 'Two traditions, one fold.',
    body:
      'Where two weaves meet on a single drape — a Kanjivaram body with a Banarasi pallu, a Mangalagiri stripe edged in Gadwal zari. For the wearer who refuses to choose between her grandmothers’ looms.',
  },
};

export default function CategoryStory({ weave }: { weave: string }) {
  const story = STORIES[weave];
  if (!story) return null;

  return (
    <section className="bg-ivory border-b border-ink/10">
      <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:gap-12 items-start max-w-5xl">
          <div className="lg:max-w-xs">
            <div className="text-[0.6rem] tracking-[0.35em] uppercase text-maroon font-semibold mb-2">
              {story.region}
            </div>
            <h2 className="font-display text-[1.85rem] md:text-[2.25rem] lg:text-[2.5rem] font-medium text-ink leading-[1.1]">
              {weave}
            </h2>
            <div className="mt-2 h-px w-12 bg-maroon/40" aria-hidden />
          </div>
          <div className="max-w-2xl">
            <p className="font-display text-lg md:text-xl text-maroon-deep italic leading-snug mb-3">
              {story.tagline}
            </p>
            <p className="text-sm md:text-[0.95rem] text-ink/80 leading-relaxed">
              {story.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
