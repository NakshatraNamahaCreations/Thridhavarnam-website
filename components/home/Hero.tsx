'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { SAREES, formatINR, TIERS, productSlug } from '@/lib/sarees';
import { useShop } from '@/lib/shop-store';

// Featured hero sarees — actual products, not lifestyle vibes.
// Each slide is anchored to a real id from lib/sarees.ts so the price,
// weave, region & link stay in sync with the catalog.
const featuredIds = [
  'banarasi-raktarani',
  'fancy-haldi',
  'patola-rasleela',
  'kanjivaram-mayura',
  'mysore-chandrika',
];

const slideImages: Record<string, string> = {
  'banarasi-raktarani': '/homebanner/raktharani%20banarasi.webp',
  'fancy-haldi': '/Partysarees/P1.webp',
  'patola-rasleela': '/homebanner/Rasleela%20Patola.webp',
  'kanjivaram-mayura': '/homebanner/Mayura%20kanjeevaram.webp',
  'mysore-chandrika': '/homebanner/chandrika%20mysore.webp',
};

// Per-slide image framing — `object-position` value passed straight to the
// Image's `style.objectPosition`. The right hero pane is a tall narrow area;
// without biasing toward the top of each source image, faces get cropped.
// Each entry is "X% Y%" — Y closer to 0 means anchor higher (more of the head
// stays in frame). Tweak per slide if a particular shot needs different bias.
const slideObjectPosition: Record<string, string> = {
  'banarasi-raktarani': '50% 25%',
  'fancy-haldi':        '60% 20%',
  'patola-rasleela':    '50% 25%',
  'kanjivaram-mayura':  '50% 22%',
  'mysore-chandrika':   '50% 22%',
};
// Fallback for any new slide added without an explicit entry above.
const DEFAULT_OBJECT_POSITION = '50% 25%';

