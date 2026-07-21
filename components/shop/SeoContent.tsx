'use client';

import Link from 'next/link';
import { useState } from 'react';

const POPULAR_SEARCHES = [
  'Kanjeevaram', 'Banarasi Saree', 'Mysore Silk', 'Mangalagiri', 'Pochampally',
  'Gadwal', 'Patola', 'Fancy Sarees', 'Mixed Pattu Sarees', 'Bridal Saree',
];

const COLORS = ['Red', 'Maroon', 'Gold', 'Black', 'Blue', 'Green', 'Pink', 'Yellow', 'Cream', 'Purple'];
const OCCASIONS = ['Bridal', 'Wedding', 'Party', 'Reception', 'Engagement', 'Festive', 'Daily Wear'];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is the latest trend in sarees?',
    a: 'Pure hand-woven silks are leading sales — Kanjeevaram, Banarasi and Patola in particular. Buyers want documented provenance (KSIC seal for Mysore Silk, GI tag for Mangalagiri) and reverse-side fidelity that proves a hand-loom weave.',
  },
  {
    q: 'Which is the best saree fabric?',
    a: 'Pit-loom Banarasi silk for weddings. Crepe Mysore for daily wear. Patola double-ikat for heirloom investment. Gadwal silk-cotton for festive occasions. Mangalagiri for summer everyday.',
  },
  {
    q: 'How do I check if a saree is genuine?',
    a: 'The reverse side of the pallu should look as clean as the front. Border zari should feel heavy. Mysore Silk must carry the KSIC gold-foil hologram inside the pallu.',
  },
  {
    q: 'How long does delivery take?',
    a: 'All orders are dispatched within 5–7 working days, insured and tracked. Free shipping across India on every order; international orders are chargeable.',
  },
  {
    q: 'Can I return a saree?',
    a: 'Exchange and returns are available within 48 Hrs of delivery. Saree must be unworn and in original packaging. Customised pieces are non-returnable.',
  },
];

export default function SeoContent() {
  return (
    <section className="bg-white border-t border-gray-200">
      <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              Shop Sarees Online at Thridha Varnam
            </h2>
            <div className="space-y-3 text-sm text-gray-700 leading-relaxed max-w-3xl">
              <p>
                Thridha Varnam offers a curated catalogue of hand-woven heirloom sarees from India&apos;s great
                weaving traditions — Kanjeevaram, Banarasi, Mysore Silk, Mangalagiri, Pochampally, Gadwal and
                Patola — alongside contemporary Fancy Sarees and Mixed Pattu drapes. Every saree is hand-woven,
                hand-finished, and shipped worldwide with full insurance.
              </p>
              <p>
                Filter the catalogue by category (Bridal, Party, Daily Wear), by weave, by price band, or by
                sale. Use the search bar to find a specific saree or style. Wishlist your favourites and add
                to bag in one click.
              </p>
            </div>

            <h3 className="text-base font-bold text-gray-900 mt-6 mb-3 uppercase tracking-wide">
              Popular Saree Categories
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700 max-w-3xl">
              <li><strong className="text-gray-900">Bridal Sarees:</strong> Wedding-ready pit-loom Banarasi, three-loom Kanjeevaram and Mixed Pattu fusion drapes.</li>
              <li><strong className="text-gray-900">Party Wear Sarees:</strong> Gadwal pallu silks, Pochampally ikats and contemporary Fancy Sarees.</li>
              <li><strong className="text-gray-900">Daily Wear Sarees:</strong> Mangalagiri cottons, Pochampally everyday silks and soft crepe Mysore.</li>
              <li><strong className="text-gray-900">Sarees on Sale:</strong> <Link href="/shop?sale=1" className="text-[#75001F] font-bold hover:underline">Up to 50% off</Link> on curated weaves.</li>
            </ul>

            <h3 className="text-base font-bold text-gray-900 mt-6 mb-2 uppercase tracking-wide">
              Frequently Asked Questions
            </h3>
            <div className="border-t border-gray-200">
              {FAQS.map((f, i) => (
                <FaqItem key={i} q={f.q} a={f.a} />
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <Group title="Popular Searches">
              {POPULAR_SEARCHES.map((p) => (
                <Pill key={p} href={`/shop?weave=${encodeURIComponent(p.split(' ')[0])}`} label={p} />
              ))}
            </Group>
            <Group title="Shop by Colour">
              {COLORS.map((c) => (
                <Pill key={c} href="/shop" label={c} />
              ))}
            </Group>
            <Group title="Shop by Occasion">
              {OCCASIONS.map((o) => (
                <Pill key={o} href="/shop" label={o} />
              ))}
            </Group>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">{title}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Pill({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-block text-xs font-medium px-3 py-1.5 border border-gray-300 text-gray-700 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
    >
      {label}
    </Link>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-3 text-left group"
      >
        <span className="text-sm font-semibold text-gray-900 group-hover:text-[#75001F] transition-colors">
          {q}
        </span>
        <span className={`ml-4 text-xl text-gray-500 transition-transform shrink-0 ${open ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      {open && <p className="pb-3 pr-8 text-sm text-gray-700 leading-relaxed">{a}</p>}
    </div>
  );
}
