'use client';

import { useEffect } from 'react';
import { useScrollLock } from '@/lib/scroll-lock';

/**
 * SignOutConfirmDialog — small modal shown before the auth store's
 * `signOut()` fires. Rendered by any surface with a Sign Out trigger so
 * the user has a chance to cancel.
 */
export default function SignOutConfirmDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-title"
      data-lenis-prevent
    >
      <button
        type="button"
        aria-label="Cancel sign out"
        onClick={onCancel}
        className="absolute inset-0 bg-[#1B0E0A]/70 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-sm bg-bone no-pattern shadow-2xl rounded-2xl p-6 md:p-7">
        <h2 id="signout-title" className="text-lg font-semibold text-ink">
          Sign out?
        </h2>
        <p className="mt-2 text-sm text-ink/65">
          You'll need to sign in again to view your orders, addresses and wishlist.
        </p>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-semibold text-ink hover:bg-ink/5 transition-colors rounded-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className="px-4 py-2.5 text-sm font-semibold text-ivory bg-maroon-deep hover:bg-maroon transition-colors rounded-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
