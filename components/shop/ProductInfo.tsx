'use client';

import { useMemo, useState } from 'react';
import { type SAREES, formatINR, getColorways } from '@/lib/sarees';
import { useShop } from '@/lib/shop-store';
import { useCheckoutModal } from '@/lib/checkout-modal';
import { useLoginModal } from '@/lib/login-modal';
import { useAuth } from '@/lib/auth';

type Saree = (typeof SAREES)[number];

const PRE_DRAPE_PRICE = 1750;

export default function ProductInfo({
  saree,
  mrp,
  badge,
  viewers,
  deliveryDate,
  colorId,
  onColorChange,
}: {
  saree: Saree;
  mrp?: number;
  badge?: string;
  viewers: number;
  deliveryDate: string;
  colorId: string;
  onColorChange: (id: string) => void;
}) {
  const { addToCart, inCart, toggleWishlist, inWishlist, hydrated } = useShop();
  const { openCheckout } = useCheckoutModal();
  const { openLogin } = useLoginModal();
  const { user, hydrated: authHydrated } = useAuth();

  // Express-checkout: drop the saree into the cart (if not already there)
  // and open the checkout popup. Gated — opens the login modal first if
  // the user isn't signed in, then resumes via the post-login callback.
  const handleBuyItNow = () => {
    if (!authHydrated) return;
    const proceed = () => {
      if (!inCart(saree.id)) addToCart(saree.id, 1);
      openCheckout();
    };
    if (!user) {
      openLogin(proceed);
      return;
    }
    proceed();
  };
  const colorways = useMemo(() => getColorways(saree), [saree]);
  const selectedColor = colorways.find((c) => c.id === colorId) ?? colorways[0];
  const [blouseOption, setBlouseOption] = useState<'unstitched' | 'stitched'>('unstitched');
  const [preDrape, setPreDrape] = useState(false);
  const [showPreDrapeInfo, setShowPreDrapeInfo] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);

  const discount = mrp ? Math.round(((mrp - saree.price) / mrp) * 100) : 0;
  const stitchingFee = blouseOption === 'stitched' ? 800 : 0;
  const total = saree.price + stitchingFee + (preDrape ? PRE_DRAPE_PRICE : 0);

  const onShare = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: saree.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote('Link copied');
      setTimeout(() => setShareNote(null), 1800);
    } catch {
      /* user cancelled */
    }
  };

  const saved = hydrated && inWishlist(saree.id);

  return (
    <div className="lg:sticky lg:top-[200px]">
      {/* Title row + heart + share */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug flex-1">
          {saree.name}
        </h1>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => toggleWishlist(saree.id)}
            aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={saved}
            className="p-2 text-gray-700 hover:text-[#75001F] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20.8 6.6a5.5 5.5 0 0 0-9-1.7l-.8.8-.8-.8a5.5 5.5 0 1 0-7.8 7.8l8.6 8.5 8.6-8.5a5.5 5.5 0 0 0 1.2-6.1Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onShare}
            aria-label="Share"
            className="p-2 text-gray-700 hover:text-gray-900 transition-colors relative"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
              <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
            </svg>
            {shareNote && (
              <span className="absolute top-full right-0 mt-1 bg-gray-900 text-white text-[0.65rem] px-2 py-0.5 whitespace-nowrap">
                {shareNote}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Style number */}
      <div className="text-xs text-gray-500 mb-3">
        Style No <span className="text-gray-700 font-medium">{saree.id.toUpperCase()}</span>
      </div>

      {badge && (
        <div className="inline-block bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 text-xs font-semibold mb-3">
          {badge}
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3 flex-wrap mb-1">
        <span className="text-2xl font-bold text-gray-900 tabular-nums">
          {formatINR(saree.price)}
        </span>
        {mrp && (
          <>
            <span className="text-base text-gray-500 line-through tabular-nums">
              MRP {formatINR(mrp)}
            </span>
            <span className="text-base font-bold text-[#75001F] tabular-nums">
              ({discount}% OFF)
            </span>
          </>
        )}
      </div>
      <div className="text-xs text-gray-500 mb-5">Inclusive of all taxes</div>

      {/* Color */}
      {colorways.length > 0 && selectedColor && (
        <div className="mb-5">
          <div className="text-sm font-semibold text-gray-900 mb-2">
            Color : <span className="font-normal text-gray-700">{selectedColor.name}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {colorways.map((c) => {
              const active = c.id === selectedColor.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onColorChange(c.id)}
                  aria-label={`Choose colour ${c.name}`}
                  aria-pressed={active}
                  className={`w-9 h-9 rounded-full border-2 transition-all relative ${
                    active
                      ? 'border-gray-900 p-0.5'
                      : 'border-transparent hover:border-gray-400 p-0.5'
                  }`}
                >
                  <span
                    className="block w-full h-full rounded-full border border-gray-200"
                    style={{ backgroundColor: c.hex }}
                  />
                  {active && (
                    <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/40 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Blouse stitching */}
      <div className="mb-5">
        <div className="text-sm font-semibold text-gray-900 mb-2">
          Blouse Stitching Option : <span className="font-normal text-gray-700">
            {blouseOption === 'unstitched' ? 'Unstitched' : 'Stitched (+₹800)'}
          </span>
        </div>
        <div className="flex gap-2">
          {(['unstitched', 'stitched'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setBlouseOption(opt)}
              className={`px-4 py-2 text-sm font-semibold border transition-colors ${
                blouseOption === opt
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 text-gray-900 hover:border-gray-900'
              }`}
            >
              {opt === 'unstitched' ? 'Unstitched' : 'Stitched'}
            </button>
          ))}
        </div>
      </div>

      {/* Add-on: pre-drape */}
      <div className="border-t border-gray-200">
        <label className="flex items-start gap-3 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={preDrape}
            onChange={() => setPreDrape(!preDrape)}
            className="mt-0.5 w-4 h-4 accent-gray-900"
          />
          <div className="flex-1 text-sm">
            <span className="font-medium text-gray-900">
              Pre-Drape this Saree + {formatINR(PRE_DRAPE_PRICE)}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowPreDrapeInfo((v) => !v);
              }}
              aria-expanded={showPreDrapeInfo}
              className="ml-2 text-xs text-[#75001F] hover:underline"
            >
              {showPreDrapeInfo ? 'Hide' : 'Learn More'}
            </button>
          </div>
        </label>
        {showPreDrapeInfo && (
          <div className="mb-3 ml-7 mr-1 p-3 bg-gray-50 border-l-2 border-[#75001F] text-xs text-gray-700 leading-relaxed space-y-1.5">
            <p>
              Our atelier pre-pleats and stitches your saree into a ready-to-wear drape — you step in and zip up, no pinning, no folding.
            </p>
            <p>
              Add <strong>+{formatINR(PRE_DRAPE_PRICE)}</strong> at checkout and provide your measurements once the order is placed. Adds 5–7 working days to dispatch.
            </p>
            <p className="text-gray-500">
              Pre-draped sarees are custom-fit and therefore non-returnable.
            </p>
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="mt-5 grid gap-3">
        <button
          type="button"
          onClick={() => addToCart(saree.id, 1)}
          className="w-full border-2 border-gray-900 text-gray-900 bg-white py-3.5 text-sm font-bold uppercase tracking-wide hover:bg-gray-900 hover:text-white transition-colors flex items-center justify-center gap-3"
        >
          <span>Add to Cart</span>
          <span className="w-1 h-1 rounded-full bg-current" />
          <span className="tabular-nums">{formatINR(total)}</span>
        </button>
        <button
          type="button"
          onClick={handleBuyItNow}
          className="w-full bg-[#4D0015] text-white py-3.5 text-sm font-bold uppercase tracking-wide hover:bg-[#75001F] transition-colors"
        >
          Buy It Now
        </button>
      </div>

      {/* Viewer note */}
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-700">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#75001F]" aria-hidden>
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span><strong className="font-semibold">{viewers}</strong> people are viewing this item. Don&apos;t wait!</span>
      </div>

      {/* Estimated delivery */}
      <div className="mt-3 flex items-center gap-2 text-sm text-gray-700 border-t border-gray-200 pt-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700" aria-hidden>
          <path d="M3 7h11v9H3zM14 11h4l3 3v2h-7z" />
          <circle cx="7" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" />
        </svg>
        <span>Estimated delivery: <strong className="font-bold text-gray-900">{deliveryDate}</strong></span>
      </div>

      {/* Trust quartet */}
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 pt-4 border-t border-gray-200">
        <TrustItem icon="percent" label="100% Purchase Protection" />
        <TrustItem icon="return" label="Exchange & returns within 48 Hrs*" />
        <TrustItem icon="star" label="Assured Quality" />
        <TrustItem icon="truck" label="Free shipping across India" />
      </div>
    </div>
  );
}

function TrustItem({
  icon,
  label,
}: {
  icon: 'percent' | 'return' | 'star' | 'truck';
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-700">
      <span className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 shrink-0">
        <Icon name={icon} />
      </span>
      <span>{label}</span>
    </div>
  );
}

function Icon({ name }: { name: 'percent' | 'return' | 'star' | 'truck' }) {
  const c = {
    width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const, 'aria-hidden': true,
  };
  switch (name) {
    case 'percent':
      return (<svg {...c}><circle cx="12" cy="12" r="9" /><path d="m8 16 8-8" /><circle cx="9" cy="9" r="1.2" /><circle cx="15" cy="15" r="1.2" /></svg>);
    case 'return':
      return (<svg {...c}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>);
    case 'star':
      return (<svg {...c}><path d="m12 2 2.9 6.9L22 10l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.2L2 10l7.1-1.1L12 2Z" /></svg>);
    case 'truck':
      return (<svg {...c}><path d="M3 7h11v9H3zM14 11h4l3 3v2h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" /></svg>);
  }
}
