'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { PRODUCT_BLUR_DATA_URL } from '@/lib/image-blur';
import imageLoader from '@/lib/image-loader';

/**
 * ProductGallery — Kalki-style PDP gallery.
 *
 * Vertical thumbnail rail on the left, large main image on the right with a
 * hover-to-zoom magnifier overlay. On hover, the cursor area is sampled and
 * the same image is shown at higher scale, anchored to the cursor position.
 */
// Max thumbnails visible in the desktop rail before the list becomes a
// vertical carousel. Chosen so a tall PDP (aspect-[4/5] main image at
// ~800px) still shows every thumb without the rail overflowing the main.
const THUMB_LIMIT = 7;

export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const stageRef = useRef<HTMLDivElement | null>(null);
  const thumbsRef = useRef<HTMLDivElement | null>(null);

  const main = images[active] ?? images[0];
  const carousel = images.length > THUMB_LIMIT;

  // Warm the browser cache for the OTHER gallery frames at main-stage
  // size, but only AFTER the first paint — otherwise these full-size
  // requests fight the hero and the small thumbnails for bandwidth and
  // slow the page down instead of helping. requestIdleCallback (fallback
  // setTimeout) runs this in the browser's idle time; fetchpriority=low
  // keeps it behind anything the user is actually looking at. Resulting
  // bytes land in the HTTP cache, so clicking a thumb later renders
  // instantly from disk.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const warm = () => {
      // Cap at the first few non-active frames — PDPs with 7+ images
      // would otherwise fire a dozen background requests on top of the
      // visible ones. Three covers the common "click the next thumb"
      // case while leaving bandwidth for the user's actual actions.
      let warmed = 0;
      for (let i = 0; i < images.length && warmed < 3; i++) {
        if (i === active) continue;
        const img = new window.Image();
        // fetchpriority is a plain HTML attribute — set it via setAttribute
        // so it survives even on browsers that don't type the property.
        img.setAttribute('fetchpriority', 'low');
        img.decoding = 'async';
        // Route through the same loader next/image uses so Cloudinary
        // serves a w_600 variant instead of the full-size original.
        img.src = imageLoader({ src: images[i], width: 600 });
        warmed++;
      }
    };
    const ric = (window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    }).requestIdleCallback;
    const handle = ric
      ? ric(warm, { timeout: 2500 })
      : window.setTimeout(warm, 800);
    return () => {
      const cic = (window as unknown as {
        cancelIdleCallback?: (h: number) => void;
      }).cancelIdleCallback;
      if (ric && cic) cic(handle as number);
      else window.clearTimeout(handle as number);
    };
    // We intentionally re-run when the image list changes, not on every
    // `active` tick — otherwise flipping thumbs would re-queue work.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  // Scroll the vertical thumbnail rail by ~3 thumbs per arrow click. Reads
  // the first child's height so changes to thumb aspect ratio or gap stay
  // in sync without hard-coding pixel values.
  const scrollThumbs = (dir: 1 | -1) => {
    const el = thumbsRef.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const step = (first.offsetHeight + 8) * 3; // gap-2 = 8px
    el.scrollBy({ top: dir * step, behavior: 'smooth' });
  };

  // Track cursor / finger position relative to the stage so the zoom
  // layer can anchor to it. Takes raw coords so it works for both mouse
  // events (clientX/Y on MouseEvent) and touch events (clientX/Y on
  // Touch). One source of truth, two input paths registered below.
  const updatePos = (clientX: number, clientY: number) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  return (
    <div className="flex gap-3 lg:gap-4">
      {/* Vertical thumbnails — desktop. Becomes a carousel with up/down
          arrows once we exceed THUMB_LIMIT so the rail never overflows
          the main image area. */}
      <div className="hidden md:flex flex-col items-stretch gap-1.5 w-20 shrink-0">
        {carousel && (
          <button
            type="button"
            onClick={() => scrollThumbs(-1)}
            aria-label="Scroll thumbnails up"
            className="h-7 flex items-center justify-center border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m6 15 6-6 6 6" />
            </svg>
          </button>
        )}
        {/* When >7 thumbs, lock the rail to exactly 7 × 100px + 6 × 8px gap
            = 748px. shrink-0 on each thumb stops flexbox from squeezing
            them to make room when the content overflows the fixed height
            — without it, every thumb would compress slightly and the 8th
            would peek through the bottom edge. */}
        <div
          ref={thumbsRef}
          className={`flex flex-col gap-2 ${carousel ? 'h-[748px] overflow-y-auto no-scrollbar scroll-smooth' : ''}`}
        >
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative aspect-[4/5] overflow-hidden border-2 shrink-0 transition-colors ${
                i === active ? 'border-gray-900' : 'border-transparent hover:border-gray-400'
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                placeholder="blur"
                blurDataURL={PRODUCT_BLUR_DATA_URL}
                className="object-cover"
              />
            </button>
          ))}
        </div>
        {carousel && (
          <button
            type="button"
            onClick={() => scrollThumbs(1)}
            aria-label="Scroll thumbnails down"
            className="h-7 flex items-center justify-center border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* Main image */}
      <div className="flex-1 min-w-0">
        <div
          ref={stageRef}
          // ── Desktop: hover-driven zoom ────────────────────────────────
          onMouseEnter={(e) => {
            setZoom(true);
            updatePos(e.clientX, e.clientY);
          }}
          onMouseMove={(e) => updatePos(e.clientX, e.clientY)}
          onMouseLeave={() => setZoom(false)}
          // ── Touch: press-and-pan zoom ─────────────────────────────────
          // touchAction:'none' on the element prevents the browser from
          // turning these gestures into a page scroll. preventDefault on
          // touchmove keeps it that way mid-drag.
          onTouchStart={(e) => {
            const t = e.touches[0];
            if (!t) return;
            setZoom(true);
            updatePos(t.clientX, t.clientY);
          }}
          onTouchMove={(e) => {
            const t = e.touches[0];
            if (!t) return;
            updatePos(t.clientX, t.clientY);
          }}
          onTouchEnd={() => setZoom(false)}
          onTouchCancel={() => setZoom(false)}
          style={{ touchAction: 'none' }}
          className="relative aspect-[4/5] overflow-hidden bg-gray-100 cursor-zoom-in select-none"
        >
          <Image
            src={main}
            alt={alt}
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
            placeholder="blur"
            blurDataURL={PRODUCT_BLUR_DATA_URL}
            className="object-cover"
            style={{ opacity: zoom ? 0 : 1, transition: 'opacity 150ms' }}
          />
          {/* Zoom layer — same image, scaled, anchored to cursor */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${main})`,
              backgroundSize: '200%',
              backgroundPosition: `${pos.x}% ${pos.y}%`,
              backgroundRepeat: 'no-repeat',
              opacity: zoom ? 1 : 0,
              transition: 'opacity 150ms',
            }}
          />
          {/* Brand watermark — subtle T+V monogram in the lower-right corner.
              Stays visible in both the static and the zoomed view so the
              brand mark is present on any screenshot of the hero shot.
              Cream monogram + multiply blend reads softly on both dark and
              light photography without ever competing with the saree. */}
          <img
            src="/brand/logomark-cream.svg"
            alt=""
            aria-hidden
            className="absolute bottom-4 right-4 w-12 h-12 md:w-14 md:h-14 pointer-events-none select-none"
            style={{ opacity: 0.32, mixBlendMode: 'overlay' }}
          />
          {/* Zoom-hint pill — bottom centre. Hides while zoomed so it
              doesn't sit on top of detail the user is trying to inspect.
              Copy works for both pointer types: hover on desktop, press
              and drag on touch (pointer events handle both). */}
          {!zoom && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 pointer-events-none">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
                <path d="M11 8v6M8 11h6" />
              </svg>
              Hover or tap to zoom
            </div>
          )}
        </div>

        {/* Mobile thumb strip */}
        <div className="md:hidden mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative aspect-[4/5] w-16 shrink-0 overflow-hidden border-2 ${
                i === active ? 'border-gray-900' : 'border-transparent'
              }`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
