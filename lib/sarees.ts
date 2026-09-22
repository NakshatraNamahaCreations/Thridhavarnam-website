export type Tier = 'bridal' | 'festive' | 'everyday';

export type Weave =
  | 'Banarasi'
  | 'Kanjivaram'
  | 'Mysore Silk'
  | 'Mangalagiri'
  | 'Pochampally'
  | 'Gadwal'
  | 'Patola'
  | 'Fancy Sarees'
  | 'Mixed Pattu Sarees';

// Stock / availability ribbons rendered on the product card and the
// product detail page. Kept here so the catalog data, ProductCard,
// ProductDetail and the future admin API all share one vocabulary.
export type BadgeKind = 'ready' | 'fast' | 'last';

export const BADGE_LABEL: Record<BadgeKind, string> = {
  ready: 'Ready To Ship',
  fast: 'Selling Fast',
  last: 'Last Chance',
};

export type Saree = {
  id: string;
  name: string;
  weave: Weave;
  region: string;
  tier: Tier;
  price: number; // INR
  mrp: number;   // INR — pre-discount, always present so every card can show a strike-through + % off
  badges: BadgeKind[]; // stock signals; can be empty
  story: string;
  image: string; // public-rooted path
  palette: string[]; // hex tones drawn from the saree, used for accents
  details: {
    length: string;
    blouse: string;
    zari: string;
    weight?: string;
  };
  // Occasion tag (wedding, festive, casual…) sourced from the admin panel.
  // Stored as the occasion id so the filter rail can group by it.
  occasion?: string;
  // Homepage / nav curation flags — 'bestseller' | 'new_in' | 'sale'.
  flags?: string[];
  // Live inventory count from the backend. `undefined` means "unknown"
  // (e.g. static demo entries in this file) and is treated as in-stock.
  // 0 or negative → out of stock (card shows OOS ribbon, detail page
  // disables Add-to-Cart / Buy-It-Now).
  stock?: number;
  // Optional gallery sourced from the backend admin panel. Each entry pairs
  // a URL / data URL with a colour label; the storefront groups colourway
  // swatches by unique colour and filters the gallery to matching images.
  images?: { url: string; color: string }[];
};

export const TIERS: Record<
  Tier,
  {
    id: Tier;
    title: string;
    sub: string;
    range: string;
    minPrice: number;
    maxPrice: number;
    blurb: string;
  }
> = {
  bridal: {
    id: 'bridal',
    title: 'Bridal',
    sub: 'Bridal',
    range: '₹25,000 and beyond',
    minPrice: 25000,
    maxPrice: Infinity,
    blurb:
      'Bridal-grade weaves, finished by master hands and meant to be folded into the next century.',
  },
  festive: {
    id: 'festive',
    title: 'Festive',
    sub: 'Festive',
    range: '₹8,000 — ₹25,000',
    minPrice: 8000,
    maxPrice: 25000,
    blurb:
      'Festive weaves built for the lit hour — temples, gatherings, the family portrait that hangs in the hall.',
  },
  everyday: {
    id: 'everyday',
    title: 'Everyday',
    sub: 'Everyday',
    range: 'From ₹2,500',
    minPrice: 2500,
    maxPrice: 8000,
    blurb:
      'Drapes that move with the morning — light on the shoulder, easy on the loom, faithful in the wash.',
  },
};

