'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SAREES, BADGE_LABEL, type BadgeKind, formatINR, productSlug } from '@/lib/sarees';
import { getProductHero } from '@/lib/product-images';
import WishlistButton from '@/components/shop/WishlistButton';
import AddToCartButton from '@/components/shop/AddToCartButton';

type Saree = (typeof SAREES)[number];

const BADGE_CLASS: Record<BadgeKind, string> = {
  ready: 'bg-green-100 text-green-800 border border-green-200',
  fast: 'bg-orange-100 text-orange-800 border border-orange-200',
  last: 'bg-red-100 text-red-800 border border-red-200',
};

export default function ProductCard({
  saree,
  priority = false,
  showAddToBag = false,
}: {
  saree: Saree;
  priority?: boolean;
  // Renders a hover-only "Add to Bag" CTA over the image. Off by default so
  // shop grid cards stay clean — the wishlist opts in to make one-tap
  // moves from wishlist → cart possible.
  showAddToBag?: boolean;
}) {
  const { mrp, badges } = saree;
  const discount = mrp ? Math.round(((mrp - saree.price) / mrp) * 100) : 0;
  const outOfStock = typeof saree.stock === 'number' && saree.stock <= 0;

  return (
    <Link href={`/shop/${productSlug(saree)}`} className="group block bg-white">
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-100">
        <Image
          src={getProductHero(saree)}
          alt={saree.name}
          fill
          priority={priority}
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 28vw, 22vw"
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${outOfStock ? 'opacity-60 grayscale' : ''}`}
        />

        {outOfStock && (
          <div className="absolute top-2 left-2 z-20 pointer-events-none">
            <span className="bg-black/85 text-white px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide">
              Out of Stock
            </span>
          </div>
        )}

        {discount > 0 && !outOfStock && (
          <div className="absolute top-2 left-2 bg-[#75001F] text-white px-2 py-0.5 text-[0.65rem] font-bold tracking-wide z-10">
            {discount}% OFF
          </div>
        )}

        <WishlistButton
          productId={saree.id}
          className="absolute top-2 right-2 w-8 h-8 z-10"
          size={14}
        />

        {/* Brand watermark — cream T+V monogram, bottom-left corner. */}
        <img
          src="/brand/logomark-cream.svg"
          alt=""
          aria-hidden
          draggable={false}
          className="absolute bottom-2 left-2 w-5 h-5 md:w-6 md:h-6 opacity-75 pointer-events-none select-none z-10"
        />

        {badges.length > 0 && (
          <div className="absolute bottom-2 left-10 right-2 flex flex-wrap gap-1 pointer-events-none">
            {badges.map((b) => (
              <span
                key={b}
                className={`${BADGE_CLASS[b]} px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide`}
              >
                {BADGE_LABEL[b]}
              </span>
            ))}
          </div>
        )}

        {showAddToBag && !outOfStock && (
          <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
            <div className="pointer-events-auto">
              <AddToCartButton
                productId={saree.id}
                variant="primary"
                className="w-full !px-3 !py-2.5"
              >
                Add to Bag
              </AddToCartButton>
            </div>
          </div>
        )}
      </div>

      <div className="p-2.5">
        <h3 className="text-sm text-gray-900 leading-snug line-clamp-2 mb-1.5 group-hover:text-[#75001F] transition-colors">
          {saree.name}
        </h3>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-base font-bold text-gray-900 tabular-nums">
            {formatINR(saree.price)}
          </span>
          {mrp && (
            <>
              <span className="text-xs text-gray-500 line-through tabular-nums">
                {formatINR(mrp)}
              </span>
              <span className="text-xs font-bold text-[#75001F] tabular-nums">
                {discount}% OFF
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
