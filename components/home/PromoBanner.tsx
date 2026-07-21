import Image from 'next/image';
import Link from 'next/link';
import { SAREES, formatINR } from '@/lib/sarees';

const buckets = [
  {
    label: 'Under ₹5,000',
    sub: 'Everyday Drapes',
    href: '/shop?max=5000',
    sampleId: 'mangalagiri-tulsi',
  },
  {
    label: 'Under ₹10,000',
    sub: 'Light Festive',
    href: '/shop?max=10000',
    sampleId: 'banarasi-saanjh',
  },
  {
    label: 'Under ₹25,000',
    sub: 'Festive Picks',
    href: '/shop?max=25000',
    sampleId: 'fancy-haldi',
  },
  {
    label: '₹25,000 & above',
    sub: 'Bridal · Heirloom',
    href: '/shop?tier=bridal',
    sampleId: 'banarasi-raktarani',
  },
];

export default function PromoBanner() {
  return (
    <section className="bg-ivory py-10 md:py-14">
      <div className="max-w-[1720px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between mb-6 md:mb-8 flex-wrap gap-3">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">
            Shop by price
          </h2>
          <Link
            href="/shop"
            className="text-sm font-semibold text-ink hover:text-maroon transition-colors underline underline-offset-4"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {buckets.map((b) => {
            const sample = SAREES.find((s) => s.id === b.sampleId);
            return (
              <Link
                key={b.label}
                href={b.href}
                className="group relative aspect-[3/4] overflow-hidden bg-maroon-deep rounded-sm"
              >
                {sample && (
                  <Image
                    src={sample.image}
                    alt={sample.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B0E0A]/90 via-[#1B0E0A]/30 to-transparent" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end text-ivory">
                  <div className="text-xs font-medium text-ivory/75 mb-1 uppercase tracking-wide">
                    {b.sub}
                  </div>
                  <div className="text-xl md:text-2xl font-bold leading-tight mb-3">
                    {b.label}
                  </div>
                  {sample && (
                    <div className="text-xs text-ivory/85 mb-3">
                      Starting at <span className="font-bold">{formatINR(sample.price)}</span>
                    </div>
                  )}
                  <span className="inline-flex items-center justify-center bg-ivory no-pattern text-ink px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm self-start group-hover:bg-gold transition-colors">
                    Shop Now
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
