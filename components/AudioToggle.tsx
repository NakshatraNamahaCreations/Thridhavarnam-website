'use client';

import { useAudio } from '@/components/AudioProvider';
import clsx from 'clsx';

export default function AudioToggle() {
  const { unlocked, muted, toggle } = useAudio();

  // Don't show the floating toggle until the user has passed the splash gate.
  if (!unlocked) return null;

  return (
    <button
      onClick={toggle}
      aria-label={muted ? 'Unmute ambient raag' : 'Mute ambient raag'}
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-3 bg-ink/85 backdrop-blur-md text-ivory border border-gold/40 rounded-full pl-3 pr-5 py-2.5 hover:border-gold transition-all"
    >
      <span className="relative flex items-center justify-center w-6 h-6">
        {/* Animated wave bars indicating sound on/off */}
        <span className="flex items-end gap-[2px] h-4">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={clsx(
                'w-[2px] bg-gold-soft rounded-full origin-bottom transition-all duration-300',
                muted ? 'h-1' : 'animate-pulse',
              )}
              style={{
                height: muted ? '20%' : `${30 + (i % 2 === 0 ? 60 : 30)}%`,
                animationDelay: `${i * 120}ms`,
                animationDuration: '900ms',
              }}
            />
          ))}
        </span>
      </span>
      <span className="eyebrow text-[0.6rem] text-gold-soft">
        {muted ? 'Sound off' : 'Raag playing'}
      </span>
    </button>
  );
}