export const SAREES: Saree[] = [
  // VIRASAT — heirloom
  {
    id: 'banarasi-raktarani',
    name: 'Raktarani Banarasi',
    weave: 'Banarasi',
    region: 'Varanasi, Uttar Pradesh',
    tier: 'bridal',
    price: 48500,
    mrp: 56000,
    badges: ['ready', 'fast'],
    story:
      'A bridal piece woven on a pit loom for one hundred and forty days. The pallu carries a kalga-and-bel pattern set in pure silver zari, dipped twice in gold.',
    image: '/images/c2.jpg',
    palette: ['#6B0E1F', '#C9A961', '#8C6B2F'],
    details: {
      length: '6.3 m with running blouse',
      blouse: '0.8 m attached blouse piece',
      zari: 'Silver, double-dipped in 24k gold',
      weight: '780 g',
    },
  },
  {
    id: 'kanjivaram-mayura',
    name: 'Mayura Kanjivaram',
    weave: 'Kanjivaram',
    region: 'Kanchipuram, Tamil Nadu',
    tier: 'bridal',
    price: 36500,
    mrp: 42500,
    badges: ['ready'],
    story:
      'Body, border and pallu woven on three separate looms, then interlocked by hand at the petni — three sarees fused into one. The peacock motif is set in temple-edged korvai.',
    image: '/images/c3.jpg',
    palette: ['#0E4D5C', '#C9A961', '#4A0815'],
    details: {
      length: '6.3 m',
      blouse: '0.8 m contrast blouse',
      zari: 'Pure silver-coated gold thread',
      weight: '820 g',
    },
  },
  {
    id: 'patola-rasleela',
    name: 'Rasleela Patola',
    weave: 'Patola',
    region: 'Patan, Gujarat',
    tier: 'bridal',
    price: 92000,
    mrp: 105000,
    badges: ['fast'],
    story:
      'Double-ikat — both warp and weft dyed before the loom ever moves. Eleven months on a hand-frame; the colour will not fade in three centuries.',
    image: '/images/c4.jpg',
    palette: ['#6B0E1F', '#0E4D5C', '#E2C98A'],
    details: {
      length: '6.0 m',
      blouse: '0.8 m matching blouse',
      zari: 'No metallic — natural plant dyes only',
      weight: '640 g',
    },
  },
  {
    id: 'mixedpattu-katha',
    name: 'Katha Pattu',
    weave: 'Mixed Pattu Sarees',
    region: 'Fusion · India',
    tier: 'bridal',
    price: 28500,
    mrp: 33500,
    badges: ['ready'],
    story:
      'A bridal mixed-pattu — a Kanjivaram body in deep maroon married to a Banarasi pallu in old-gold brocade. The petni join carries both traditions cleanly; the reverse reads as honest as the front.',
    image: '/pattu%20sarees/pa1.webp',
    palette: ['#4A0815', '#8C6B2F', '#1E1B3A'],
    details: {
      length: '6.0 m',
      blouse: '0.8 m attached',
      zari: 'Pure silver, double-dipped in 24k gold',
      weight: '590 g',
    },
  },
  {
    id: 'kanjivaram-neelambari',
    name: 'Neelambari Kanjivaram',
    weave: 'Kanjivaram',
    region: 'Kanchipuram, Tamil Nadu',
    tier: 'bridal',
    price: 42000,
    mrp: 48500,
    badges: [],
    story:
      'Peacock-blue body with a contrast mustard pallu, joined by a hand-knotted petni. The border carries the temple-edge gopuram in pure silver-gold zari, set on a triple-shuttle korvai loom.',
    image: '/newarrivals/neelambari%20kanjivaram.webp',
    palette: ['#0E4D5C', '#C9A961', '#4A0815'],
    details: {
      length: '6.3 m',
      blouse: '0.8 m contrast blouse',
      zari: 'Pure silver-coated 24k gold',
      weight: '850 g',
    },
  },
  {
    id: 'mixedpattu-mor',
    name: 'Mor Pattu',
    weave: 'Mixed Pattu Sarees',
    region: 'Fusion · India',
    tier: 'bridal',
    price: 38500,
    mrp: 45500,
    badges: ['last'],
    story:
      'A bridal fusion drape in deep magenta — a soft-silk Kanjivaram body finished with a Banarasi mor (peacock) pallu in twenty-eight hand-dyed colours. Two traditions, one fold, eleven months on the loom.',
    image: '/pattu%20sarees/pa2.webp',
    palette: ['#6B0E1F', '#0E4D5C', '#C9A961'],
    details: {
      length: '5.5 m',
      blouse: '0.8 m attached',
      zari: 'Silver-gold tested zari',
      weight: '680 g',
    },
  },
  {
    id: 'patola-vrindavan',
    name: 'Vrindavan Patola',
    weave: 'Patola',
    region: 'Patan, Gujarat',
    tier: 'bridal',
    price: 78500,
    mrp: 89500,
    badges: [],
    story:
      'A Salvi-family double-ikat — fourteen months from yarn to finish, with both warp and weft tied off before the dye. The elephant-and-parrot bhat is woven thread for thread on a slanting hand-frame.',
    image: '/Byweaves/Patola.webp',
    palette: ['#6B0E1F', '#E2C98A', '#1E1B3A'],
    details: {
      length: '6.0 m',
      blouse: '0.8 m matching blouse',
      zari: 'No metallic — natural plant dyes only',
      weight: '670 g',
    },
  },
  {
    id: 'mixedpattu-ramayana',
    name: 'Ramayana Pattu',
    weave: 'Mixed Pattu Sarees',
    region: 'Fusion · India',
    tier: 'bridal',
    price: 32500,
    mrp: 38000,
    badges: ['ready', 'fast'],
    story:
      'A wedding fusion drape — a Kanjivaram silk body in indigo with a story-pallu woven in coloured resham, eight panels from the Ramayana. The border is finished with a meenakari Banarasi edge in gold.',
    image: '/pattu%20sarees/pa3.webp',
    palette: ['#4A0815', '#C9A961', '#1E1B3A'],
    details: {
      length: '6.0 m',
      blouse: '0.8 m attached',
      zari: 'Coloured resham with silver-gold border',
      weight: '620 g',
    },
  },
  {
    id: 'mixedpattu-shubh',
    name: 'Shubh Pattu',
    weave: 'Mixed Pattu Sarees',
    region: 'Fusion · India',
    tier: 'bridal',
    price: 34500,
    mrp: 39800,
    badges: ['ready'],
    story:
      'A wedding mixed-pattu in deep sindoor — a Kanjivaram silk body finished with a Banarasi gold-zari pallu and a Patola-inspired bandhani border. Three traditions, one fold.',
    image: '/pattu%20sarees/pa4.webp',
    palette: ['#6B0E1F', '#C9A961', '#1E1B3A'],
    details: {
      length: '6.0 m',
      blouse: '0.8 m attached',
      zari: 'Silver-gold double-dipped zari',
      weight: '670 g',
    },
  },

  // SRINGARA — festive
  {
    id: 'fancy-haldi',
    name: 'Sandhya Drape',
    weave: 'Fancy Sarees',
    region: 'Contemporary',
    tier: 'festive',
    price: 18500,
    mrp: 22000,
    badges: ['ready', 'last'],
    story:
      'A twilight-toned fancy saree in deep ocean teal — a contemporary silhouette finished with a shimmer-thread border and a sequinned pallu that catches the light at every fold. Cut for the reception evening and the long sangeet night.',
    image: '/Partysarees/P1.webp',
    palette: ['#0E4D5C', '#C9A961', '#1E1B3A'],
    details: {
      length: '5.5 m',
      blouse: '0.8 m attached',
      zari: 'Hand-embroidered with sequin and zari work',
      weight: '520 g',
    },
  },
  {
    id: 'mysore-chandrika',
    name: 'Chandrika Mysore',
    weave: 'Mysore Silk',
    region: 'Mysuru, Karnataka',
    tier: 'festive',
    price: 14200,
    mrp: 16800,
    badges: ['ready'],
    story:
      'Pure crepe-silk in moonlight ivory, with a hand-finished zari border. Carries the KSIC gold hologram — Karnataka’s certificate that the silk has not been blended.',
    image: '/images/c7.jpg',
    palette: ['#EDE3D0', '#C9A961', '#8C6B2F'],
    details: {
      length: '5.5 m',
      blouse: '0.8 m matching',
      zari: 'KSIC tested gold zari',
      weight: '450 g',
    },
  },
  {
    id: 'banarasi-jamawar',
    name: 'Jamawar Banarasi',
    weave: 'Banarasi',
    region: 'Varanasi, Uttar Pradesh',
    tier: 'festive',
    price: 19800,
    mrp: 24500,
    badges: ['last'],
    story:
      'A lighter Banarasi in deep jamuni — the all-over jaal woven with cut-work bootis that hold the light without weighing on the shoulder.',
    image: '/images/c8.jpg',
    palette: ['#1E1B3A', '#C9A961', '#6B0E1F'],
    details: {
      length: '6.3 m',
      blouse: '0.8 m attached',
      zari: 'Silver, gold-dipped',
      weight: '610 g',
    },
  },
  {
    id: 'mangalagiri-megha',
    name: 'Megha Mangalagiri',
    weave: 'Mangalagiri',
    region: 'Mangalagiri, Andhra Pradesh',
    tier: 'festive',
    price: 9800,
    mrp: 12500,
    badges: ['ready', 'fast'],
    story:
      'A Mangalagiri silk-cotton in cloud-grey, framed by the stark Nizam border in zari. Crisp, breathable, drapeable — the weave that turned a hill-foot town into a GI-tagged tradition.',
    image: '/mangalagiri%20sarees/m1.webp',
    palette: ['#3A2A22', '#E2C98A', '#C9A961'],
    details: {
      length: '5.5 m',
      blouse: '0.8 m attached',
      zari: 'Real silver zari',
      weight: '380 g',
    },
  },
  {
    id: 'banarasi-sindhoori',
    name: 'Sindhoori Banarasi',
    weave: 'Banarasi',
    region: 'Varanasi, Uttar Pradesh',
    tier: 'festive',
    price: 16800,
    mrp: 19800,
    badges: ['ready'],
    story:
      'A vermillion Banarasi katan silk with an all-over jangla jaal — the kind that catches a temple-lamp and refuses to let go. Slim border, generous gold pallu.',
    image: '/newarrivals/sindhoori%20banarasi.webp',
    palette: ['#6B0E1F', '#C9A961', '#8C6B2F'],
    details: {
      length: '6.3 m',
      blouse: '0.8 m attached',
      zari: 'Silver, gold-dipped',
      weight: '560 g',
    },
  },
  {
    id: 'kanjivaram-surya',
    name: 'Surya Kanjivaram',
    weave: 'Kanjivaram',
    region: 'Kanchipuram, Tamil Nadu',
    tier: 'festive',
    price: 19800,
    mrp: 23500,
    badges: ['ready'],
    story:
      'A sunset-orange Kanjivaram with a maroon korvai border — the rudraksha-and-mango motif runs the length of the pallu, woven on a two-shuttle loom.',
    image: '/Byweaves/kanjeevaram.webp',
    palette: ['#8C6B2F', '#6B0E1F', '#C9A961'],
    details: {
      length: '6.3 m',
      blouse: '0.8 m contrast blouse',
      zari: 'Tested silver-gold zari',
      weight: '720 g',
    },
  },
  {
    id: 'mysore-mallika',
    name: 'Mallika Mysore',
    weave: 'Mysore Silk',
    region: 'Mysuru, Karnataka',
    tier: 'festive',
    price: 12500,
    mrp: 14800,
    badges: ['fast'],
    story:
      'A jasmine-white crepe Mysore with a deep maroon border — the everyday classic of the Karnataka temple-town. KSIC hologram on the inner pallu.',
    image: '/Byweaves/Mysore%20silk.webp',
    palette: ['#EDE3D0', '#6B0E1F', '#C9A961'],
    details: {
      length: '5.5 m',
      blouse: '0.8 m matching',
      zari: 'KSIC tested gold zari',
      weight: '460 g',
    },
  },
  {
    id: 'gadwal-konark',
    name: 'Konark Gadwal',
    weave: 'Gadwal',
    region: 'Jogulamba Gadwal, Telangana',
    tier: 'festive',
    price: 17500,
    mrp: 20500,
    badges: ['ready'],
    story:
      'A sun-gold Gadwal with a cotton body and a silk pallu, joined by the native interlock. The bangadi-mor motif sits at the pallu in silver-gold zari — light on the shoulder, regal at the drape.',
    image: '/Gadwal%20sarees/g1.webp',
    palette: ['#C9A961', '#0E4D5C', '#8C6B2F'],
    details: {
      length: '5.5 m',
      blouse: '0.8 m attached',
      zari: 'Silver-gold tested zari',
      weight: '500 g',
    },
  },
  {
    id: 'patola-rangraj',
    name: 'Rangraj Patola',
    weave: 'Patola',
    region: 'Rajkot, Gujarat',
    tier: 'festive',
    price: 21500,
    mrp: 24500,
    badges: [],
    story:
      'A Rajkot single-ikat Patola — the weft alone is dyed before the loom, which keeps the eight-month timeline at four and the price at festive rather than heirloom. Honest workmanship, faithful colour.',
    image: '/newarrivals/rangraj%20patola.webp',
    palette: ['#6B0E1F', '#C9A961', '#0E4D5C'],
    details: {
      length: '5.5 m',
      blouse: '0.8 m matching',
      zari: 'None — pure plant-dye silk',
      weight: '480 g',
    },
  },
  {
    id: 'gadwal-krishna',
    name: 'Krishna Gadwal',
    weave: 'Gadwal',
    region: 'Jogulamba Gadwal, Telangana',
    tier: 'festive',
    price: 17500,
    mrp: 20800,
    badges: ['ready'],
    story:
      'An indigo Gadwal with a deep cotton body and a silk-zari pallu. The interlock join is finished by hand; the pallu carries the temple-corner motif in gold-coloured resham and zari.',
    image: '/Gadwal%20sarees/g2.webp',
    palette: ['#1E1B3A', '#C9A961', '#6B0E1F'],
    details: {
      length: '6.0 m',
      blouse: '0.8 m attached',
      zari: 'Gold-coloured resham with zari pallu',
      weight: '550 g',
    },
  },
  {
    id: 'mangalagiri-chandni',
    name: 'Chandni Mangalagiri',
    weave: 'Mangalagiri',
    region: 'Mangalagiri, Andhra Pradesh',
    tier: 'festive',
    price: 11500,
    mrp: 13500,
    badges: ['ready', 'fast'],
    story:
      'A moonlight-silver Mangalagiri silk-cotton with scattered butis across the body. Crisp warp, glossy weft, the Nizam border framing it cleanly — the festive cotton-silk for the long evening.',
    image: '/mangalagiri%20sarees/m2.webp',
    palette: ['#EDE3D0', '#C9A961', '#1B0E0A'],
    details: {
      length: '5.5 m',
      blouse: '0.8 m attached',
      zari: 'Real silver zari',
      weight: '360 g',
    },
  },
  {
    id: 'gadwal-aishwarya',
    name: 'Aishwarya Gadwal',
    weave: 'Gadwal',
    region: 'Jogulamba Gadwal, Telangana',
    tier: 'festive',
    price: 15500,
    mrp: 18500,
    badges: ['ready', 'fast'],
    story:
      'A festive Gadwal in jasmine ivory with a wine-red silk pallu — the cotton body breathes through the long evening, the pallu catches every temple lamp. Interlock join finished by hand.',
    image: '/Gadwal%20sarees/g3.webp',
    palette: ['#EDE3D0', '#6B0E1F', '#C9A961'],
    details: {
      length: '5.5 m',
      blouse: '0.8 m attached',
      zari: 'Silver-gold tested zari',
      weight: '480 g',
    },
  },
  {
    id: 'fancy-cocktail',
    name: 'Cocktail Drape',
    weave: 'Fancy Sarees',
    region: 'Contemporary',
    tier: 'festive',
    price: 19500,
    mrp: 23500,
    badges: ['ready', 'last'],
    story:
      'A cocktail-evening fancy saree in midnight blue with sequinned florals scattered across the pallu — a contemporary silhouette built for the after-dark portrait.',
    image: '/Partysarees/p3.webp',
    palette: ['#1E1B3A', '#C9A961', '#6B0E1F'],
    details: {
      length: '5.5 m',
      blouse: '0.8 m attached',
      zari: 'Hand-embroidered with sequin work',
      weight: '520 g',
    },
  },

  // AANGAN — everyday
  {
    id: 'pochampally-aakash',
    name: 'Aakash Pochampally',
    weave: 'Pochampally',
    region: 'Bhoodan Pochampally, Telangana',
    tier: 'everyday',
    price: 4200,
    mrp: 5400,
    badges: ['ready'],
    story:
      'A handloom Pochampally ikat in indigo and parchment — the yarn tied and dyed before the loom moves, so the design lives on both faces of the weave.',
    image: '/pochampally%20sarees/po1.webp',
    palette: ['#1E1B3A', '#EDE3D0', '#3A2A22'],
    details: {
      length: '5.5 m',
      blouse: '0.8 m attached',
      zari: 'None — pure handloom cotton-silk',
      weight: '420 g',
    },
  },
  {
    id: 'mangalagiri-tulsi',
    name: 'Tulsi Mangalagiri',
    weave: 'Mangalagiri',
    region: 'Mangalagiri, Andhra Pradesh',
    tier: 'everyday',
    price: 3850,
    mrp: 4900,
    badges: ['ready', 'fast'],
    story:
      'A weekday Mangalagiri in basil-leaf green with a slim Nizam border in zari — featherlight cotton, breathes through summer, holds a crease through long afternoons.',
    image: '/mangalagiri%20sarees/m3.webp',
    palette: ['#0E4D5C', '#C9A961', '#EDE3D0'],
    details: {
      length: '5.5 m',
      blouse: '0.8 m attached',
      zari: 'Tested gold zari border',
      weight: '340 g',
    },
  },
  {
    id: 'mysore-tara',
    name: 'Tara Mysore',
    weave: 'Mysore Silk',
    region: 'Mysuru, Karnataka',
    tier: 'everyday',
    price: 5600,
    mrp: 6800,
    badges: ['ready'],
    story:
      'Crepe Mysore in star-blue with a quiet contrast pallu — the soft-shouldered drape that has been the Karnataka woman’s morning friend for a hundred years.',
    image: '/images/c12.jpg',
    palette: ['#1E1B3A', '#E2C98A', '#6B0E1F'],
    details: {
      length: '5.5 m',
      blouse: '0.8 m matching',
      zari: 'KSIC tested',
      weight: '410 g',
    },
  },
  {
    id: 'banarasi-saanjh',
    name: 'Saanjh Banarasi',
    weave: 'Banarasi',
    region: 'Varanasi, Uttar Pradesh',
    tier: 'everyday',
    price: 6800,
    mrp: 8400,
    badges: ['ready'],
    story:
      'A daily Banarasi — fewer threads, faster loom, the same quiet glow. Built for the evening that becomes a memory before you notice.',
    image: '/images/c13.jpg',
    palette: ['#8C6B2F', '#6B0E1F', '#FBF6EE'],
    details: {
      length: '6.0 m',
      blouse: '0.8 m attached',
      zari: 'Tested silver zari',
      weight: '500 g',
    },
  },
  {
    id: 'kanjivaram-lavanya',
    name: 'Lavanya Kanjivaram',
    weave: 'Kanjivaram',
    region: 'Kanchipuram, Tamil Nadu',
    tier: 'everyday',
    price: 7400,
    mrp: 8900,
    badges: ['ready', 'fast'],
    story:
      'A lightweight Kanjivaram in moss-green, with a single-shuttle border. The pallu carries the gopuram-corner motif, half-weight of the bridal piece, the same temple finish.',
    image: '/images/c3.jpg',
    palette: ['#0E4D5C', '#C9A961', '#EDE3D0'],
    details: {
      length: '6.0 m',
      blouse: '0.8 m attached',
      zari: 'Tested silver zari',
      weight: '480 g',
    },
  },
  {
    id: 'pochampally-bandhakala',
    name: 'Bandhakala Pochampally',
    weave: 'Pochampally',
    region: 'Bhoodan Pochampally, Telangana',
    tier: 'everyday',
    price: 5500,
    mrp: 6800,
    badges: ['ready'],
    story:
      'A handloom bandha Pochampally in maroon and ivory — the geometric ikat grid tied off thread by thread before the dye. Crisp cotton-silk; gets softer with every wash.',
    image: '/pochampally%20sarees/po2.webp',
    palette: ['#6B0E1F', '#EDE3D0', '#3A2A22'],
    details: {
      length: '5.5 m',
      blouse: '0.8 m attached',
      zari: 'None — pure handloom cotton-silk',
      weight: '380 g',
    },
  },
  {
    id: 'pochampally-meghala',
    name: 'Meghala Pochampally',
    weave: 'Pochampally',
    region: 'Bhoodan Pochampally, Telangana',
    tier: 'everyday',
    price: 6800,
    mrp: 8400,
    badges: ['ready', 'fast'],
    story:
      'A weekday Pochampally in cloud-grey and indigo — the ikat geometry tied tight enough that each diamond stands distinct, soft enough to drape like cotton on the shoulder.',
    image: '/pochampally%20sarees/po3.webp',
    palette: ['#5A6B7E', '#1E1B3A', '#EDE3D0'],
    details: {
      length: '5.5 m',
      blouse: '0.8 m attached',
      zari: 'None — pure handloom cotton-silk',
      weight: '400 g',
    },
  },
  {
    id: 'fancy-mehndi',
    name: 'Mehndi Drape',
    weave: 'Fancy Sarees',
    region: 'Contemporary',
    tier: 'everyday',
    price: 7800,
    mrp: 9500,
    badges: ['ready'],
    story:
      'A henna-green fancy saree with hand-embroidered floral motifs along the pallu — the contemporary drape for a mehndi morning or a daytime engagement.',
    image: '/Partysarees/p2.webp',
    palette: ['#4A6B2F', '#C9A961', '#EDE3D0'],
    details: {
      length: '5.5 m',
      blouse: '0.8 m attached',
      zari: 'Hand-embroidered with tested zari',
      weight: '480 g',
    },
  },
];

