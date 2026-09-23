'use client';

import { useCallback, useEffect, useState } from 'react';
import { reviewsApi, type BackendReview } from './api';

export type Review = {
  id: string;
  productId: string;
  name: string;
  rating: number; // 1..5
  comment: string;
  createdAt: number;
};

function backendToReview(r: BackendReview): Review {
  const ts = Date.parse(r.createdAt);
  return {
    id: r.id,
    productId: r.productId,
    name: r.name,
    rating: r.rating,
    comment: r.comment ?? '',
    createdAt: Number.isFinite(ts) ? ts : Date.now(),
  };
}

/**
 * useReviews — hydration-safe hook returning the reviews for a product,
 * an `add` function that persists to the backend, and an aggregate
 * (count + average). Reviews are fetched on mount and after each add.
 */
export function useReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHydrated(false);
    reviewsApi
      .list(productId)
      .then((rows) => {
        if (cancelled) return;
        setReviews(rows.map(backendToReview));
        setHydrated(true);
      })
      .catch(() => {
        if (cancelled) return;
        setReviews([]);
        setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const add = useCallback(
    async (review: Omit<Review, 'id' | 'productId' | 'createdAt'>) => {
      const created = await reviewsApi.create({
        productId,
        name: review.name,
        rating: review.rating,
        comment: review.comment,
      });
      setReviews((prev) => [backendToReview(created), ...prev]);
    },
    [productId],
  );

  const count = reviews.length;
  const average = count
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
    : 0;

  return { reviews, hydrated, add, count, average };
}
