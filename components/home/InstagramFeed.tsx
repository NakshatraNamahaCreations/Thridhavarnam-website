import Image from 'next/image';
import Link from 'next/link';
import { SAREES, formatINR, productSlug } from '@/lib/sarees';

type Post = {
  image: string;
  productId: string;
  likes: string;
  caption: string;
  span?: 'large';
};

const posts: Post[] = [
  {
    image: '/photos/pexels-manishjangid-28943670.webp',
    productId: 'banarasi-raktarani',
    likes: '12.4k',
    caption: 'A pink Banarasi · The Raktarani for Diwali week.',
    span: 'large',
  },
  {
    image: '/photos/pexels-manishjangid-28943594.webp',
    productId: 'fancy-haldi',
    likes: '8.2k',
    caption: 'Twilight teal — the Sandhya Drape.',
  },
  {
    image: '/photos/pexels-manishjangid-28943589.webp',
    productId: 'kanjivaram-mayura',
    likes: '6.7k',
    caption: 'The peacock pallu, petni-joined.',
  },
  {
    image: '/photos/pexels-manishjangid-28943651.webp',
    productId: 'patola-rasleela',
    likes: '9.1k',
    caption: 'Eleven months on the loom.',
  },
  {
    image: '/photos/pexels-manishjangid-28943586.webp',
    productId: 'banarasi-jamawar',
    likes: '5.3k',
    caption: 'Cut-work jamawar in deep jamuni.',
  },
  {
    image: '/photos/pexels-darkmodecinema-19567963.webp',
    productId: 'mysore-chandrika',
    likes: '7.8k',
    caption: 'Moonlight ivory · KSIC tested.',
  },
];

function InstaGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function HeartGlyph({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.8 6.6a5.5 5.5 0 0 0-9-1.7l-.8.8-.8-.8a5.5 5.5 0 1 0-7.8 7.8l8.6 8.5 8.6-8.5a5.5 5.5 0 0 0 1.2-6.1Z" />
    </svg>
  );
}

export default function InstagramFeed() {
  return (
    <section className="bg-bone py-10 md:py-14">
      <div className="max-w-[1720px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between mb-6 md:mb-8 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <InstaGlyph size={20} />
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">
                @thridhavarnam
              </h2>
            </div>
            <p className="text-sm text-ink/65">
              <span className="font-bold text-ink">128K</span> followers · Tap any tile to shop the look
            </p>
          </div>
          <Link
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-maroon-deep text-ivory px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-maroon transition-colors"
          >
            <InstaGlyph size={14} />
            Follow
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[230px]">
          {posts.map((p, i) => {
            const product = SAREES.find((s) => s.id === p.productId);
            if (!product) return null;
            const spanClass = p.span === 'large' ? 'col-span-2 row-span-2' : '';
            return (
              <Link
                key={i}
                href={`/shop/${productSlug(product)}`}
                className={`relative group overflow-hidden bg-bone rounded-sm ${spanClass}`}
              >
                <Image
                  src={p.image}
                  alt={p.caption}
                  fill
                  sizes={p.span === 'large' ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute top-3 left-3 flex items-center gap-1.5 text-ivory text-xs font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                  <HeartGlyph size={12} />
                  <span>{p.likes}</span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 bg-gradient-to-t from-[#1B0E0A]/95 via-[#1B0E0A]/60 to-transparent text-ivory">
                  <div className="transition-opacity duration-300 group-hover:opacity-0">
                    <p className="text-xs leading-snug line-clamp-2 max-w-md text-ivory/95">
                      {p.caption}
                    </p>
                  </div>

                  <div className="absolute inset-x-3 md:inset-x-4 bottom-3 md:bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[0.65rem] font-medium text-ivory/70 uppercase tracking-wide mb-0.5">
                          {product.weave}
                        </div>
                        <div className="text-sm font-bold truncate">
                          {product.name}
                        </div>
                        <div className="text-sm mt-0.5 font-bold text-gold-soft">
                          {formatINR(product.price)}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-bold uppercase tracking-wider bg-ivory no-pattern text-ink px-3 py-1.5 rounded-sm hover:bg-gold transition-colors">
                        Shop
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