export const REGIONS = [
  {
    id: 'banarasi',
    name: 'Banarasi',
    place: 'Varanasi · Uttar Pradesh',
    era: 'since the Mughal court · 14th century',
    palette: ['#6B0E1F', '#C9A961', '#1B0E0A'],
    fact:
      'A bridal Banarasi can use up to 5,600 thread wires set by hand on a pit loom. Akbar’s court is recorded as keeping more than a thousand weavers — the saree was, for a time, a kind of currency.',
    image: '/story/banarasi story.webp',
  },
  {
    id: 'kanjivaram',
    name: 'Kanjeevaram',
    place: 'Kanchipuram · Tamil Nadu',
    era: 'since the Chola dynasty · 9th century',
    palette: ['#0E4D5C', '#C9A961', '#6B0E1F'],
    fact:
      'The body, the border, and the pallu are woven separately and then interlocked by hand at a join called the petni — meaning a Kanjeevaram is, in truth, three sarees fused into one.',
    image: '/story/kanjeevaram story.webp',
  },
  {
    id: 'mysore',
    name: 'Mysore Silk',
    place: 'Mysuru · Karnataka',
    era: 'since Tipu Sultan · 1780',
    palette: ['#1E1B3A', '#E2C98A', '#8C6B2F'],
    fact:
      'Tipu Sultan imported the silkworms from China in the 1780s to begin Karnataka’s own line of silk. Every genuine Mysore Silk today carries a gold-foil hologram — a state-issued promise of purity.',
    image: '/story/Mysore silk story.webp',
  },
  {
    id: 'mangalagiri',
    name: 'Mangalagiri',
    place: 'Mangalagiri · Andhra Pradesh',
    era: 'since the 15th century',
    palette: ['#C9A961', '#3A2A22', '#EDE3D0'],
    fact:
      'Woven at the foothills of the Mangalagiri temple, the saree carries a GI tag and a Nizam-era border. The cotton-silk blend is crisp enough to hold a pleat through a long day without an iron.',
    image: '/story/banarasi story.webp',
  },
  {
    id: 'pochampally',
    name: 'Pochampally',
    place: 'Bhoodan Pochampally · Telangana',
    era: 'since the 1950s land-gift villages',
    palette: ['#1E1B3A', '#6B0E1F', '#EDE3D0'],
    fact:
      'The Silk City of India. Every Pochampally is resist-tied and dyed before the loom even moves — the geometry only reveals itself once warp meets weft. A UNESCO-listed tradition.',
    image: '/story/banarasi story.webp',
  },
  {
    id: 'gadwal',
    name: 'Gadwal',
    place: 'Jogulamba Gadwal · Telangana',
    era: 'since the Krishnadevaraya court · 16th century',
    palette: ['#C9A961', '#8C6B2F', '#1E1B3A'],
    fact:
      'A Gadwal is two weaves in one saree — a cotton body wedded to a silk pallu and silk border by the native interlock join. Folded famously small; tradition says one can pass through a matchbox.',
    image: '/story/banarasi story.webp',
  },
  {
    id: 'patola',
    name: 'Patola',
    place: 'Patan · Gujarat',
    era: 'since the 12th century',
    palette: ['#6B0E1F', '#0E4D5C', '#E2C98A'],
    fact:
      'In a Patola, both warp and weft are tie-dyed before weaving — a technique called double ikat. Only three families in the world still know it. Six months to four years per saree, and the colour does not fade in three hundred years.',
    image: '/story/patola.webp',
  },
];

