'use client';

type Tip = {
  title: string;
  body: string;
  icon: 'bag' | 'jewel' | 'belt' | 'shoe';
};

const TIPS: Tip[] = [
  {
    icon: 'bag',
    title: 'Potli or Clutch',
    body: 'Embroidered potlis or metallic clutches add glam while staying functional. Match the bag to your border, or go contrast for a pop.',
  },
  {
    icon: 'jewel',
    title: 'Jewellery',
    body: 'Chokers for high necks, rani haars for plunging blouses. Pair with a matching maang tikka or jhumkas for the full bridal look.',
  },
  {
    icon: 'belt',
    title: 'Embroidered Belt',
    body: 'Define the waist and keep the drape in place with an embroidered belt. Works for both traditional and modern styling.',
  },
  {
    icon: 'shoe',
    title: 'Footwear',
    body: 'Heeled mojaris or kolhapuris for tradition, embellished stilettos for receptions. Keep the height tested in advance.',
  },
];

export default function ExpertTips() {
  return (
    <section className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-8 lg:py-10">
        <div className="mb-5">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            Expert Tips: How to Style &amp; Drape Your Saree
          </h2>
          <p className="text-sm text-gray-700 max-w-3xl">
            Complete your look with accessories that add personality and polish.
            Quick styling notes to upgrade your saree moment like a pro.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {TIPS.map((tip) => (
            <article
              key={tip.title}
              className="bg-white border border-gray-200 p-5 hover:border-gray-900 transition-colors"
            >
              <div className="text-[#75001F] mb-3">
                <TipIcon name={tip.icon} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">
                {tip.title}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {tip.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TipIcon({ name }: { name: Tip['icon'] }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (name) {
    case 'bag':
      return (
        <svg {...common}>
          <path d="M5 8h14l-1 13H6L5 8Z" />
          <path d="M9 8a3 3 0 0 1 6 0" />
          <path d="M7 11c0 2 2 4 5 4s5-2 5-4" />
        </svg>
      );
    case 'jewel':
      return (
        <svg {...common}>
          <path d="M6 3h12l4 6-10 12L2 9l4-6Z" />
          <path d="M2 9h20" />
          <path d="m10 9 2 4 2-4" />
        </svg>
      );
    case 'belt':
      return (
        <svg {...common}>
          <rect x="3" y="9" width="18" height="6" rx="1" />
          <path d="M11 9v6M13 9v6" />
          <circle cx="12" cy="12" r="1.2" />
        </svg>
      );
    case 'shoe':
      return (
        <svg {...common}>
          <path d="M3 16h12l4-2 2-2-4-4-3 3-2-1-2 2H6Z" />
          <path d="M3 16v2h18v-2" />
        </svg>
      );
  }
}
