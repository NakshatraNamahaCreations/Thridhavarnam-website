import { Kolam, type KolamVariant } from './Kolam';

/**
 * SectionBreak — a quiet horizontal divider for the home page, marked at the
 * centre with a kolam (the traditional South Indian threshold pattern).
 *
 * Uses gold-toned hairlines that fade out to the edges and the kolam itself
 * in muted maroon. Small enough to feel like punctuation between sections,
 * not its own section.
 */
export function SectionBreak({
  variant = 'pulli',
  bg = 'ivory',
  size = 52,
}: {
  variant?: KolamVariant;
  bg?: 'ivory' | 'bone' | 'parchment';
  size?: number;
}) {
  const bgClass =
    bg === 'bone' ? 'bg-bone' : bg === 'parchment' ? 'bg-parchment' : 'bg-ivory';

  return (
    <div className={`${bgClass} py-8 md:py-10`}>
      <div className="max-w-[1720px] mx-auto px-6 lg:px-10">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-gold/55" />
          <div className="text-maroon/85 shrink-0" aria-hidden>
            <Kolam variant={variant} size={size} strokeWidth={1.1} />
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gold/40 to-gold/55" />
        </div>
      </div>
    </div>
  );
}
