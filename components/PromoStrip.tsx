'use client';

import { useEffect, useState } from 'react';

/**
 * PromoStrip — top-of-page rotating announcement strip mirroring the Kalki
 * Fashion pattern: dark bar, small icon on the left, single line of copy,
 * cycles every few seconds with a fade transition.
 */

type Msg = { icon: IconName; text: string };

const MESSAGES: Msg[] = [
  { icon: 'truck', text: 'Free shipping across India' },
  { icon: 'globe', text: 'Insured worldwide delivery' },
  { icon: 'hand', text: 'Hand-woven heirloom sarees' },
  { icon: 'shirt', text: 'Designer quality, hand-finished' },
];

const ROTATE_MS = 3200;
const FADE_MS = 320;

export default function PromoStrip() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = window.setInterval(() => {
      // Fade out current, swap message, fade in
      setVisible(false);
      window.setTimeout(() => {
        setIdx((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => window.clearInterval(interval);
  }, []);

  const current = MESSAGES[idx];

  return (
    <div className="bg-maroon-deep text-ivory">
      <div className="max-w-[1720px] mx-auto px-6 py-2 flex items-center justify-center gap-2.5 min-h-[34px]">
        <span
          className="text-gold-soft inline-flex transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
          aria-hidden
        >
          <Icon name={current.icon} />
        </span>
        <span
          className="text-[0.72rem] tracking-wide text-ivory/95 transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
          role="status"
          aria-live="polite"
        >
          {current.text}
        </span>
      </div>
    </div>
  );
}

type IconName = 'truck' | 'globe' | 'hand' | 'shirt' | 'return';

function Icon({ name }: { name: IconName }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (name) {
    case 'truck':
      return (
        <svg {...common}>
          <path d="M3 7h11v9H3zM14 11h4l3 3v2h-7z" />
          <circle cx="7" cy="18" r="1.6" />
          <circle cx="17.5" cy="18" r="1.6" />
        </svg>
      );
    case 'globe':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case 'hand':
      return (
        <svg {...common}>
          <path d="M9 11V5a2 2 0 1 1 4 0v6" />
          <path d="M13 11V4a2 2 0 1 1 4 0v9" />
          <path d="M17 13V7a2 2 0 1 1 4 0v9a6 6 0 0 1-6 6h-3a8 8 0 0 1-8-8v-2a2 2 0 1 1 4 0v2" />
        </svg>
      );
    case 'shirt':
      return (
        <svg {...common}>
          <path d="M8 4 4 7l2 3 2-1v11h8V9l2 1 2-3-4-3-2 2h-4Z" />
        </svg>
      );
    case 'return':
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
        </svg>
      );
  }
}
