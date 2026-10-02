/**
 * Kolam — stylised South Indian threshold patterns drawn in SVG.
 *
 * `pulli` is a pulli kolam (dots + loops) — calm, four-fold symmetric.
 * `sikku` is a sikku kolam (interlaced loops) — more ornamental.
 * `lotus` is a stylised lotus / floral kolam.
 *
 * The patterns are drawn at viewBox 100x100 so they scale cleanly via size.
 */
export type KolamVariant = 'pulli' | 'sikku' | 'lotus';

export function Kolam({
  variant = 'pulli',
  size = 64,
  className = '',
  strokeWidth = 1.2,
}: {
  variant?: KolamVariant;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const stroke = strokeWidth;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {variant === 'pulli' && (
        <g strokeWidth={stroke}>
          {/* Centre dot + four cardinal dots */}
          <circle cx="50" cy="50" r="1.6" fill="currentColor" />
          <circle cx="50" cy="14" r="1.2" fill="currentColor" />
          <circle cx="50" cy="86" r="1.2" fill="currentColor" />
          <circle cx="14" cy="50" r="1.2" fill="currentColor" />
          <circle cx="86" cy="50" r="1.2" fill="currentColor" />
          {/* Four interlocked loops radiating from the centre */}
          <path d="M50 24 Q34 24 34 40 Q34 50 50 50 Q66 50 66 40 Q66 24 50 24Z" />
          <path d="M50 76 Q34 76 34 60 Q34 50 50 50 Q66 50 66 60 Q66 76 50 76Z" />
          <path d="M24 50 Q24 34 40 34 Q50 34 50 50 Q50 66 40 66 Q24 66 24 50Z" />
          <path d="M76 50 Q76 34 60 34 Q50 34 50 50 Q50 66 60 66 Q76 66 76 50Z" />
          {/* Outer petals between the loops */}
          <path d="M50 14 Q40 24 50 34 Q60 24 50 14Z" />
          <path d="M50 86 Q40 76 50 66 Q60 76 50 86Z" />
          <path d="M14 50 Q24 40 34 50 Q24 60 14 50Z" />
          <path d="M86 50 Q76 40 66 50 Q76 60 86 50Z" />
        </g>
      )}

      {variant === 'sikku' && (
        <g strokeWidth={stroke}>
          {/* Centre dot */}
          <circle cx="50" cy="50" r="1.4" fill="currentColor" />
          {/* Interlaced loops — figure-eights crossing at centre */}
          <path d="M22 22 Q22 50 50 50 Q78 50 78 22" />
          <path d="M22 78 Q22 50 50 50 Q78 50 78 78" />
          <path d="M22 22 Q50 22 50 50 Q50 78 22 78" />
          <path d="M78 22 Q50 22 50 50 Q50 78 78 78" />
          {/* Outer arcs */}
          <path d="M14 50 Q14 14 50 14 Q86 14 86 50 Q86 86 50 86 Q14 86 14 50Z" />
        </g>
      )}

      {variant === 'lotus' && (
        <g strokeWidth={stroke}>
          {/* Centre */}
          <circle cx="50" cy="50" r="3" fill="currentColor" />
          {/* Inner petals (4) */}
          <path d="M50 28 Q42 40 50 50 Q58 40 50 28Z" />
          <path d="M50 72 Q42 60 50 50 Q58 60 50 72Z" />
          <path d="M28 50 Q40 42 50 50 Q40 58 28 50Z" />
          <path d="M72 50 Q60 42 50 50 Q60 58 72 50Z" />
          {/* Outer petals (4 diagonals) */}
          <path d="M30 30 Q38 42 50 50 Q42 38 30 30Z" />
          <path d="M70 30 Q62 42 50 50 Q58 38 70 30Z" />
          <path d="M30 70 Q38 58 50 50 Q42 62 30 70Z" />
          <path d="M70 70 Q62 58 50 50 Q58 62 70 70Z" />
          {/* Surrounding ring of dots */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const r = 42;
            const cx = 50 + r * Math.cos((deg * Math.PI) / 180);
            const cy = 50 + r * Math.sin((deg * Math.PI) / 180);
            return (
              <circle
                key={deg}
                cx={cx}
                cy={cy}
                r={1.2}
                fill="currentColor"
              />
            );
          })}
        </g>
      )}
    </svg>
  );
}
