'use client';

import { useCallback, useEffect, useState } from 'react';

export type Review = {
  id: number;
  productId: string;
  name: string;
  rating: number; // 1..5
  comment: string;
  createdAt: number;
};

const STORAGE_KEY = 'tridhavarnam-reviews-v1';

function readAll(): Review[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Review[]) : [];
  } catch {
    return [];
  }
}

function writeAll(reviews: Review[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    /* quota / disabled */
  }
}

/**
 * useReviews — hydration-safe hook returning the reviews for a product, an
 * `add` function, and an aggregate (count + average). Reviews persist in
 * localStorage so they survive reloads; cross-tab edits are mirrored via the
 * native `storage` event.
 */
export function useReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setReviews(readAll().filter((r) => r.productId === productId));
    setHydrated(true);
  }, [productId]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setReviews(readAll().filter((r) => r.productId === productId));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [productId]);

  const add = useCallback(
    (review: Omit<Review, 'id' | 'productId' | 'createdAt'>) => {
      const all = readAll();
      const next: Review = {
        ...review,
        id: Date.now() + Math.floor(Math.random() * 1000),
        productId,
        createdAt: Date.now(),
      };
      const updated = [next, ...all];
      writeAll(updated);
      setReviews(updated.filter((r) => r.productId === productId));
    },
    [productId],
  );

  const count = reviews.length;
  const average = count
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
    : 0;

  return { reviews, hydrated, add, count, average };
}