export default function Hero() {
  const { addToCart, toggleWishlist, inWishlist, hydrated } = useShop();
  const slides = featuredIds
    .map((id) => SAREES.find((s) => s.id === id))
    .filter((s): s is (typeof SAREES)[number] => Boolean(s));

  const [active, setActive] = useState(0);
  const [adding, setAdding] = useState<string | null>(null);

  const handleAddToBag = (productId: string) => {
    addToCart(productId, 1);
    setAdding(productId);
    window.setTimeout(() => setAdding((p) => (p === productId ? null : p)), 1500);
  };

  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => (a + 1) % slides.length);
    }, 7000);
    return () => clearInterval(id);
  }, [slides.length]);

  const next = () => setActive((a) => (a + 1) % slides.length);
  const prev = () => setActive((a) => (a - 1 + slides.length) % slides.length);

  return (
    <section className="relative w-full h-[88vh] min-h-[460px] sm:min-h-[560px] md:min-h-[640px] max-h-[920px] bg-[#1B0E0A] overflow-hidden">
      {slides.map((saree, i) => {
        const tier = TIERS[saree.tier];
        const img = slideImages[saree.id] ?? saree.image;
        return (
          <div
            key={saree.id}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              opacity: i === active ? 1 : 0,
              pointerEvents: i === active ? 'auto' : 'none',
            }}
            aria-hidden={i !== active}
          >
            {/* Image — right side only, ~58% of viewport.
                The seam between image and section bg is handled by a CSS
                mask applied directly to the image, not a separate overlay
                gradient div. Two reasons:
                  • A second absolutely-positioned layer over the photo can
                    leave a sub-pixel render boundary at its right edge.
                  • `transparent` resolves to rgba(0,0,0,0) in CSS gradients,
                    so the previous overlay was interpolating its color
                    toward black at the tail, producing a faint dark band.
                With the mask, the image's own alpha falls off into the
                section's solid #1B0E0A — no extra layer, no colour blend,
                no edge. */}
            <div
              className="absolute inset-y-0 right-0 w-full md:w-[60%] lg:w-[58%]"
              style={{
                maskImage:
                  'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.18) 22%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.85) 62%, black 80%, black 100%)',
                WebkitMaskImage:
                  'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.18) 22%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.85) 62%, black 80%, black 100%)',
              }}
            >
              <Image
                src={img}
                alt={saree.name}
                fill
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
                style={{
                  objectPosition:
                    slideObjectPosition[saree.id] ?? DEFAULT_OBJECT_POSITION,
                }}
              />
            </div>

            {/* On mobile the photo sits behind the text — dark overlay covers it */}
            <div className="md:hidden absolute inset-0 bg-[#1B0E0A]/75 pointer-events-none" />

            {/* Product panel — sits on the solid ink left half */}
            <div className="relative h-full max-w-[1720px] mx-auto px-6 md:px-10 lg:px-14 flex items-center">
              {/* max-w cap is viewport-aware at md+ so the text panel never
                  overflows the left ~40% column at high browser zoom (where
                  the absolute right-pane image stays at 60vw but a fixed
                  rem-based max-w-lg would collide with it). */}
              <div className="max-w-lg md:max-w-[min(32rem,38vw)] text-ivory">
                {/* Tier chip + new badge */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="bg-gold text-ink px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider rounded-sm">
                    {tier.title}
                  </span>
                  {i === 0 && (
                    <span className="bg-maroon text-ivory px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider rounded-sm">
                      New In
                    </span>
                  )}
                </div>

                {/* Saree name + weave */}
                <div className="text-xs md:text-sm font-medium text-ivory/65 mb-2 uppercase tracking-wide">
                  {saree.weave} · {saree.region.split(',')[0]}
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-5">
                  {saree.name}
                </h1>
                <p className="text-sm md:text-base text-ivory/80 leading-relaxed mb-6 line-clamp-3">
                  {saree.story}
                </p>

                {/* Price block */}
                <div className="flex items-baseline gap-3 mb-7">
                  <div className="text-3xl md:text-4xl font-bold text-ivory leading-none">
                    {formatINR(saree.price)}
                  </div>
                  <div className="text-xs text-ivory/55">
                    Inclusive of all taxes
                  </div>
                </div>

                {/* CTA row */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-5">
                  <button
                    type="button"
                    onClick={() => handleAddToBag(saree.id)}
                    className={`inline-flex items-center gap-2 px-5 sm:px-7 py-3.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors ${
                      adding === saree.id
                        ? 'bg-peacock text-ivory'
                        : 'bg-ivory text-ink hover:bg-gold'
                    }`}
                  >
                    {adding === saree.id ? (
                      <>Added ✓</>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M5 7h14l-1 14H6L5 7Z" />
                          <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                        </svg>
                        Add to Bag
                      </>
                    )}
                  </button>
                  <Link
                    href={`/shop/${productSlug(saree)}`}
                    className="inline-flex items-center gap-2 border border-ivory/40 text-ivory px-4 sm:px-5 py-3.5 text-xs font-bold uppercase tracking-wider rounded-sm hover:border-gold hover:text-gold transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(saree.id)}
                    aria-label={
                      hydrated && inWishlist(saree.id)
                        ? 'Remove from wishlist'
                        : 'Save to wishlist'
                    }
                    aria-pressed={hydrated && inWishlist(saree.id)}
                    className={`w-11 h-11 sm:w-12 sm:h-12 border flex items-center justify-center rounded-sm transition-colors shrink-0 ${
                      hydrated && inWishlist(saree.id)
                        ? 'border-gold bg-gold/20 text-gold'
                        : 'border-ivory/40 text-ivory hover:border-gold hover:text-gold'
                    }`}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill={hydrated && inWishlist(saree.id) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M20.8 6.6a5.5 5.5 0 0 0-9-1.7l-.8.8-.8-.8a5.5 5.5 0 1 0-7.8 7.8l8.6 8.5 8.6-8.5a5.5 5.5 0 0 0 1.2-6.1Z" />
                    </svg>
                  </button>
                </div>

                {/* Trust micro-row */}
                <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-1.5 text-[0.7rem] sm:text-xs text-ivory/65 font-medium">
                  <span>✓ Hand-Woven Heirloom</span>
                  <span>✓ Free Shipping Across India</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Slide thumbnails — bottom-centred, click to jump to product */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActive(i)}
            aria-label={`Show ${s.name}`}
            className={clsx(
              'relative overflow-hidden transition-all duration-500',
              i === active
                ? 'w-12 h-12 ring-2 ring-gold ring-offset-2 ring-offset-ink/80'
                : 'w-10 h-10 opacity-65 hover:opacity-100',
            )}
          >
            <Image
              src={slideImages[s.id] ?? s.image}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 bg-ivory/85 hover:bg-ivory text-ink w-11 h-11 rounded-full items-center justify-center transition-colors hidden md:flex shadow-md z-10"
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 bg-ivory/85 hover:bg-ivory text-ink w-11 h-11 rounded-full items-center justify-center transition-colors hidden md:flex shadow-md z-10"
        aria-label="Next slide"
      >
        ›
      </button>

      {/* Slide counter top-right */}
      <div className="absolute top-8 right-8 z-10 flex items-center gap-2 bg-ink/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-ivory">
        <span className="text-gold-soft">
          {String(active + 1).padStart(2, '0')}
        </span>
        <span className="text-ivory/40">/</span>
        <span>{String(slides.length).padStart(2, '0')}</span>
      </div>
    </section>
  );
}
