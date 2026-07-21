'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * LotusTrioMotif — three line-art lotus blooms with curving stems.
 *
 * Pure stroked SVG, so every path/circle has [data-draw] and the AudioGate
 * runs its stroke-dasharray draw-in animation across the lot. Three lotuses
 * — one tall full-bloom at the top, one large at mid-right, one tilted at
 * lower-left — with stems converging near the bottom edge.
 */

const PETAL_OUTLINE =
  'M 0 0 Q -12 -34 -3 -72 Q 0 -78 3 -72 Q 12 -34 0 0 Z';
const PETAL_STRIPE_C = 'M 0 -10 Q -2 -36 -1 -62';
const PETAL_STRIPE_L = 'M -3 -10 Q -8 -32 -3 -54';
const PETAL_STRIPE_R = 'M 3 -10 Q 8 -32 3 -54';

function LotusBlossom({ scale = 1 }: { scale?: number }) {
  const layers = [
    // outermost row — broad petals fanned wide
    { angles: [-82, -42, 0, 42, 82], scaleFactor: 1.0 },
    // middle row — narrower fan
    { angles: [-55, -22, 22, 55], scaleFactor: 0.82 },
    // inner row — small upright petals
    { angles: [-25, 0, 25], scaleFactor: 0.55 },
  ];

  return (
    <g transform={`scale(${scale})`}>
      {layers.map((layer, li) =>
        layer.angles.map((angle, pi) => (
          <g key={`${li}-${pi}`} transform={`rotate(${angle}) scale(${layer.scaleFactor})`}>
            <path data-draw d={PETAL_OUTLINE} />
            <path data-draw d={PETAL_STRIPE_C} opacity="0.55" />
            <path data-draw d={PETAL_STRIPE_L} opacity="0.40" />
            <path data-draw d={PETAL_STRIPE_R} opacity="0.40" />
          </g>
        )),
      )}
      {/* Centre cup — receptacle */}
      <ellipse data-draw cx="0" cy="-14" rx="6" ry="10" />
      <path data-draw d="M -3 -10 Q 0 -22 3 -10" opacity="0.55" />
      {/* Stigma dots */}
      <circle data-draw cx="-3" cy="-19" r="1.3" fill="currentColor" stroke="none" />
      <circle data-draw cx="3" cy="-19" r="1.3" fill="currentColor" stroke="none" />
      <circle data-draw cx="0" cy="-22" r="1.3" fill="currentColor" stroke="none" />
    </g>
  );
}

export default function LotusTrioMotif({
  className = '',
}: {
  className?: string;
}) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      // The stroke-draw animation itself is owned by AudioGate's master
      // timeline — running a second one here causes the two tweens to fight
      // for the same property and the brand reveal ends up slipping.
      // Here we only handle the soft container fade-in and the post-draw sway.

      // Group entrance — gentle fade-in for the whole composition
      gsap.from(ref.current, {
        opacity: 0,
        scale: 0.96,
        y: 14,
        duration: 1.2,
        ease: 'power3.out',
      });

      // After everything is drawn, very subtle continuous sway
      gsap.to(ref.current, {
        rotation: 0.6,
        transformOrigin: '50% 95%',
        duration: 5,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: 4,
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 600 520"
      width="100%"
      height="auto"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* ── Lotus 1 — top centre-left, full open bloom ─────────────── */}
      <g transform="translate(220 140) rotate(-6)">
        <LotusBlossom scale={1.15} />
        {/* Long curving stem reaching down to the bottom edge */}
        <path data-draw d="M 0 22 Q -8 140 -28 280 Q -38 400 -22 510" />
        {/* A side leaf-bud halfway down the stem */}
        <path
          data-draw
          d="M -32 270 Q -52 268 -64 282 Q -56 296 -36 290 Q -32 282 -32 270 Z"
          opacity="0.85"
        />
        <path data-draw d="M -42 278 L -56 286" opacity="0.5" />
      </g>

      {/* ── Lotus 2 — mid-right, large open bloom ──────────────────── */}
      <g transform="translate(450 220) rotate(14)">
        <LotusBlossom scale={1.05} />
        {/* Stem curves down and slightly to the left */}
        <path data-draw d="M 0 22 Q -12 160 -34 320 Q -44 420 -34 510" />
      </g>

      {/* ── Lotus 3 — lower-left, smaller and tilted ───────────────── */}
      <g transform="translate(150 310) rotate(-20)">
        <LotusBlossom scale={0.85} />
        {/* Shorter stem — this lotus sits lower already */}
        <path data-draw d="M 0 22 Q 12 90 30 170 Q 44 240 60 290" />
      </g>
    </svg>
  );
}
