'use client';

import Image from 'next/image';
import Link from 'next/link';
import { TIERS, SAREES, type Tier } from '@/lib/sarees';

// Override images per tier. Unmapped tiers fall back to the first matching
// saree's image in the catalog.
const tierImages: Partial<Record<Tier, string>> = {
  everyday: '/images/aangan.jpg',
  festive: '/newarrivals/sindhoori%20banarasi.jpg',
};

const tierImageFor = (tier: Tier) =>
  tierImages[tier] ??
  SAREES.find((s) => s.tier === tier)?.image ??
  '/images/c2.jpg';

const order: Tier[] = ['everyday', 'festive', 'bridal'];

export default function Tiers() {
  return (
    <section className="bg-ivory py-10 md:py-14">
      <div className="max-w-[1720px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between mb-6 md:mb-8 flex-wrap gap-3">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">
            Shop by occasion
          </h2>
          <Link
            href="/shop"
            className="text-sm font-semibold text-ink hover:text-maroon transition-colors underline underline-offset-4"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {order.map((tierId) => {
            const t = TIERS[tierId];
            const count = SAREES.filter((s) => s.tier === tierId).length;
            return (
              <Link
                href={`/shop?tier=${t.id}`}
                key={t.id}
                className="group relative block overflow-hidden bg-bone rounded-sm"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={tierImageFor(tierId)}
                    alt={t.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B0E0A]/90 via-[#1B0E0A]/20 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-ivory">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3">
                      {t.title}
                    </h3>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="text-sm text-ivory/90 font-medium">
                        {t.range}
                      </div>
                      <div className="text-xs font-medium text-ivory/70">
                        {count} pieces
                      </div>
                    </div>
                    <span className="inline-flex items-center justify-center bg-ivory no-pattern text-ink px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm group-hover:bg-gold transition-colors">
                      Shop Now
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
