'use client';

import { useEffect, useState } from 'react';
import { useReviews, type Review } from '@/lib/reviews';

export default function ProductReviews({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const { reviews, hydrated, add, count, average } = useReviews(productId);
  const [open, setOpen] = useState(false);

  return (
    <section className="bg-white border-t border-gray-200">
      <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-8 lg:py-10">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 text-center mb-5">
          Customer Reviews
        </h2>

        <div className="max-w-3xl mx-auto">
          {/* Summary card */}
          <div className="flex items-center justify-between flex-wrap gap-4 border border-gray-200 p-5">
            <div>
              <Stars value={hydrated ? average : 0} size={18} />
              <div className="text-sm text-gray-600 mt-1">
                {!hydrated
                  ? 'Loading reviews…'
                  : count === 0
                  ? 'Be the first to write a review'
                  : `${average.toFixed(1)} out of 5 · ${count} ${count === 1 ? 'review' : 'reviews'}`}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="bg-gray-900 text-white px-6 py-2.5 text-sm font-bold uppercase tracking-wide hover:bg-[#75001F] transition-colors"
            >
              Write a Review
            </button>
          </div>

          {/* Review list */}
          {hydrated && reviews.length > 0 && (
            <ul className="mt-6 divide-y divide-gray-200 border border-gray-200 bg-white">
              {reviews.map((r) => (
                <li key={r.id} className="p-5">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                    <div className="flex items-center gap-2">
                      <Stars value={r.rating} size={14} />
                      <span className="text-sm font-semibold text-gray-900">{r.name}</span>
                    </div>
                    <time className="text-xs text-gray-500" dateTime={new Date(r.createdAt).toISOString()}>
                      {formatDate(r.createdAt)}
                    </time>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-gray-700 leading-relaxed mt-2 whitespace-pre-wrap">
                      {r.comment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {open && (
        <WriteReviewModal
          productName={productName}
          onClose={() => setOpen(false)}
          onSubmit={(data) => {
            add(data);
            setOpen(false);
          }}
        />
      )}
    </section>
  );
}

function WriteReviewModal({
  productName,
  onClose,
  onSubmit,
}: {
  productName: string;
  onClose: () => void;
  onSubmit: (data: Omit<Review, 'id' | 'productId' | 'createdAt'>) => void;
}) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [touched, setTouched] = useState(false);

  // Close on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const nameError = touched && name.trim().length === 0;
  const ratingError = touched && rating === 0;
  const canSubmit = name.trim().length > 0 && rating > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      rating,
      comment: comment.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div role="dialog" aria-modal="true" aria-labelledby="review-title" className="relative bg-white w-full max-w-md shadow-xl">
        <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-200">
          <div>
            <h3 id="review-title" className="text-lg font-bold text-gray-900">
              Write a Review
            </h3>
            <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{productName}</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 shrink-0"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5">
              Your Rating <span className="text-[#75001F]">*</span>
            </label>
            <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  aria-pressed={rating === n}
                  className="p-0.5"
                >
                  <Star filled={n <= (hover || rating)} size={28} />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-medium text-gray-700">{rating} / 5</span>
              )}
            </div>
            {ratingError && (
              <p className="text-xs text-[#75001F] mt-1">Please select a rating</p>
            )}
          </div>

          <div>
            <label htmlFor="reviewer-name" className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5">
              Name <span className="text-[#75001F]">*</span>
            </label>
            <input
              id="reviewer-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              className={`w-full border px-3 py-2 text-sm focus:outline-none focus:border-gray-900 ${
                nameError ? 'border-[#75001F]' : 'border-gray-300'
              }`}
            />
            {nameError && (
              <p className="text-xs text-[#75001F] mt-1">Please enter your name</p>
            )}
          </div>

          <div>
            <label htmlFor="review-comment" className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5">
              Your Review
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={800}
              placeholder="How is the fabric, the fit, the colour, the finish?"
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-gray-900 resize-none"
            />
            <div className="text-xs text-gray-500 text-right mt-0.5 tabular-nums">
              {comment.length}/800
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-900 py-2.5 text-sm font-bold uppercase tracking-wide hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gray-900 text-white py-2.5 text-sm font-bold uppercase tracking-wide hover:bg-[#75001F] transition-colors"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  // Render 5 stars with partial fill for fractional values.
  const full = Math.floor(value);
  const partial = value - full;
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={size}
          filled={i < full}
          partial={i === full ? partial : 0}
        />
      ))}
    </div>
  );
}

function Star({
  filled,
  partial = 0,
  size = 16,
}: {
  filled: boolean;
  partial?: number;
  size?: number;
}) {
  // Use a clip-path for partial fill on the half-rendered star.
  if (partial > 0 && partial < 1) {
    return (
      <span className="relative inline-block" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 24 24" className="absolute inset-0 text-gray-300" fill="currentColor" aria-hidden>
          <path d="m12 2 2.9 6.9L22 10l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.2L2 10l7.1-1.1L12 2Z" />
        </svg>
        <svg width={size} height={size} viewBox="0 0 24 24" className="absolute inset-0 text-yellow-500" fill="currentColor" style={{ clipPath: `inset(0 ${100 - partial * 100}% 0 0)` }} aria-hidden>
          <path d="m12 2 2.9 6.9L22 10l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.2L2 10l7.1-1.1L12 2Z" />
        </svg>
      </span>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={filled ? 'text-yellow-500' : 'text-gray-300'}
      aria-hidden
    >
      <path d="m12 2 2.9 6.9L22 10l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.2L2 10l7.1-1.1L12 2Z" />
    </svg>
  );
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
