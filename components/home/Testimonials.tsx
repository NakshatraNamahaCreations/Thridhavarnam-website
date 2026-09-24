'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SAREES, formatINR, productSlug, type Saree } from '@/lib/sarees';
import { productsApi, backendToSaree } from '@/lib/api';

type Review = {
  productId: string;
  customer: string;
  city: string;
  rating: number;
  quote: string;
  occasion: string;
};

// Editorial quote / customer / occasion copy paired with each bestseller
// slot. Bestsellers themselves come from the backend (products flagged
// `bestseller` in the admin panel), so image + name + price stay in
// sync with the catalogue — only the review-style copy is curated here.
const reviews: Review[] = [
  {
    productId: 'banarasi-raktarani',
    customer: 'Priya M.',
    city: 'New Delhi',
    rating: 5,
    quote: "Felt like my grandmother's wedding piece. The pallu detail is unreal.",
    occasion: 'Sangeet',
  },
  {
    productId: 'kanjivaram-mayura',
    customer: 'Lakshmi I.',
    city: 'Chennai',
    rating: 5,
    quote: 'Petni weave is faultless. One of three pieces I will leave my daughters.',
    occasion: 'Saptapadi',
  },
  {
    productId: 'fancy-haldi',
    customer: 'Anushka K.',
    city: 'London',
    rating: 5,
    quote: 'Shipped to London in 7 days. Arrived in cotton, perfect.',
    occasion: 'Diwali',
  },
];

function Stars({ count, size = 12 }: { count: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={i < count ? 'text-gold-deep' : 'text-ink/15'}
          aria-hidden
        >
          <path d="m12 2 2.9 6.9L22 10l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.2L2 10l7.1-1.1L12 2Z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  // Backend-driven bestseller list. Falls back to the reviews' hardcoded
  // productIds resolved against the static SAREES catalogue when the
  // backend returns nothing, so the section is never empty.
  const [bestsellers, setBestsellers] = useState<Saree[]>([]);

  useEffect(() => {
    let cancelled = false;
    productsApi
      .list()
      .then((rows) => {
        if (cancelled) return;
        const sarees = rows
          .map(backendToSaree)
          .filter((s) => Array.isArray(s.flags) && s.flags.includes('bestseller'));
        setBestsellers(sarees);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Build the render list: one card per review slot, matched to a
  // bestseller when available (cycled if there are fewer than 3), or
  // the static SAREES entry named in the review as the last fallback.
  const cards = reviews
    .map((r, i) => {
      const chosen = bestsellers.length
        ? bestsellers[i % bestsellers.length]
        : SAREES.find((s) => s.id === r.productId);
      if (!chosen) return null;
      return { review: r, product: chosen };
    })
    .filter((c): c is { review: Review; product: Saree } => Boolean(c));

  return (
    <section className="bg-ivory py-10 md:py-14">
      <div className="max-w-[1720px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between mb-6 md:mb-8 flex-wrap gap-3">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">
              Top-rated by patrons
            </h2>
            <div className="flex items-center gap-2 mt-2 text-sm text-ink/65">
              <Stars count={5} size={14} />
              <span><span className="font-bold text-ink">4.9</span> from 1,240+ reviews</span>
            </div>
          </div>
          <Link
            href="/reviews"
            className="text-sm font-semibold text-ink hover:text-maroon transition-colors underline underline-offset-4"
          >
            All Reviews
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {cards.map(({ review: r, product }) => (
            <Link
              key={r.customer + product.id}
              href={`/shop/${productSlug(product)}`}
              className="group bg-white block overflow-hidden border border-ink/10 hover:border-ink/30 rounded-sm transition-colors"
            >
              <div className="grid grid-cols-5">
                {/* Mobile + tablet use a 2/3 split so the content column
                    has room for the price + Shop Now CTA without clipping.
                    Desktop keeps the original 3/2 image-dominant layout
                    (flips on at lg, in sync with the parent grid going
                    3-column at the same breakpoint). */}
                <div className="col-span-2 lg:col-span-3 relative aspect-[3/4] bg-bone">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 40vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-ivory/95 no-pattern backdrop-blur-sm px-2 py-1 text-[0.65rem] font-semibold text-ink uppercase tracking-wide rounded-sm">
                    {product.weave}
                  </div>
                </div>

                <div className="col-span-3 lg:col-span-2 p-3 lg:p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 bg-bone px-1.5 py-0.5 rounded-sm">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-gold-deep" aria-hidden>
                        <path d="m12 2 2.9 6.9L22 10l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.2L2 10l7.1-1.1L12 2Z" />
                      </svg>
                      <span className="text-[0.7rem] font-bold text-ink">{r.rating}.0</span>
                    </div>
                    <span className="text-[0.65rem] bg-maroon text-ivory px-1.5 py-0.5 rounded-sm font-semibold uppercase tracking-wider">
                      {r.occasion}
                    </span>
                  </div>
                  <p className="text-[0.8rem] text-ink/75 leading-snug line-clamp-4 mb-3 flex-1">
                    &ldquo;{r.quote}&rdquo;
                  </p>
                  <div className="text-[0.7rem] text-ink/60 mb-3 font-medium">
                    — {r.customer} · {r.city}
                  </div>
                  <div className="pt-3 border-t border-ink/10">
                    <h3 className="text-[0.8rem] font-semibold text-ink leading-tight mb-1.5 line-clamp-2 lg:line-clamp-1">
                      {product.name}
                    </h3>
                    {/* Mobile stacks price above the Shop Now CTA so no
                        flex layout can ever clip the link, regardless of
                        column width. md+ goes back to side-by-side, which
                        is the desktop look the user wants preserved. */}
                    <div className="flex flex-col lg:flex-row lg:items-baseline lg:justify-between gap-1 lg:gap-2">
                      <div className="text-sm font-bold text-ink">
                        {formatINR(product.price)}
                      </div>
                      <span className="text-[0.7rem] font-bold text-maroon group-hover:text-ink transition-colors whitespace-nowrap">
                        Shop Now →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
