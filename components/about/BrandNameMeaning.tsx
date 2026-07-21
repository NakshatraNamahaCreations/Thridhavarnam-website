'use client';

import { useState } from 'react';
import SectionOrnament from '@/components/ui/SectionOrnament';

/**
 * BrandNameMeaning — the Sanskrit / Telugu / Kannada verse that explains
 * the meaning behind "Thridha Varnam" (त्रिधा वर्णम् — threefold splendour
 * of colour). Client-supplied verse on 2026-06-15.
 *
 * Typography rule (per official brand kit, pages 12–13):
 *   - Headlines        → Black Mango (font-display)
 *   - Everything else  → Plus Jakarta Sans (default sans), including
 *                        italic body, blockquote translations, and the
 *                        narrative bridging note.
 *
 * The Indic verses fall back through `font-display` to the system
 * Indic font; that fallback is acceptable because Black Mango is a
 * Latin-only file and the browser will pick the correct script.
 */
type Script = 'sanskrit' | 'telugu' | 'kannada';

const verses: Record<Script, { label: string; subLabel: string; lines: string[] }> = {
  sanskrit: {
    label: 'संस्कृत',
    subLabel: 'Sanskrit',
    lines: [
      'वर्णानां शोभिता नारी,',
      'संस्कृतेः दिव्यरूपिणी।',
      'त्रिधा वर्णं धारयन्ती,',
      'सौन्दर्यं लोकभूषणम्॥',
    ],
  },
  telugu: {
    label: 'తెలుగు',
    subLabel: 'Telugu',
    lines: [
      'వర్ణానాం శోభితా నారీ,',
      'సంస్కృతేః దివ్యరూపిణీ।',
      'త్రిధా వర్ణం ధారయంతీ,',
      'సౌందర్యం లోకభూషణం॥',
    ],
  },
  kannada: {
    label: 'ಕನ್ನಡ',
    subLabel: 'Kannada',
    lines: [
      'ವರ್ಣಾನಾಂ ಶೋಭಿತಾ ನಾರಿ,',
      'ಸಂಸ್ಕೃತೇಃ ದಿವ್ಯರೂಪಿಣೀ।',
      'ತ್ರಿಧಾ ವರ್ಣಂ ಧಾರಯಂತೀ,',
      'ಸೌಂದರ್ಯಂ ಲೋಕಭೂಷಣಂ॥',
    ],
  },
};

const scriptOrder: Script[] = ['kannada', 'telugu', 'sanskrit'];

export default function BrandNameMeaning() {
  const [active, setActive] = useState<Script>('kannada');
  const current = verses[active];

  return (
    <section className="bg-ivory border-y border-maroon/10">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-14 md:py-20">
        <SectionOrnament />

        {/* Heading block — eyebrow, Black Mango title, italic sub-tagline. */}
        <div className="text-center">
          <div className="text-[0.65rem] tracking-[0.45em] uppercase text-maroon font-semibold">
            The meaning behind our name
          </div>
          <h2 className="mt-3 font-display text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-medium text-ink leading-[1.1]">
            Thridha Varnam
          </h2>
          <p className="mt-3 text-sm md:text-[0.95rem] text-ink/70 italic">
            Threefold splendour of colour.
          </p>
        </div>

        {/* Script tabs */}
        <div
          role="tablist"
          aria-label="Verse script"
          className="mt-10 md:mt-12 flex items-center justify-center gap-1 md:gap-2"
        >
          {scriptOrder.map((s) => {
            const isActive = s === active;
            return (
              <button
                key={s}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActive(s)}
                className={`relative px-4 md:px-5 py-2 text-xs md:text-[0.78rem] font-semibold tracking-wider uppercase transition-colors ${
                  isActive ? 'text-maroon' : 'text-ink/55 hover:text-ink'
                }`}
              >
                {verses[s].subLabel}
                {isActive && (
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-0 h-px w-8 bg-maroon" />
                )}
              </button>
            );
          })}
        </div>

        {/* Verse */}
        <div className="mt-8 md:mt-10">
          <div className="text-center">
            <div
              className="text-[0.6rem] tracking-[0.3em] uppercase text-ink/45 mb-3"
              aria-hidden
            >
              {current.label}
            </div>
            <div
              key={active}
              className="font-display text-xl md:text-[1.6rem] lg:text-[1.85rem] leading-[1.75] text-ink/90 space-y-0.5"
              lang={active === 'sanskrit' ? 'sa' : active === 'telugu' ? 'te' : 'kn'}
            >
              {current.lines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>

          {/* Ornamental divider before the English translation */}
          <div className="mt-8 flex items-center justify-center gap-3 text-maroon/40">
            <span className="h-px w-16 bg-current" />
            <img
              src="/brand/star-flower.svg"
              alt=""
              aria-hidden
              width={14}
              height={14}
              className="h-3.5 w-3.5 opacity-70"
            />
            <span className="h-px w-16 bg-current" />
          </div>

          {/* English translation — Plus Jakarta Sans italic (body rule). */}
          <blockquote className="mt-6 md:mt-8 text-center max-w-2xl mx-auto">
            <p className="italic text-base md:text-lg text-ink/80 leading-[1.75]">
              &ldquo;A woman glowing in beautiful colours reflects divine
              culture. With Thridha Varnam, she becomes the true ornament
              of beauty in the world.&rdquo;
            </p>
          </blockquote>
        </div>

        {/* Bridging note — default body sans, ties the verse back to brand voice. */}
        <div className="mt-10 md:mt-12 max-w-2xl mx-auto text-sm md:text-[0.95rem] text-ink/70 leading-[1.75] text-center">
          <p>
            The name <span className="font-semibold text-ink">Thridha Varnam</span>{' '}
            is woven from two Sanskrit roots — <em>thridha</em>, threefold, and{' '}
            <em>varnam</em>, colour. Three scripts of the South and the North
            hold the same verse here, the same way our looms hold the colours
            of Kanjeevaram, Banarasi and Gadwal in a single drape. One name.
            Three lineages. Every saree we weave is a small offering at that
            confluence.
          </p>
        </div>
      </div>
    </section>
  );
}
