'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatINR, productSlug, type Saree } from '@/lib/sarees';
import { backendToSaree, cloudinaryUrl, type BackendOccasion } from '@/lib/api';
import { useHomeData } from '@/lib/home-data';

// Shape rendered by every card.
type EditCard = {
  key: string;
  badge: string;
  title: string;
  description: string;
  href: string;
  products: Saree[];
};

function priceRangeText(o: BackendOccasion): string {
  const from = o.fromAmount && o.fromAmount > 0 ? o.fromAmount : 0;
  const to = o.toAmount && o.toAmount > 0 ? o.toAmount : 0;
  if (from && to) return `${formatINR(from)} – ${formatINR(to)} pieces, curated.`;
  if (from) return `From ${formatINR(from)} — curated ${o.name.toLowerCase()} looks.`;
  if (to) return `Up to ${formatINR(to)} — curated ${o.name.toLowerCase()} looks.`;
  return `Curated ${o.name.toLowerCase()} looks from the atelier.`;
}

export default function CraftStory() {
  const { products: rawProducts, occasions: rawOccasions } = useHomeData();

  const catalog = useMemo<Saree[]>(
    () => (rawProducts ?? []).map((p) => backendToSaree(p)),
    [rawProducts],
  );
  const occasions = useMemo<BackendOccasion[]>(
    () => rawOccasions.filter((o) => o.name),
    [rawOccasions],
  );
  const loaded = rawProducts !== null;

  // Backend occasions drive the section. Every occasion becomes a card
  // — the product-thumbnail grid populates when at least one product's
  // `occasion` field matches the occasion name, otherwise the card
  // shows just its badge / title / description / CTA. Only when the
  // backend has zero occasions do we fall back to the static curated
  // edits below.
  const backendCards: EditCard[] = occasions.map((o) => {
    // Product records may store either the occasion's id (what the
    // admin dropdown submits — <option value={o.id}>) or its name.
    // Match on both so the tiles fill in regardless of which was
    // saved on the product.
    const products = catalog
      .filter((s) => s.occasion === o.id || s.occasion === o.name)
      .slice(0, 3);
    return {
      key: o.id || o.name,
      badge: o.name,
      title: o.name,
      description: priceRangeText(o),
      // Link with the occasion id (not name) so the FilterRail
      // checkbox and the URL/chip stay in sync on the shop page.
      href: `/shop?${new URLSearchParams({ occasion: o.id || o.name }).toString()}`,
      products,
    };
  });

  const cards = backendCards;

  // Hide the section entirely when there's nothing to show and the
  // fetch has resolved — avoids a flash of empty grid.
  if (loaded && cards.length === 0) return null;

  return (
    <section className="bg-ivory py-10 md:py-14">
      <div className="max-w-[1720px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between mb-6 md:mb-8 flex-wrap gap-3">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">
            Shop the edits
          </h2>
          <Link
            href="/shop"
            className="text-sm font-semibold text-ink hover:text-maroon transition-colors underline underline-offset-4"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          {cards.map((edit) => (
            <div
              key={edit.key}
              className="bg-bone rounded-sm overflow-hidden flex flex-col"
            >
              <div className="p-5">
                <div className="inline-block bg-maroon text-ivory px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider rounded-sm mb-3">
                  {edit.badge}
                </div>
                <h3 className="font-display text-xl font-semibold text-ink leading-tight mb-2">
                  {edit.title}
                </h3>
                <p className="text-sm text-ink/65 leading-relaxed">
                  {edit.description}
                </p>
              </div>

              {edit.products.length > 0 && (
                <div className="grid grid-cols-3 gap-1 px-3">
                  {edit.products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/shop/${productSlug(product)}`}
                      className="group relative aspect-[3/4] overflow-hidden bg-white rounded-sm"
                    >
                      <Image
                        src={cloudinaryUrl(product.image, 400)}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 33vw, 12vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 px-2 py-1.5 bg-gradient-to-t from-[#1B0E0A]/90 to-transparent">
                        <div className="text-[0.7rem] font-bold text-ivory leading-none">
                          {formatINR(product.price)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-auto p-5 pt-4">
                <Link
                  href={edit.href}
                  className="inline-flex items-center justify-center w-full bg-maroon-deep text-ivory px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-maroon transition-colors"
                >
                  Shop the Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
