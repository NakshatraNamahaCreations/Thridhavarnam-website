/**
 * VisionMission — kit-verbatim Vision & Mission paragraph, matching
 * page 4 of the official Thridha Varnam brand identity PDF (2026-06-15)
 * as strictly as possible.
 *
 * Kit page 4 rules being honoured:
 *   • Background: deep wine #4D0015 (maroon-deep)
 *   • Pattern texture: cream wash, very low opacity, full-bleed
 *   • Heading "Vision & Mission" — Black Mango at a light-medium weight,
 *     ivory cream, left-aligned at the top of the section
 *   • Body paragraph — Plus Jakarta Sans, regular weight, ivory cream,
 *     left-aligned, sits beneath the heading with generous breathing room
 *   • Both heading and body use the FULL ivory tone (#F7EAD9) — the
 *     kit does NOT mute the body to a grey/translucent cream, both
 *     sit at the same warm cream colour.
 *   • Layout has lots of vertical whitespace; section is tall and
 *     unhurried.
 */
export default function VisionMission() {
  return (
    <section className="relative bg-maroon-deep text-ivory overflow-hidden">
      {/* Heritage pattern wash — cream-tinted brand tile at very low
          opacity so it reads as a woven backdrop, never as decoration. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/brand/pattern-title.svg')",
          backgroundRepeat: 'repeat',
          backgroundSize: '480px auto',
          opacity: 0.06,
          filter:
            'brightness(0) saturate(100%) invert(95%) sepia(15%) saturate(450%) hue-rotate(355deg)',
        }}
      />

      <div className="relative max-w-[1100px] mx-auto px-6 lg:px-10 py-20 md:py-24 lg:py-28">
        {/* Heading — Black Mango at font-medium (weight 500), matches
            the kit's lighter display treatment on page 4. */}
        <h2 className="font-display text-[2.25rem] md:text-[2.75rem] lg:text-[3.25rem] font-medium text-ivory leading-[1.1]">
          Vision &amp; Mission
        </h2>

        {/* Body — Plus Jakarta Sans (default sans), regular weight,
            full ivory tone (no opacity reduction — kit body sits at
            full cream, not muted), generous line-height for reading. */}
        <p className="mt-8 md:mt-10 text-base md:text-[1.05rem] lg:text-[1.1rem] leading-[1.85] text-ivory max-w-[78ch] font-normal">
          At Thridha Varnam, our vision is to become a celebrated saree brand
          that preserves the richness of Indian heritage while inspiring women
          to embrace elegance, culture, and confidence. Our mission is to offer
          premium sarees that blend timeless craftsmanship with modern
          sophistication, ensuring every drape reflects beauty, authenticity,
          and tradition. Through exquisite designs, exceptional quality, and a
          deep respect for cultural artistry, we strive to create meaningful
          experiences that make every woman feel graceful, empowered, and
          connected to her roots.
        </p>
      </div>
    </section>
  );
}
