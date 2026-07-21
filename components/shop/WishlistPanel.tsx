'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Saree } from '@/lib/sarees';
import { useShop } from '@/lib/shop-store';
import { useLoginModal } from '@/lib/login-modal';
import { useAuth } from '@/lib/auth';
import ProductCard from './ProductCard';

export default function WishlistPanel({
  heading,
}: {
  heading: { title: string; sub: string };
}) {
  const { wishlist, hydrated, clearWishlist, getProduct } = useShop();
  const { openLogin } = useLoginModal();
  const { user, hydrated: authHydrated } = useAuth();
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  // Resolve every wishlisted id through the shop-store cache so backend
  // sarees (id = SAR-XXX) render alongside the static catalog ones.
  const items = wishlist
    .map((id) => getProduct(id))
    .filter((s): s is Saree => Boolean(s));

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    const title = 'My Thridha Varnam wishlist';
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch {
      /* user cancelled — fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareNotice('Link copied to clipboard');
      setTimeout(() => setShareNotice(null), 2200);
    } catch {
      setShareNotice('Could not copy — long-press to copy the URL');
      setTimeout(() => setShareNotice(null), 2800);
    }
  };

  return (
    <div className="bg-ivory min-h-screen text-ink">
      <div className="max-w-[1720px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <h1 className="text-center text-4xl md:text-5xl font-semibold tracking-tight text-ink">
          {heading.title}
        </h1>

        {!hydrated ? (
          <GridSkeleton />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {authHydrated && !user && (
              <p className="mt-6 text-center text-sm md:text-base text-ink/70">
                To save your wishlist please{' '}
                <button
                  type="button"
                  onClick={() => openLogin()}
                  className="underline underline-offset-4 text-ink hover:text-maroon transition-colors"
                >
                  login
                </button>{' '}
                or{' '}
                <button
                  type="button"
                  onClick={() => openLogin()}
                  className="underline underline-offset-4 text-ink hover:text-maroon transition-colors"
                >
                  sign up
                </button>
                .
              </p>
            )}

            <div className="mt-6 flex items-center justify-center gap-7 flex-wrap text-sm text-ink/85">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 hover:text-maroon transition-colors"
              >
                <IconShare />
                Share wishlist
              </button>
              <button
                type="button"
                onClick={clearWishlist}
                className="inline-flex items-center gap-2 hover:text-maroon transition-colors"
              >
                <IconClose />
                Clear wishlist
              </button>
            </div>

            {shareNotice && (
              <p className="mt-3 text-center text-xs text-maroon" role="status">
                {shareNotice}
              </p>
            )}

            <div className="mt-12 lg:mt-14 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-6 lg:gap-y-12">
              {items.map((saree, i) => (
                <ProductCard key={saree.id} saree={saree} priority={i < 4} showAddToBag />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center pt-10 pb-20 max-w-md mx-auto">
      <p className="text-base md:text-lg text-ink/70">
        Your wishlist is empty
      </p>
      <Link
        href="/shop"
        className="mt-8 inline-block bg-maroon-deep text-ivory px-10 py-3.5 text-sm font-semibold tracking-wide hover:bg-maroon transition-colors"
      >
        Discover more
      </Link>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="mt-12 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="aspect-[4/5] bg-bone animate-pulse" />
          <div className="h-3 bg-bone w-3/4 animate-pulse" />
          <div className="h-4 bg-bone w-1/2 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function IconShare() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
