import Image from 'next/image';
import Link from 'next/link';
import { SAREES, formatINR, productSlug } from '@/lib/sarees';

type Edit = {
  badge: string;
  title: string;
  description: string;
  href: string;
  productIds: string[];
};

const edits: Edit[] = [
  {
    badge: 'Bridal',
    title: 'For the day you keep',
    description: 'Heirloom Banarasi, Kanjeevaram & Patola for the bride.',
    href: '/shop?tier=bridal',
    productIds: ['banarasi-raktarani', 'kanjivaram-mayura', 'patola-rasleela'],
  },
  {
    badge: 'Festive',
    title: 'For the lit hour',
    description: 'Mysore Silk, Gadwal & Pochampally for the season ahead.',
    href: '/shop?tier=festive',
    productIds: ['fancy-haldi', 'mysore-chandrika', 'banarasi-jamawar'],
  },
  {
    badge: 'Everyday',
    title: 'For the morning drape',
    description: 'Light Mangalagiri cottons & soft crepe Mysore. Always in stock.',
    href: '/shop?tier=everyday',
    productIds: ['pochampally-aakash', 'mangalagiri-tulsi', 'mysore-tara'],
  },
];

export default function CraftStory() {
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
          {edits.map((edit) => {
            const products = edit.productIds
              .map((id) => SAREES.find((s) => s.id === id))
              .filter((s): s is (typeof SAREES)[number] => Boolean(s));

            return (
              <div
                key={edit.title}
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

                <div className="grid grid-cols-3 gap-1 px-3">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/shop/${productSlug(product)}`}
                      className="group relative aspect-[3/4] overflow-hidden bg-white rounded-sm"
                    >
                      <Image
                        src={product.image}
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

                <div className="mt-auto p-5 pt-4">
                  <Link
                    href={edit.href}
                    className="inline-flex items-center justify-center w-full bg-maroon-deep text-ivory px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-maroon transition-colors"
                  >
                    Shop the Edit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
