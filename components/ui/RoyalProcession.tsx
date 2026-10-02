'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * RoyalProcession — Gaja-Lakshmi style decorative band.
 *
 * Two mirrored, ornately blanketed elephants face each other with raised
 * trunks. Between them a stylised lotus rises on a stem with side leaves;
 * a small mandala-flower sits at hoof level. A decorative base strip with
 * dot motifs anchors the composition. Drawn in deep maroon on parchment.
 *
 * Animation (GSAP, looped):
 *   - both trunks gently lift and lower in unison
 *   - the central lotus breathes (scale)
 *   - mandalas on the elephant blankets rotate slowly in opposite directions
 *   - base-strip dots twinkle (opacity)
 *   - on first scroll into view the whole composition fades up
 */
export default function RoyalProcession() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      // Reveal on scroll
      gsap.from('[data-rp-reveal]', {
        scrollTrigger: { trigger: rootRef.current, start: 'top 85%', once: true },
        opacity: 0,
        y: 24,
        duration: 1.4,
        ease: 'power3.out',
      });
      gsap.from('[data-rp-rule]', {
        scrollTrigger: { trigger: rootRef.current, start: 'top 85%', once: true },
        scaleX: 0,
        transformOrigin: 'center center',
        duration: 1.6,
        ease: 'power3.out',
        delay: 0.2,
      });

      // Trunks wave together — both pivot at the base where the trunk
      // meets the head (≈12% from left, ≈95% from top of trunk bbox)
      gsap.to('[data-rp-trunk]', {
        rotation: -4,
        transformOrigin: '12% 95%',
        duration: 3.4,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      // Lotus breathes
      gsap.to('[data-rp-lotus]', {
        scale: 1.05,
        transformOrigin: '50% 80%',
        duration: 3.6,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      // Mandalas rotate slowly in opposite directions
      gsap.to('[data-rp-mandala="left"]', {
        rotation: 360,
        transformOrigin: '50% 50%',
        duration: 80,
        repeat: -1,
        ease: 'none',
      });
      gsap.to('[data-rp-mandala="right"]', {
        rotation: -360,
        transformOrigin: '50% 50%',
        duration: 80,
        repeat: -1,
        ease: 'none',
      });

      // Twinkling dots
      gsap.to('[data-rp-twinkle]', {
        opacity: 0.35,
        duration: 1.8,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        stagger: 0.12,
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative bg-parchment py-14 md:py-20 overflow-hidden">
      <div className="absolute inset-0 paisley-bg opacity-40 pointer-events-none" />

      <div className="relative max-w-[1100px] mx-auto px-6">
        {/* Hairline gold rules on either side of the composition */}
        <div className="flex items-center gap-6 mb-4">
          <div
            data-rp-rule
            className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/45 to-gold/55"
          />
          <span className="eyebrow text-[0.55rem] tracking-[0.45em] text-maroon/70 whitespace-nowrap">
            An auspicious thread
          </span>
          <div
            data-rp-rule
            className="flex-1 h-px bg-gradient-to-l from-transparent via-gold/45 to-gold/55"
          />
        </div>

        {/* The composition */}
        <div data-rp-reveal className="w-full">
          <ElephantPair />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/*  SVG                                                              */
/* ---------------------------------------------------------------- */

const MAROON = '#4D0015';
const PARCH = '#F7EAD9';
const GOLD = '#E0AE6D';

function ElephantPair() {
  return (
    <svg
      viewBox="0 0 1000 520"
      width="100%"
      height="auto"
      role="img"
      aria-label="Two ornate elephants facing a central lotus"
      style={{ display: 'block' }}
    >
      {/* Left elephant — facing right */}
      <g>
        <Elephant variant="left" />
      </g>

      {/* Right elephant — mirrored */}
      <g transform="translate(1000 0) scale(-1 1)">
        <Elephant variant="right" />
      </g>

      {/* Central lotus rising between the elephants */}
      <g data-rp-lotus transform="translate(500 0)">
        <CentralLotus />
      </g>

      {/* Twinkling dots in the arch between the raised trunks */}
      <g>
        {[
          [500, 105],
          [500, 130],
          [500, 155],
          [470, 145],
          [530, 145],
          [460, 175],
          [540, 175],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            data-rp-twinkle
            cx={cx}
            cy={cy}
            r={2.4}
            fill={GOLD}
          />
        ))}
      </g>

      {/* Decorative base strip */}
      <BaseStrip />
    </svg>
  );
}

/* ---------- One elephant (drawn facing right) ---------- */
function Elephant({ variant }: { variant: 'left' | 'right' }) {
  return (
    <g fill={MAROON} stroke="none">
      {/* Tail (back-left) */}
      <path d="M 85 260 Q 70 268, 70 290 Q 70 306, 80 308 Q 86 306, 84 298 Q 80 286, 92 280 Z" />

      {/* Body — stocky rounded silhouette */}
      <path
        d="
          M 95 380
          Q 80 380, 78 360
          Q 70 320, 80 280
          Q 95 245, 140 235
          Q 200 225, 270 230
          Q 330 234, 360 250
          Q 390 270, 395 305
          Q 395 350, 388 380
          L 95 380 Z
        "
      />

      {/* Head — large, joining the front of the body */}
      <path
        d="
          M 380 270
          Q 425 270, 445 300
          Q 460 330, 455 360
          Q 450 380, 425 385
          Q 395 385, 380 370
          Q 370 350, 370 320
          Q 372 290, 380 270 Z
        "
      />

      {/* Ear — large rounded scallop above/behind the head */}
      <path
        d="
          M 380 258
          Q 415 240, 450 250
          Q 470 275, 455 305
          Q 430 312, 405 300
          Q 385 285, 380 258 Z
        "
      />
      {/* Ear inner scallop (lighter cutout for detail) */}
      <path
        d="M 400 268 Q 425 258, 445 275 Q 450 290, 432 295 Q 412 292, 400 280 Z"
        fill={PARCH}
        opacity={0.18}
      />

      {/* Trunk — curls UP (worship pose) */}
      <g data-rp-trunk={variant}>
        <path
          d="
            M 442 350
            Q 470 348, 475 320
            Q 478 285, 460 270
            Q 442 260, 437 280
            Q 437 305, 455 308
            Q 470 308, 470 295
            L 470 285
          "
          fill="none"
          stroke={MAROON}
          strokeWidth={18}
          strokeLinecap="round"
        />
        {/* Trunk ring details */}
        <circle cx={460} cy={340} r={2.5} fill={PARCH} />
        <circle cx={467} cy={322} r={2.5} fill={PARCH} />
        <circle cx={470} cy={302} r={2.5} fill={PARCH} />
        <circle cx={465} cy={285} r={2.5} fill={PARCH} />
      </g>

      {/* Tusk — small, curved */}
      <path
        d="M 425 380 Q 445 395, 438 405 Q 432 402, 425 392 Z"
        fill={PARCH}
      />

      {/* Eye */}
      <circle cx={428} cy={320} r={3.5} fill={PARCH} />
      <circle cx={428} cy={320} r={1.5} fill={MAROON} />

      {/* Tilak (forehead jewel) */}
      <circle cx={438} cy={295} r={3} fill={PARCH} />
      <path
        d="M 434 300 Q 438 306, 442 300"
        fill="none"
        stroke={PARCH}
        strokeWidth={1.2}
        strokeLinecap="round"
      />

      {/* Legs */}
      <rect x={110} y={380} width={26} height={70} fill={MAROON} />
      <rect x={155} y={380} width={26} height={70} fill={MAROON} />
      <rect x={270} y={380} width={26} height={70} fill={MAROON} />
      <rect x={320} y={380} width={26} height={70} fill={MAROON} />

      {/* Anklet bands on each leg */}
      {[110, 155, 270, 320].map((x, i) => (
        <g key={i}>
          <rect x={x - 2} y={420} width={30} height={5} fill={PARCH} />
          <rect x={x + 2} y={428} width={22} height={2.5} fill={GOLD} />
          {/* Toe nails */}
          <circle cx={x + 6} cy={446} r={2.2} fill={PARCH} />
          <circle cx={x + 13} cy={447} r={2.2} fill={PARCH} />
          <circle cx={x + 20} cy={446} r={2.2} fill={PARCH} />
        </g>
      ))}

      {/* Decorative blanket border along the back */}
      <path
        d="M 95 290 Q 200 270, 350 280"
        fill="none"
        stroke={GOLD}
        strokeWidth={2}
        strokeDasharray="3 4"
      />

      {/* Blanket tassels hanging along the side */}
      {[105, 135, 165, 200, 240, 280, 320, 355].map((x, i) => (
        <g key={i}>
          <line
            x1={x}
            y1={378}
            x2={x}
            y2={388}
            stroke={GOLD}
            strokeWidth={1.4}
          />
          <circle cx={x} cy={392} r={2.4} fill={GOLD} />
        </g>
      ))}

      {/* Mandala disc on the body */}
      <g transform="translate(220 330)" data-rp-mandala={variant}>
        <circle r={42} fill={PARCH} />
        <circle r={37} fill={MAROON} />
        <circle r={32} fill={PARCH} />
        <circle r={27} fill={MAROON} />
        <circle r={4} fill={PARCH} />
        {/* Eight cardinal petals */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const r = 20;
          const x = r * Math.cos((deg * Math.PI) / 180);
          const y = r * Math.sin((deg * Math.PI) / 180);
          return (
            <ellipse
              key={deg}
              cx={x}
              cy={y}
              rx={4}
              ry={2.4}
              fill={PARCH}
              transform={`rotate(${deg} ${x} ${y})`}
            />
          );
        })}
        {/* Outer ring of small dots */}
        {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg) => {
          const r = 14;
          const x = r * Math.cos((deg * Math.PI) / 180);
          const y = r * Math.sin((deg * Math.PI) / 180);
          return <circle key={deg} cx={x} cy={y} r={1.6} fill={PARCH} />;
        })}
      </g>

      {/* Smaller secondary blanket dots */}
      {[
        [140, 300],
        [180, 290],
        [290, 295],
        [330, 305],
        [355, 320],
        [120, 320],
        [110, 350],
        [340, 350],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={2.2} fill={PARCH} />
      ))}
    </g>
  );
}

