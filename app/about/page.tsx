import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PolicyHeader } from '@/components/policy/PolicyChrome';
import BrandNameMeaning from '@/components/about/BrandNameMeaning';
import LogoMeaning from '@/components/about/LogoMeaning';
import VisionMission from '@/components/about/VisionMission';

export const metadata: Metadata = {
  title: 'About Us · Thridha Varnam',
  description:
    'Thridha Varnam is a premium saree brand inspired by the beauty, grace, and cultural richness of Indian womanhood. Tradition in Every Color.',
};

// Founder + Co-Founder profiles. Drop headshot images into /public and
// wire them up here when the shots land.
const founders: { name: string; role: string; initials: string; bio: string }[] = [
  {
    name: 'A. Juhith Sai',
    role: 'Founder',
    initials: 'JS',
    bio: 'A. Juhith Sai is the Founder of Thridha Varnam and a Fashion Designing graduate from JD Institute of Fashion Technology, Bengaluru (2019). With a strong passion for Indian textiles and timeless fashion, she transformed her creative vision into a premium handloom brand. Alongside her successful digital journey as the creator of Juhith Vlogs, with over 850,000 subscribers, she continues to inspire modern women by blending tradition with contemporary elegance.',
  },
  {
    name: 'Darshan Gowda C. L.',
    role: 'Co-Founder',
    initials: 'DG',
    bio: "Darshan Gowda C. L. is the Co-Founder of Thridha Varnam. Coming from a fashion background and actively involved in fashion shows and runway events, he shares a deep appreciation for Indian craftsmanship and design. Together with Juhith Sai, he co-founded Thridha Varnam with a vision to preserve India's rich weaving heritage while delivering authentic, premium handloom sarees to customers around the world. He oversees the brand's operations, sourcing, and business development.",
  },
];

const weaves: { name: string; place: string; era: string; image: string }[] = [
  { name: 'Kanjeevaram', place: 'Kanchipuram · Tamil Nadu', era: 'since the Chola dynasty', image: '/Byweaves/kanjeevaram.webp' },
  { name: 'Banarasi', place: 'Varanasi · Uttar Pradesh', era: 'since the Mughal court', image: '/Byweaves/banarasi.webp' },
  { name: 'Mysore Silk', place: 'Mysuru · Karnataka', era: 'since Tipu Sultan, 1780', image: '/Byweaves/Mysore%20silk.webp' },
  { name: 'Mangalagiri', place: 'Mangalagiri · Andhra Pradesh', era: 'since the 15th century', image: '/Byweaves/mangalagiri.webp' },
  { name: 'Pochampally', place: 'Bhoodan Pochampally · Telangana', era: 'a UNESCO-listed handloom', image: '/Byweaves/Pochampally.webp' },
  { name: 'Gadwal', place: 'Jogulamba Gadwal · Telangana', era: 'since the Krishnadevaraya court', image: '/Byweaves/Gadwal.webp' },
  { name: 'Patola', place: 'Patan · Gujarat', era: 'since the 12th century', image: '/Byweaves/Patola.webp' },
  { name: 'Fancy Sarees', place: 'Contemporary', era: 'designed for the wedding-adjacent', image: '/Byweaves/fancy-saree.webp' },
  { name: 'Mixed Pattu Sarees', place: 'Fusion · India', era: 'two traditions, one fold', image: '/Byweaves/Mixed-pattu.webp' },
];

const values: { title: string; body: string }[] = [
  {
    title: 'Craft comes first',
    body: 'From heritage handloom weaves like Kanjeevaram, Banarasi, Mysore Silk, Mangalagiri, Pochampally, Gadwal and Patola to our contemporary Fancy Sarees and Mixed Pattu fusion drapes, every piece is chosen for the authenticity of its craft. Tradition in every color — never a power-loom replica, never a mass-produced imitation.',
  },
  {
    title: 'Honest zari, declared weight',
    body: 'The zari grade and the exact thread weight of every saree are printed on the product page — so you know what you are paying for before it arrives at your door.',
  },
  {
    title: 'Fair pay to the weaver',
    body: 'Weavers are paid by the day, not the piece, and receive an additional royalty for sarees that sell above ₹40,000. The artisan name is recorded on every order.',
  },
  {
    title: 'Repair, not replace',
    body: 'A Thridha Varnam piece can be restored in our Bengaluru atelier — a torn pallu, a loose zari, a refresh of fall and pico — for the lifetime of the saree, at cost.',
  },
];

const timeline: { year: string; title: string; body: string }[] = [
  {
    year: '2025',
    title: 'The idea takes shape',
    body: 'The idea for Thridha Varnam is born. The founding team begins researching India’s classical weaving traditions, meeting master weavers across the country, and laying the groundwork for a saree house rooted in authenticity.',
  },
  {
    year: '2026',
    title: 'The house is launched',
    body: 'Thridha Varnam is officially established and launched — bringing together hand-woven heritage weaves under a single label, with a Bengaluru atelier for bespoke commissions and restoration.',
  },
];

