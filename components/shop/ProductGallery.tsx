'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { PRODUCT_BLUR_DATA_URL } from '@/lib/image-blur';
import imageLoader from '@/lib/image-loader';

/**
 * ProductGallery — Kalki-style PDP gallery.
 *
 * Vertical thumbnail rail on the left, large main image on the right with
 * manual zoom controls (+/- buttons) and drag-to-pan while zoomed.
 */
// Max thumbnails visible in the desktop rail before the list becomes a
// vertical carousel. Chosen so a tall PDP (aspect-[4/5] main image at
// ~800px) still shows every thumb without the rail overflowing the main.
const THUMB_LIMIT = 7;

// Manual zoom steps — 1x = fit, each + button press advances to the next.
const ZOOM_STEPS = [1, 1.5, 2, 2.5, 3] as const;

export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  // Manual zoom state. `zoomIdx` indexes into ZOOM_STEPS so + / - cycle
  // between discrete, predictable magnifications. `offset` is the pan
  // translation in px applied to the zoomed image. `drag` tracks an
  // in-flight pointer drag so pan continues while the pointer is held.
  const [zoomIdx, setZoomIdx] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const thumbsRef = useRef<HTMLDivElement | null>(null);

  const zoomLevel = ZOOM_STEPS[zoomIdx];
  const isZoomed = zoomIdx > 0;

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

  // Reset zoom + pan whenever the user switches to a different thumbnail
  // so each new image starts from the fit view instead of inheriting a
  // crop that may land on empty space.
  useEffect(() => {
    setZoomIdx(0);
    setOffset({ x: 0, y: 0 });
  }, [active]);

  // Clamp an offset so the zoomed image can't be dragged past its own
  // edges. At scale S, the overflow on each axis is (S-1) * halfSide,
  // which is also (S-1) * rect.{width,height} / 2.
  const clampOffset = (x: number, y: number) => {
    const el = stageRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const maxX = ((zoomLevel - 1) * rect.width) / 2;
    const maxY = ((zoomLevel - 1) * rect.height) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  const zoomIn = () => {
    setZoomIdx((i) => Math.min(ZOOM_STEPS.length - 1, i + 1));
  };
  const zoomOut = () => {
    setZoomIdx((i) => {
      const next = Math.max(0, i - 1);
      // Snap pan back to centre when we return to 1x so the next zoom-in
      // starts from a neutral position.
      if (next === 0) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  // Drag-to-pan — shared mouse + touch handlers. The ref captures the
  // starting pointer position AND the pan offset at drag-start so moves
  // compute a delta from that anchor instead of accumulating round-off.
  const beginDrag = (clientX: number, clientY: number) => {
    if (!isZoomed) return;
    dragRef.current = { startX: clientX, startY: clientY, baseX: offset.x, baseY: offset.y };
    setDragging(true);
  };
  const moveDrag = (clientX: number, clientY: number) => {
    const d = dragRef.current;
    if (!d) return;
    const next = clampOffset(d.baseX + (clientX - d.startX), d.baseY + (clientY - d.startY));
    setOffset(next);
  };
  const endDrag = () => {
    dragRef.current = null;
    setDragging(false);
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
          // Drag-to-pan — only wires up when zoomed in; at 1x the stage is
          // inert so clicks on the + button and surrounding UI behave
          // normally. touchAction:'none' prevents the browser from
          // hijacking vertical drags as a page scroll.
          onMouseDown={(e) => {
            if (!isZoomed) return;
            e.preventDefault();
            beginDrag(e.clientX, e.clientY);
          }}
          onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={(e) => {
            const t = e.touches[0];
            if (!t) return;
            beginDrag(t.clientX, t.clientY);
          }}
          onTouchMove={(e) => {
            const t = e.touches[0];
            if (!t) return;
            moveDrag(t.clientX, t.clientY);
          }}
          onTouchEnd={endDrag}
          onTouchCancel={endDrag}
          style={{ touchAction: isZoomed ? 'none' : 'auto' }}
          className={`relative aspect-[4/5] overflow-hidden bg-gray-100 select-none ${
            isZoomed ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
          }`}
        >
          {/* Zoom + pan wrapper. CSS transform keeps the Image component
              itself intact (next/image still manages the responsive srcset)
              while we move/scale a wrapper around it. transition is off
              during an active drag so panning feels 1:1 with the pointer. */}
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: dragging ? 'none' : 'transform 200ms ease-out',
              willChange: 'transform',
            }}
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
              className="object-cover pointer-events-none"
              draggable={false}
            />
          </div>

          {/* Brand watermark — subtle T+V monogram in the lower-right corner.
              Sits outside the zoom wrapper so it stays pinned at a fixed
              screen size and position regardless of zoom level. */}
          <img
            src="/brand/logomark-cream.svg"
            alt=""
            aria-hidden
            className="absolute bottom-4 right-4 w-12 h-12 md:w-14 md:h-14 pointer-events-none select-none"
            style={{ opacity: 0.32, mixBlendMode: 'overlay' }}
          />

          {/* Manual zoom controls — top-right. Solid white pills with a
              ring + drop-shadow so they read on both dark saree
              photography and light flat-lays. Buttons are disabled at the
              ends of the range so screen readers announce the limit. */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoomIdx === ZOOM_STEPS.length - 1}
              aria-label="Zoom in"
              title="Zoom in"
              className="w-11 h-11 flex items-center justify-center rounded-full bg-white text-[#75001F] ring-1 ring-black/10 shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:bg-[#75001F] hover:text-white hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#75001F] disabled:hover:scale-100 transition-all"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
                <path d="M11 8v6M8 11h6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoomIdx === 0}
              aria-label="Zoom out"
              title="Zoom out"
              className="w-11 h-11 flex items-center justify-center rounded-full bg-white text-[#75001F] ring-1 ring-black/10 shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:bg-[#75001F] hover:text-white hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#75001F] disabled:hover:scale-100 transition-all"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
                <path d="M8 11h6" />
              </svg>
            </button>
          </div>

          {/* Zoom level indicator — appears only when zoomed, bottom
              centre. Doubles as a hint that the user can drag to pan. */}
          {isZoomed && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/80 text-white text-xs font-medium px-3.5 py-2 rounded-full shadow-md pointer-events-none">
              {zoomLevel}× · drag to pan
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
