'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  productsApi,
  categoriesApi,
  type BackendProduct,
  type BackendCategory,
} from '@/lib/api';

// The parent still passes a Saree-shaped object (needed elsewhere on the
// detail page), but this accordion renders backend data only — no fallback
// to any hardcoded copy or static saree fields. Sections and rows with no
// backend content are hidden.
export default function ProductAccordion({ saree }: { saree: { id: string } }) {
  const [backend, setBackend] = useState<BackendProduct | null>(null);
  const [categories, setCategories] = useState<BackendCategory[]>([]);

  useEffect(() => {
    let cancelled = false;
    productsApi
      .get(saree.id)
      .then((p) => {
        if (!cancelled) setBackend(p);
      })
      .catch(() => {
        if (!cancelled) setBackend(null);
      });
    categoriesApi
      .list()
      .then((rows) => {
        if (!cancelled) setCategories(rows);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, [saree.id]);

  const story = backend?.story?.trim() ?? '';
  const styleTips = backend?.styleTips?.trim() ?? '';
  const fitTips = backend?.fitTips?.trim() ?? '';
  const shippingReturns = backend?.shippingReturns?.trim() ?? '';
  const faqs = (backend?.faqs ?? []).filter((f) => f?.q?.trim() || f?.a?.trim());

  return (
    <div className="border-t border-gray-200">
      <Section title="Product Details" defaultOpen>
        <ProductDetailsTable backend={backend} categories={categories} />
      </Section>

      {story && (
        <Section title="Product Speciality" defaultOpen>
          <p className="text-sm text-gray-700 leading-relaxed">{story}</p>
        </Section>
      )}

      {(styleTips || fitTips) && (
        <Section title="Style & Fit Tips">
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            {styleTips && (
              <p>
                <strong className="text-gray-900">Style Tips:</strong> {styleTips}
              </p>
            )}
            {fitTips && (
              <p>
                <strong className="text-gray-900">Fit Tips:</strong> {fitTips}
              </p>
            )}
          </div>
        </Section>
      )}

      {shippingReturns && (
        <Section title="Shipping & Returns">
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            {shippingReturns.split(/\n\s*\n/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            <Link href="/returns" className="text-[#75001F] font-semibold text-sm hover:underline">
              Read full return policy →
            </Link>
          </div>
        </Section>
      )}

      {faqs.length > 0 && (
        <Section title="FAQs">
          {faqs.map((f, i) => (
            <FaqRow key={i} q={f.q} a={f.a} />
          ))}
        </Section>
      )}
    </div>
  );
}

function ProductDetailsTable({
  backend,
  categories,
}: {
  backend: BackendProduct | null;
  categories: BackendCategory[];
}) {
  if (!backend) return null;

  // Resolve the category id stored on the product to its display name.
  // If the category was deleted or the product references an unknown id,
  // fall back to the raw id string so the shopper still sees something
  // recognisable.
  const categoryName = backend.category
    ? categories.find((c) => c.id === backend.category)?.name || backend.category
    : '';

  const rows: { label: string; value: string }[] = [
    { label: 'Style No', value: backend.styleNo?.trim() ?? '' },
    { label: 'Design No', value: backend.designNo?.trim() ?? '' },
    { label: 'Color', value: backend.color?.trim() ?? '' },
    { label: 'Work', value: backend.weave?.trim() ?? '' },
    { label: 'Region', value: backend.region?.trim() ?? '' },
    { label: 'Category', value: categoryName },
    { label: 'Length', value: backend.length?.trim() ?? '' },
    { label: 'Blouse', value: backend.blouse?.trim() ?? '' },
    { label: 'Zari', value: backend.zari?.trim() ?? '' },
    { label: 'Weight', value: backend.weight?.trim() ?? '' },
    { label: 'Pack Contains', value: backend.packContains?.trim() ?? '' },
    { label: 'Manufactured', value: backend.manufactured?.trim() ?? '' },
  ].filter((r) => r.value);

  if (rows.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
      {rows.map((r) => (
        <div key={r.label} className="flex flex-col">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">{r.label}</span>
          <span className="text-gray-700 mt-0.5">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <h2 className="text-base font-bold text-gray-900 group-hover:text-[#75001F] transition-colors">
          {title}
        </h2>
        <span className={`text-2xl text-gray-500 transition-transform ${open ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-3 text-left group"
      >
        <span className="text-sm font-semibold text-gray-900 group-hover:text-[#75001F] transition-colors">
          {q}
        </span>
        <span className={`text-xl text-gray-500 transition-transform shrink-0 ${open ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      {open && <p className="pb-3 pr-8 text-sm text-gray-700 leading-relaxed">{a}</p>}
    </div>
  );
}
