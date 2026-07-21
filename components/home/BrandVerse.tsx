import Link from 'next/link';

/**
 * BrandVerse — compact home-page strip that introduces the brand
 * verse and meaning, with a quiet link out to the full /about page
 * where all three scripts (Sanskrit, Telugu, Kannada) are tabbed.
 *
 * Typography per the brand kit (pages 12–13):
 *   - Heading "Thridha Varnam" → Black Mango (font-display)
 *   - Indic verse              → font-display (falls through to system
 *                                Indic font for non-Latin glyphs)
 *   - All other body / italic  → Plus Jakarta Sans (default sans)
 */
export default function BrandVerse() {
  return (
    <section className="bg-ivory border-y border-maroon/10">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-14 md:py-20">
        <div className="text-center">
          <div className="text-[0.6rem] tracking-[0.45em] uppercase text-maroon font-semibold">
            The meaning behind our name
          </div>
          <h2 className="mt-3 font-display text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-medium text-ink leading-[1.1]">
            Thridha Varnam
          </h2>
          <p className="mt-3 text-sm text-ink/65 italic">
            Threefold splendour of colour.
          </p>
        </div>

        {/* Sanskrit verse — single script on the home page, full
            trilingual treatment lives on /about. */}
        <div
          lang="sa"
          className="mt-8 md:mt-10 text-center font-display text-lg md:text-xl lg:text-[1.55rem] leading-[1.85] text-ink/90"
        >
          <div>वर्णानां शोभिता नारी,</div>
          <div>संस्कृतेः दिव्यरूपिणी।</div>
          <div>त्रिधा वर्णं धारयन्ती,</div>
          <div>सौन्दर्यं लोकभूषणम्॥</div>
        </div>

        {/* Ornamental divider */}
        <div className="mt-7 flex items-center justify-center gap-3 text-maroon/40">
          <span className="h-px w-14 bg-current" />
          <img
            src="/brand/star-flower.svg"
            alt=""
            aria-hidden
            width={14}
            height={14}
            className="h-3.5 w-3.5 opacity-70"
          />
          <span className="h-px w-14 bg-current" />
        </div>

        {/* English translation — Plus Jakarta Sans italic (body rule). */}
        <blockquote className="mt-6 text-center max-w-2xl mx-auto">
          <p className="italic text-sm md:text-base text-ink/75 leading-[1.75]">
            &ldquo;A woman glowing in beautiful colours reflects divine
            culture. With Thridha Varnam, she becomes the true ornament
            of beauty in the world.&rdquo;
          </p>
        </blockquote>

        <div className="mt-7 text-center">
          <Link
            href="/about"
            className="text-[0.7rem] font-bold tracking-[0.22em] uppercase text-maroon hover:text-maroon-deep underline underline-offset-4 decoration-maroon/30 hover:decoration-maroon-deep"
          >
            Read the meaning in Telugu &amp; Kannada
          </Link>
        </div>
      </div>
    </section>
  );
}
