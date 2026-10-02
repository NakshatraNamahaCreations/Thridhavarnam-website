'use client';

import { useState } from 'react';

export type PolicyAccordionItem = { q: string; a: string };

export default function PolicyAccordion({ items }: { items: PolicyAccordionItem[] }) {
  return (
    <div className="border-t border-gray-200">
      {items.map((it, i) => (
        <Row key={i} item={it} />
      ))}
    </div>
  );
}

function Row({ item }: { item: PolicyAccordionItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-3.5 text-left group"
      >
        <span className="text-sm font-semibold text-gray-900 group-hover:text-[#75001F] transition-colors pr-4">
          {item.q}
        </span>
        <span
          className={`text-xl text-gray-500 transition-transform shrink-0 ${
            open ? 'rotate-45' : ''
          }`}
          aria-hidden
        >
          +
        </span>
      </button>
      {open && <p className="pb-4 pr-8 text-sm text-gray-700 leading-relaxed">{item.a}</p>}
    </div>
  );
}
