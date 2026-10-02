'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * GajaLakshmiMotif — twin-elephant + lotus folk-art motif.
 *
 * Renders /images/elephant-lotus.webp with a CSS filter chain that turns
 * the black-on-white illustration into a gold silhouette on the dark
 * welcome backdrop, and uses `mix-blend-mode: screen` so the white
 * background dissolves into the page. On mount, fades up with a soft
 * scale entrance.
 */
export default function GajaLakshmiMotif({
  className = '',
}: {
  className?: string;
}) {
  const ref = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        opacity: 0,
        scale: 0.94,
        y: 18,
        duration: 1.8,
        delay: 0.5,
        ease: 'power3.out',
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src="/images/elephant-lotus.webp"
      alt=""
      aria-hidden
      className={`h-auto block ${className}`}
      style={{
        // invert flips colours (black → white, white → black),
        // then sepia + hue-rotate + saturate tint it gold.
        filter:
          'invert(1) brightness(1.05) sepia(0.85) saturate(3) hue-rotate(-12deg) brightness(0.92)',
        // The now-black background blends into the dark page backdrop.
        mixBlendMode: 'screen',
      }}
    />
  );
}