/**
 * About page â€” aligned to the official Thridha Varnam brand kit
 * (received 2026-06-15). Composition reads top-to-bottom as:
 *
 *   1. Brand Brief        (kit page 3, verbatim) â€” intro paragraph
 *   2. Brand Name Meaning (Sanskrit / Telugu / Kannada verse + meaning)
 *   3. Logo Meaning       (kit page 5, verbatim)
 *   4. Vision & Mission   (kit page 4, verbatim, dark wine panel)
 *   5. Meet the founders  (placeholder bios — swap in real copy later)
 *   6. The Eight Weaves   (weave lineage grid)
 *   7. What we promise    (values)
 *   8. Our journey        (timeline)
 *   9. Visit / commission (atelier CTA)
 *
 * Sections 1-4 are brand-kit-verbatim. Sections 5-9 are our own
 * supporting copy. Both use the brand typography rule (Black Mango
 * for headings, Plus Jakarta Sans for body) and the brand palette
 * (ivory / ink / maroon / gold).
 */
export default function AboutPage() {
  return (
    <main className="bg-ivory text-ink">
      <PolicyHeader title="About Thridha Varnam" breadcrumb="Tradition in Every Color" />

      {/* Brand Brief â€” kit page 3, verbatim. Left column is the
          paragraph, right column shows an heirloom drape so the
          intro still has the visual weight a brand page needs. */}
      <section className="max-w-[1100px] mx-auto px-6 lg:px-10 py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-7">
            <div className="text-[0.65rem] tracking-[0.45em] uppercase text-maroon font-semibold">
              Brand Brief
            </div>
            <h2 className="mt-3 font-display text-[2rem] md:text-[2.5rem] lg:text-[2.75rem] font-medium text-ink leading-[1.1]">
              Tradition in Every Color
            </h2>

            <p className="mt-6 md:mt-8 text-base md:text-[1.05rem] leading-[1.85] text-ink/80 font-normal">
              Thridha Varnam is a premium saree brand inspired by the beauty,
              grace, and cultural richness of Indian womanhood. Rooted in
              tradition, the brand celebrates the timeless artistry of Indian
              textiles through carefully curated saree collections. Every
              design reflects elegance, craftsmanship, and the vibrant colors
              of heritage. The brand aims to connect modern women with their
              cultural roots while embracing contemporary sophistication.
              Thridha Varnam stands for authenticity, quality, and enduring
              style. Its identity is built around femininity, grace, and
              self-expression. Through luxurious fabrics and exquisite designs,
              the brand transforms every drape into a statement of confidence.
              The essence of the brand lies in preserving tradition while
              making it relevant for today&rsquo;s generation. Thridha Varnam
              is more than a saree brand &mdash; it is a celebration of culture
              and individuality. <span className="italic">Tradition in Every
              Color</span> defines the heart of the brand.
            </p>
          </div>

          <div className="lg:col-span-5 relative aspect-[4/5] overflow-hidden bg-bone">
            <Image
              src="/photos/Heirloom%20edit.webp"
              alt="Thridha Varnam heirloom saree on a model"
              fill
              sizes="(max-width: 1024px) 100vw, 450px"
              className="object-cover"
              priority={false}
            />
          </div>
        </div>
      </section>

      {/* The meaning behind the name â€” Sanskrit / Telugu / Kannada verse */}
      <BrandNameMeaning />

      {/* Logo Meaning â€” kit page 5, verbatim */}
      <LogoMeaning />

      {/* Vision & Mission â€” kit page 4, verbatim, dark wine panel */}
      <VisionMission />

      {/* Meet the founders — placeholder copy + initials portrait tiles.
          Swap the initials <div> for a next/image <Image> once real
          headshots are supplied; the surrounding card layout stays. */}
      <section className="bg-ivory border-b border-maroon/10">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-14 lg:py-20">
          <div className="text-[0.65rem] tracking-[0.45em] uppercase text-maroon font-semibold">
            Leadership
          </div>
          <h2 className="mt-3 font-display text-[1.75rem] md:text-[2rem] lg:text-[2.25rem] font-medium text-ink leading-[1.1]">
            Meet the founders
          </h2>
          <p className="mt-3 text-sm md:text-base text-ink/70 max-w-3xl leading-[1.75] mb-10 md:mb-12">
            Thridha Varnam is led by two founders who share a lifelong love
            for India's handloom traditions and a commitment to the artisan
            families behind every weave.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {founders.map((f) => (
              <article
                key={f.name}
                className="flex flex-col sm:flex-row gap-5 border border-maroon/15 bg-white p-5 lg:p-6"
              >
                <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-maroon-deep text-ivory flex items-center justify-center font-display text-2xl sm:text-3xl font-semibold tracking-wide">
                  {f.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-[0.6rem] tracking-[0.35em] uppercase text-maroon font-semibold">
                    {f.role}
                  </div>
                  <h3 className="mt-1 font-display text-xl md:text-2xl font-medium text-ink leading-tight">
                    {f.name}
                  </h3>
                  <p className="mt-3 text-sm text-ink/75 leading-[1.75]">
                    {f.bio}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-8 text-[0.7rem] text-ink/50 italic">
            Founder headshots to follow.
          </p>
        </div>
      </section>

      {/* The Eight Weaves */}
      <section className="bg-ivory border-b border-maroon/10">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-14 lg:py-20">
          <div className="text-[0.65rem] tracking-[0.45em] uppercase text-maroon font-semibold">
            Lineage
          </div>
          <h2 className="mt-3 font-display text-[1.75rem] md:text-[2rem] lg:text-[2.25rem] font-medium text-ink leading-[1.1]">
            The Eight Weaves
          </h2>
          <p className="mt-3 text-sm md:text-base text-ink/70 max-w-3xl leading-[1.75] mb-8 md:mb-10">
            Each tradition has its own loom, its own thread count, its own
            grammar. We work with master families in every one of the regions
            below.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {weaves.map((w) => (
              <Link
                key={w.name}
                href={`/shop?weave=${encodeURIComponent(w.name)}`}
                className="group block border border-maroon/15 hover:border-maroon transition-colors bg-white"
              >
                <div className="relative aspect-square overflow-hidden bg-bone">
                  <Image
                    src={w.image}
                    alt={w.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 250px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <div className="text-sm font-bold text-ink">{w.name}</div>
                  <div className="text-xs text-ink/65 mt-0.5">{w.place}</div>
                  <div className="text-[0.7rem] text-ink/55 mt-1 italic">{w.era}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-bone border-b border-maroon/10">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-14 lg:py-20">
          <div className="text-[0.65rem] tracking-[0.45em] uppercase text-maroon font-semibold">
            What we promise
          </div>
          <h2 className="mt-3 font-display text-[1.75rem] md:text-[2rem] lg:text-[2.25rem] font-medium text-ink leading-[1.1]">
            Four rules of the house
          </h2>
          <p className="mt-3 text-sm md:text-base text-ink/70 max-w-3xl leading-[1.75] mb-8 md:mb-10">
            What makes it into the catalogue, and what does not.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {values.map((v) => (
              <div key={v.title} className="bg-white border border-maroon/15 p-5 lg:p-6">
                <h3 className="text-sm md:text-base font-bold text-ink mb-1.5">{v.title}</h3>
                <p className="text-sm text-ink/75 leading-[1.75]">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-ivory border-b border-maroon/10">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-14 lg:py-20">
          <div className="text-[0.65rem] tracking-[0.45em] uppercase text-maroon font-semibold">
            Our journey
          </div>
          <h2 className="mt-3 font-display text-[1.75rem] md:text-[2rem] lg:text-[2.25rem] font-medium text-ink leading-[1.1] mb-8 md:mb-10">
            Year by year
          </h2>
          <ol className="space-y-5">
            {timeline.map((t) => (
              <li key={t.year} className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] gap-4 md:gap-6 border-b border-maroon/10 pb-5 last:border-b-0">
                <div className="text-2xl md:text-3xl font-bold text-maroon tabular-nums leading-none">
                  {t.year}
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-bold text-ink mb-1">
                    {t.title}
                  </h3>
                  <p className="text-sm text-ink/75 leading-[1.75]">{t.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Location */}
      <section className="bg-bone">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-14 lg:py-20">
          <div className="bg-white border border-maroon/15 p-6 lg:p-10 max-w-[640px] mx-auto text-center">
            <div className="text-[0.7rem] tracking-[0.32em] uppercase text-maroon font-semibold mb-2">
              Find us
            </div>
            <h3 className="font-display text-xl md:text-2xl font-medium text-ink mb-4">
              Bengaluru atelier
            </h3>
            <div className="text-sm text-ink/80 leading-[1.85]">
              Thridha Varnam Atelier<br />
              LTG LA GRAND, Block 2, No. 5<br />
              Jnanabharathi BDA Layout, Jnana Ganga Nagar<br />
              Bengaluru 560056 &middot; Karnataka, India
            </div>
            <div className="mt-5 text-xs text-ink/70">
              Open Monday to Saturday, 10:00 AM &ndash; 7:00 PM (IST) &middot; By appointment only
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
              <a
                href="https://www.google.com/maps/search/?api=1&query=LTG+LA+GRAND+Jnanabharathi+BDA+Layout+Jnana+Ganga+Nagar+Bengaluru+560056"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-ink text-ivory px-4 py-2 font-semibold tracking-wide hover:bg-maroon transition-colors"
              >
                Get directions
              </a>
              <a
                href="tel:+919949528787"
                className="border border-ink text-ink px-4 py-2 font-semibold tracking-wide hover:bg-ink hover:text-ivory transition-colors"
              >
                +91 99495 28787
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