export function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Kebab-case slug from any text — used to build human-readable product
// URLs (`/shop/mayura-kanjivaram`) instead of exposing backend ids.
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// URL segment for a product. Static SAREES entries already have kebab
// ids so their id doubles as a slug; backend products fall back to the
// slugified name and only use `id` (e.g. SAR-1045) if the name is empty.
export function productSlug(saree: Pick<Saree, 'id' | 'name'>): string {
  if (saree.name) {
    const s = slugify(saree.name);
    if (s) return s;
  }
  return saree.id;
}

// ── Colorways ─────────────────────────────────────────────────────────────
//
// Each saree is shown on the PDP with a short list of available colorways
// the customer can switch between. Real product variants would live in the
// SAREES data with their own SKUs and images; until that's wired up, we
// derive a deterministic 4–5 colorway set from the saree's existing
// `palette` plus a curated bank of common saree colors. This guarantees
// the PDP always has a populated swatch row without having to hand-author
// variants per saree.

export type Colorway = {
  id: string;
  name: string;
  hex: string;
};

// Full catalog of common heirloom saree colors with friendly names.
// Exported so the shop's Color filter and the PDP swatch row share one
// source of truth. Ordered by hue family so the rail reads as a colour
// wheel from warm to cool, with neutrals at the seams.
//
// Hex values are saturated enough that each colour reads as itself at the
// 32px swatch size — when the rail was previously rendered with muted
// heirloom tones, every primary looked like a different pastel.
export const STANDARD_COLORWAYS: Colorway[] = [
  // Reds
  { id: 'red', name: 'Red', hex: '#DC2626' },
  { id: 'maroon', name: 'Maroon', hex: '#7E1D1D' },
  { id: 'wine', name: 'Wine', hex: '#4A0815' },
  // Pinks
  { id: 'pink', name: 'Pink', hex: '#DB2777' },
  { id: 'magenta', name: 'Magenta', hex: '#A21CAF' },
  // Oranges / rust
  { id: 'orange', name: 'Orange', hex: '#F97316' },
  { id: 'rust', name: 'Rust', hex: '#C2410C' },
  // Yellows / golds
  { id: 'yellow', name: 'Yellow', hex: '#EAB308' },
  { id: 'mustard', name: 'Mustard', hex: '#A16207' },
  { id: 'gold', name: 'Gold', hex: '#DAA520' },
  // Neutrals
  { id: 'cream', name: 'Cream', hex: '#FEF3C7' },
  { id: 'ivory', name: 'Ivory', hex: '#F2E9D8' },
  { id: 'beige', name: 'Beige', hex: '#D6BD8C' },
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  // Greens
  { id: 'mint', name: 'Mint', hex: '#34D399' },
  { id: 'green', name: 'Green', hex: '#16A34A' },
  { id: 'olive', name: 'Olive', hex: '#65A30D' },
  { id: 'forest', name: 'Dark Green', hex: '#166534' },
  // Blue-greens
  { id: 'teal', name: 'Teal', hex: '#0D9488' },
  { id: 'peacock', name: 'Peacock', hex: '#0E7490' },
  // Blues
  { id: 'sky', name: 'Sky Blue', hex: '#0EA5E9' },
  { id: 'blue', name: 'Blue', hex: '#2563EB' },
  { id: 'navy', name: 'Navy Blue', hex: '#1E40AF' },
  { id: 'midnight', name: 'Dark Blue', hex: '#1E1B4B' },
  // Purples
  { id: 'lavender', name: 'Lavender', hex: '#C4B5FD' },
  { id: 'purple', name: 'Purple', hex: '#9333EA' },
  // Browns / blacks / grays
  { id: 'brown', name: 'Brown', hex: '#92400E' },
  { id: 'grey', name: 'Grey', hex: '#6B7280' },
  { id: 'black', name: 'Black', hex: '#000000' },
];

