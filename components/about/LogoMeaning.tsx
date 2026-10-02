import Image from 'next/image';

/**
 * LogoMeaning — kit-verbatim "Logo Meaning" paragraph from page 5 of
 * the official Thridha Varnam brand identity (2026-06-15). Pairs the
 * vertical lockup with the explanatory copy so visitors understand
 * why the mark looks the way it does.
 *
 * Typography rule (per kit pages 12–13):
 *   - Heading      → Black Mango (font-display)
 *   - Body / copy  → Plus Jakarta Sans (default sans)
 *
 * Layout: vertical lockup on the left, paragraph on the right, on a
 * cream surface so the maroon mark reads at full brand contrast.
 */
export default function LogoMeaning() {
  return (
    <section className="bg-ivory border-y border-maroon/10">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-16 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Vertical lockup */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] max-w-[360px] mx-auto bg-ivory no-pattern">
              <Image
                src="/brand/logo-vertical.svg"
                alt="Thridha Varnam vertical lockup"
                fill
                sizes="(max-width: 1024px) 80vw, 360px"
                className="object-contain"
                priority={false}
              />
            </div>
          </div>

          {/* Copy */}
          <div className="lg:col-span-7">
            <div className="text-[0.65rem] tracking-[0.45em] uppercase text-maroon font-semibold">
              Logo Meaning
            </div>
            <h2 className="mt-3 font-display text-[2rem] md:text-[2.5rem] lg:text-[2.75rem] font-medium text-ink leading-[1.1]">
              The mark, decoded
            </h2>

            <p className="mt-6 md:mt-8 text-base md:text-[1.05rem] leading-[1.85] text-ink/80 font-normal">
              The logo is a refined monogram that merges the initials T and V of
              Thridha Varnam into a single elegant symbol. The large vertical and
              horizontal structure forms the T, representing strength, heritage,
              and the foundation of the brand. The flowing curved form creates
              the V, symbolizing grace, movement, and the drape of a saree. The
              contrast between the bold geometric T and the soft organic V
              reflects the balance between tradition and modern sophistication.
              The small star accent adds a sense of brilliance, celebration, and
              premium craftsmanship, suggesting beauty that stands out. The deep
              maroon color reinforces luxury, cultural richness, and timeless
              elegance. Overall, the mark communicates a premium saree brand
              rooted in heritage, femininity, and refined style.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
