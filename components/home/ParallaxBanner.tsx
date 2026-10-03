'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cloudinaryUrl, type BackendBanner } from '@/lib/api';
import { useHomeData } from '@/lib/home-data';

// Hardcoded defaults — used when no active parallax banner exists on the
// backend so the storefront never renders an empty section.
const FALLBACK = {
  eyebrow: 'Featured Collection',
  title: 'The Heirloom Edit',
  subtitle:
    'Bridal Banarasi, Kanjivaram and Patola — pieces meant to be folded into the next century. Hand-woven on traditional pit looms.',
  image: '/photos/bridal.webp',
  ctaLabel: 'Explore',
  ctaHref: '/shop?tier=bridal',
};

export default function ParallaxBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { banners: rawBanners } = useHomeData();

  // First active parallax banner wins; admin can rotate by toggling `active`
  // or re-ordering via the `order` field in the Banners tab.
  const banner: BackendBanner | undefined = useMemo(
    () =>
      rawBanners
        .filter((b) => b.type === 'parallax' && b.active !== false && b.image)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0],
    [rawBanners],
  );

  const content = banner
    ? {
        eyebrow: banner.weave?.trim() || FALLBACK.eyebrow,
        title: banner.title?.trim() || FALLBACK.title,
        subtitle: banner.subtitle?.trim() || FALLBACK.subtitle,
        image: cloudinaryUrl(banner.image, 1920) || FALLBACK.image,
        ctaLabel: banner.ctaLabel?.trim() || FALLBACK.ctaLabel,
        ctaHref: banner.ctaHref?.trim() || FALLBACK.ctaHref,
      }
    : FALLBACK;

  useEffect(() => {
    if (!sectionRef.current || !imgRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {

      gsap.fromTo(
        imgRef.current,
        { yPercent: 0 },
        {
          yPercent: -16,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    }, sectionRef);


    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, [content.image]);

  return (
    <section
      ref={sectionRef}
      aria-label="Featured collection"
      className="relative w-full h-[80vh] min-h-[520px] bg-[#1B0E0A] overflow-hidden"
    >

      <div className="absolute inset-y-0 left-0 w-full md:w-[60%] lg:w-[58%] overflow-hidden">

        <img
          ref={imgRef}
          src={content.image}
          alt=""
          aria-hidden
          decoding="async"
          className="absolute top-0 left-0 w-full h-[120%] object-cover will-change-transform"
          style={{ objectPosition: '50% 30%' }}
        />

        <div
          className="absolute inset-y-0 right-0 w-[50%] pointer-events-none"
          style={{
            background:
              'linear-gradient(270deg, rgba(27,14,10,1) 0%, rgba(27,14,10,0.95) 12%, rgba(27,14,10,0.78) 28%, rgba(27,14,10,0.5) 48%, rgba(27,14,10,0.22) 70%, rgba(27,14,10,0.06) 88%, rgba(27,14,10,0) 100%)',
          }}
        />
      </div>

      {/* On mobile the photo sits behind the text — extra wash for legibility */}
      <div className="md:hidden absolute inset-0 bg-[#1B0E0A]/70 pointer-events-none" />

      {/* Content panel — sits on the solid ink right half */}
      <div className="relative h-full max-w-[1720px] mx-auto px-6 md:px-10 lg:px-14 flex items-center justify-center md:justify-end">
        <div className="max-w-md md:max-w-[min(28rem,38vw)] text-center md:text-left text-ivory">
          <div className="text-xs font-medium uppercase tracking-wider text-gold-soft mb-4">
            {content.eyebrow}
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-5">
            {content.title}
          </h2>
          <p className="text-base md:text-lg text-ivory/85 leading-relaxed mb-7">
            {content.subtitle}
          </p>
          <Link
            href={content.ctaHref}
            className="inline-flex items-center gap-2 bg-ivory text-ink px-8 py-3.5 text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-gold transition-colors"
          >
            {content.ctaLabel} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