// RGB-distance helpers — also used by the shop Color filter and by the
// product-images colorway gallery, so kept here next to the colorway data.
function hexToRgbTriplet(hex: string): [number, number, number] {
  const h = hex.replace('#', '').padEnd(6, '0');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbDist(a: string, b: string): number {
  const [r1, g1, b1] = hexToRgbTriplet(a);
  const [r2, g2, b2] = hexToRgbTriplet(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

// Each saree belongs to EXACTLY ONE color group — the standard colorway
// whose hex is nearest to the saree's primary palette tone. This keeps
// the counts clean (sum of counts = catalog size) and avoids the overlap
// problems a threshold-based match has when the standard palette grows
// large enough that neighbouring colours fall within range of each other.
export function getSareeColorGroup(saree: Saree): string {
  const primary = saree.palette[0];
  if (!primary) return STANDARD_COLORWAYS[0].id;
  let bestId = STANDARD_COLORWAYS[0].id;
  let bestDist = Infinity;
  for (const c of STANDARD_COLORWAYS) {
    const d = rgbDist(primary, c.hex);
    if (d < bestDist) {
      bestDist = d;
      bestId = c.id;
    }
  }
  return bestId;
}

// True when the saree's home colour group matches the given colorway id.
export function sareeMatchesColor(saree: Saree, colorId: string): boolean {
  return getSareeColorGroup(saree) === colorId;
}

// Match a hex string to a known colorway name when possible (so the
// saree's own palette swatches get sensible labels). Falls back to a
// generic "Heirloom" / "Atelier" suffix if we don't recognise the tone.
function nameForHex(hex: string, fallbackIndex: number): string {
  const lower = hex.toLowerCase();
  const matchKnown = STANDARD_COLORWAYS.find((c) => c.hex.toLowerCase() === lower);
  if (matchKnown) return matchKnown.name;
  const suffixes = ['Atelier', 'Heirloom', 'Original', 'Signature'];
  return suffixes[fallbackIndex % suffixes.length];
}

// Case-insensitive lookup in the curated palette so an admin who typed
// "Peacock" gets the same swatch hex as the shop's Peacock filter.
function findStandardColorway(label: string): Colorway | undefined {
  const norm = label.trim().toLowerCase();
  if (!norm) return undefined;
  return STANDARD_COLORWAYS.find(
    (c) => c.id === norm || c.name.toLowerCase() === norm,
  );
}

export function getColorways(saree: Saree): Colorway[] {
  // Admin-supplied gallery wins when it carries colour labels — each unique
  // label becomes a swatch, sourced from STANDARD_COLORWAYS when the label
  // matches a known colour name (so the hex is real), otherwise falling
  // back to the saree's primary palette tone.
  const adminImages = (saree.images ?? []).filter((i) => i.url && i.color?.trim());
  if (adminImages.length > 0) {
    const seenLabels = new Set<string>();
    const out: Colorway[] = [];
    adminImages.forEach((img) => {
      const label = img.color!.trim();
      const key = label.toLowerCase();
      if (seenLabels.has(key)) return;
      seenLabels.add(key);
      const std = findStandardColorway(label);
      if (std) {
        out.push({ id: key, name: std.name, hex: std.hex });
      } else {
        out.push({
          id: key,
          name: label.replace(/\b\w/g, (m) => m.toUpperCase()),
          hex: saree.palette[0] ?? '#8C6B2F',
        });
      }
    });
    return out;
  }

  const seen = new Set<string>();
  const out: Colorway[] = [];

  // Start with the saree's own palette so its actual woven tones are
  // always pickable (and selected by default).
  saree.palette.forEach((hex, i) => {
    const key = hex.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ id: `palette-${i}`, name: nameForHex(hex, i), hex: key });
  });

  // Top up with curated standards so every PDP shows ~5 options.
  for (const c of STANDARD_COLORWAYS) {
    if (out.length >= 5) break;
    const key = c.hex.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}
