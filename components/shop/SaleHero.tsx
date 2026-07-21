'use client';

import Link from 'next/link';

/**
 * SaleHero — full-width promotional banner at the top of /shop.
 * Loud red Kalki-style sale bar with discount and direct CTA.
 */
export default function SaleHero() {
  return (
    <section aria-label="Sale" className="relative w-full bg-[#75001F] text-white">
      <div className="max-w-[1720px] mx-auto px-6 lg:px-10 py-5 flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-5 lg:gap-8 flex-wrap">
          <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
            FESTIVE SALE
          </div>
          <div className="hidden md:block h-7 w-px bg-white/30" />
          <div className="text-base md:text-lg font-semibold">
            FLAT 30–50% OFF on heritage weaves
          </div>
          <div className="hidden lg:block h-7 w-px bg-white/30" />
          <div className="hidden lg:block text-sm font-medium opacity-90">
            Use code <span className="font-bold">SAREE30</span> · Free shipping across India
          </div>
        </div>

        <Link
          href="/shop?sale=1"
          className="inline-flex items-center gap-2 bg-white text-[#75001F] px-5 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-yellow-100 transition-colors whitespace-nowrap"
        >
          Shop Sale
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
