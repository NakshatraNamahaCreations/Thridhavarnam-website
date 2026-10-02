'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'tridhavarnam-recently-viewed';
const MAX_ITEMS = 12;

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* quota / disabled */
  }
}

/**
 * Push the current product id to the front of the recently-viewed list and
 * return the rest of the list (excluding the current id). Hydration-safe.
 */
export function useRecentlyViewed(currentId: string): string[] {
  const [others, setOthers] = useState<string[]>([]);

  useEffect(() => {
    const existing = read();
    const without = existing.filter((id) => id !== currentId);
    const next = [currentId, ...without].slice(0, MAX_ITEMS);
    write(next);
    setOthers(without.slice(0, MAX_ITEMS - 1));
  }, [currentId]);

  return others;
}