/* ---------- Central lotus (rises between the elephants) ---------- */
function CentralLotus() {
  return (
    <g>
      {/* Stem */}
      <line
        x1={0}
        y1={395}
        x2={0}
        y2={210}
        stroke={MAROON}
        strokeWidth={4}
        strokeLinecap="round"
      />
      {/* Two leaves on the stem */}
      <path
        d="M -2 300 Q -32 290, -42 305 Q -32 318, -2 308 Z"
        fill={MAROON}
      />
      <path
        d="M 2 300 Q 32 290, 42 305 Q 32 318, 2 308 Z"
        fill={MAROON}
      />

      {/* Bottom mandala under the lotus */}
      <g transform="translate(0 410)">
        <circle r={26} fill={MAROON} />
        <circle r={20} fill={PARCH} />
        <circle r={14} fill={MAROON} />
        <circle r={3} fill={PARCH} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const r = 9;
          const x = r * Math.cos((deg * Math.PI) / 180);
          const y = r * Math.sin((deg * Math.PI) / 180);
          return <circle key={deg} cx={x} cy={y} r={1.6} fill={PARCH} />;
        })}
      </g>

      {/* Lotus base (calyx) */}
      <path
        d="M -28 215 Q 0 195, 28 215 Q 0 225, -28 215 Z"
        fill={MAROON}
      />

      {/* Outer side petals */}
      <path
        d="M -28 215 Q -55 175, -48 130 Q -28 165, -20 215 Z"
        fill={MAROON}
      />
      <path
        d="M 28 215 Q 55 175, 48 130 Q 28 165, 20 215 Z"
        fill={MAROON}
      />

      {/* Inner side petals */}
      <path
        d="M -18 210 Q -36 165, -22 115 Q -12 165, -10 210 Z"
        fill={MAROON}
      />
      <path
        d="M 18 210 Q 36 165, 22 115 Q 12 165, 10 210 Z"
        fill={MAROON}
      />

      {/* Centre petal (tall, pointed) */}
      <path
        d="M -10 205 Q -16 140, 0 80 Q 16 140, 10 205 Z"
        fill={MAROON}
      />
      {/* Inner highlight on centre petal */}
      <path
        d="M -4 195 Q -6 145, 0 105 Q 6 145, 4 195 Z"
        fill={PARCH}
        opacity={0.7}
      />

      {/* Gold pistil dot at the heart of the centre petal */}
      <circle cx={0} cy={150} r={3.5} fill={GOLD} />

      {/* Tiny crown finial */}
      <circle cx={0} cy={75} r={3} fill={GOLD} />
      <line
        x1={0}
        y1={72}
        x2={0}
        y2={62}
        stroke={GOLD}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </g>
  );
}

/* ---------- Decorative base strip ---------- */
function BaseStrip() {
  return (
    <g>
      {/* The bar */}
      <rect x={50} y={465} width={900} height={26} fill={MAROON} />
      {/* Inner dotted rows */}
      {Array.from({ length: 28 }).map((_, i) => {
        const x = 70 + i * 32;
        return (
          <g key={i}>
            <circle cx={x} cy={472} r={2.2} fill={PARCH} />
            <circle cx={x + 16} cy={478} r={1.6} fill={PARCH} opacity={0.6} />
            <circle cx={x} cy={484} r={2.2} fill={PARCH} />
          </g>
        );
      })}
      {/* Outer gold hairlines above and below the strip */}
      <line x1={50} y1={460} x2={950} y2={460} stroke={GOLD} strokeWidth={1.5} />
      <line x1={50} y1={494} x2={950} y2={494} stroke={GOLD} strokeWidth={1.5} />
    </g>
  );
}
