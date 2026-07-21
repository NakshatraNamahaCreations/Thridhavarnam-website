'use client';

import { Fragment, useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { REGIONS } from '@/lib/sarees';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

// Long-form copy per region. The shared REGIONS data carries name, place,
// era, fact and image; this table extends each one with the origins, the
// technique, three field-notes and a pull-quote that the long-read needs.
// Keyed by REGIONS[i].id so the order stays in sync.
const CHAPTERS: Record<
  string,
  {
    origins: string;
    technique: string;
    look_for: [string, string, string];
    pull_quote: string;
  }
> = {
  banarasi: {
    origins:
      'The weave is older than most of the cities it travels to. In the 14th century, when the Sultans of Delhi began commissioning court textiles from Varanasi, a craft that already wove plain silk for temple priests turned its hand to brocade. By the time of Akbar, more than a thousand looms answered to a single court — payment was sometimes made in finished sarees.',
    technique:
      'A bridal Banarasi is built on a pit loom over four to six months. Two weavers sit shoulder to shoulder, one driving the warp, the other lifting the kalga-and-bel motifs in pure silver zari that has been double-dipped in gold. The pallu can carry up to 5,600 individual thread wires, each set by hand and counted twice.',
    look_for: [
      'Reverse-side fidelity — the back should mirror the front, not show a tangle of loose ends.',
      'The weight of the zari at the border — real silver-and-gold zari falls heavy in the hand.',
      'A faint, irregular ridge along the join — the mark of a hand-loom, never a power-loom.',
    ],
    pull_quote: 'A saree was, for a time, a kind of currency.',
  },
  kanjivaram: {
    origins:
      'In the 9th century, two weaving communities — the Devangas and the Saligars — were drawn from Andhra to Kanchipuram under the patronage of the Chola dynasty. They settled around the temples, and the temple grammar entered the weave: the gopuram silhouette became the pallu border, the rudraksha bead became a recurring motif.',
    technique:
      'The body, the border, and the pallu are woven on three separate looms in three contrasting colours. They are then interlocked by hand at a join called the petni — a stitch so dense that the saree is, in truth, three sarees fused into one. A genuine Kanjivaram, when held against the light, holds its colour where the joins are.',
    look_for: [
      'The petni — run a thumb along the inside seam; it should feel like a single weave, not a sewn join.',
      'The body silk should be heavy, dense, never papery — Kanjivaram is built for a century of folding.',
      'The pallu border carries temple-edged korvai work — counted, never printed.',
    ],
    pull_quote: 'Three sarees, fused at the petni, lived as one.',
  },
  mysore: {
    origins:
      'Tipu Sultan was, among many other things, a careful student of silk. In 1780, he sent emissaries to China for the worm and the mulberry alike — and built, in Mysore, an entirely new line of silk that did not exist anywhere else in India. The Karnataka State has held the secret of pure Mysore Silk closely ever since; each piece is sealed with a state-issued gold-foil hologram.',
    technique:
      'A pure Mysore crepe is woven on a power-loom but finished by hand. The zari, tested by the Karnataka government for purity, is fed strand by strand into the border. The defining quality is the silk itself — a tight, unblended twist that gives the drape its quiet weight and its famous unbroken shine.',
    look_for: [
      'The KSIC hologram — a gold-foil seal on the inside of the pallu. Without it, the piece is not pure Mysore Silk.',
      'A crepe-soft hand — the silk should fall, not glide. Glide is polyester.',
      'A border zari that does not flake when rubbed between two fingers.',
    ],
    pull_quote: 'Tipu Sultan sent for the worm and the mulberry alike.',
  },
  paithani: {
    origins:
      'A weave older than the Common Era. Roman ledgers from the 1st century list "patrona" — a silk of Paithan — among the goods exchanged for gold from the Mediterranean. The Satavahana queens of the 2nd century BCE are the first known wearers; the Peshwas, eighteen centuries later, would still demand the same weave for state occasions.',
    technique:
      'The Paithani pallu is built thread by thread, in a tapestry technique called tirvath. Twenty-four hand-dyed colours can sit inside one peacock — and the reverse side, by the rule of the weave, must look identical to the front. A single pallu can take three to six months to finish.',
    look_for: [
      'The mor (peacock) pallu — the eye must be circular, never elliptical. An elliptical eye is a power-loom mark.',
      'The reverse side of the pallu — it should be the front, untouched. Two pallus, woven as one.',
      'The border bevels into the body without a seam — the join is a thread, not a stitch.',
    ],
    pull_quote: 'Two pallus, woven as one — the reverse is the front.',
  },
  patola: {
    origins:
      'In the 12th century, the Solanki kings of Gujarat brought seven hundred Salvi weavers from Karnataka to Patan, and granted them land. The weave they brought was a secret — and the secret has remained inside three families to this day. The Mughals later catalogued Patola among the tribute goods of the western coast.',
    technique:
      'In a Patola, both the warp and the weft are tie-dyed before a single thread meets the loom. The dyers tie, dye, untie, retie and re-dye each bundle in the exact pattern the finished saree will carry — eight to twelve colours, set in advance, in the thread itself. The weaving alone takes six months. A bridal piece can take four years.',
    look_for: [
      'The pattern is identical on the front and the back — the dye is in the thread, not on the surface.',
      'A faint feathering at every motif edge — proof the colour was set before the weave, not printed after.',
      'The selvedge will carry a Salvi family signature — three woven dots, four woven dots, or none.',
    ],
    pull_quote: 'The colour is set in the thread before the loom ever moves.',
  },
  baluchari: {
    origins:
      'In the 18th century, Murshid Quli Khan, the Nawab of Bengal, moved a community of weavers from Dhaka to a small village on the Bhagirathi called Baluchar. The pallu, until then a field of flowers, began to carry whole scenes from the epics — Krishna and the cowherds, Bhima at his mace, the Rani of Jhansi at her horse. A wearable, woven myth-archive.',
    technique:
      'The Baluchari is woven on a jacquard loom in pure resham silk — no zari, no metallic. The pallu is built panel by panel, each panel a scene; the reverse side carries the same scene without a stitch. A single saree can take two to three months, the pallu alone taking weeks.',
    look_for: [
      'The pallu carries a continuous narrative — figures should face inward, not be cut by the border.',
      'No zari anywhere — Baluchari is a resham-only weave; any metallic is a misnamed piece.',
      'The reverse pallu — the scenes must read as cleanly as the front. A true jacquard mark.',
    ],
    pull_quote: 'A pallu that carries figures, not flowers.',
  },
};

export default function JourneyLongRead() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>('[data-j-chapter]');
      const total = panels.length;

      const elementsFor = (panel: HTMLElement) => ({
        eyebrow: panel.querySelector('[data-j-eyebrow]'),
        letters: panel.querySelectorAll('[data-j-letter]'),
        meta: panel.querySelector('[data-j-meta]'),
        body: panel.querySelectorAll('[data-j-body]'),
        notes: panel.querySelectorAll('[data-j-note]'),
        quote: panel.querySelector('[data-j-quote]'),
      });

      panels.forEach((p) => {
        const els = elementsFor(p);
        gsap.set(els.eyebrow, { y: 14, autoAlpha: 0 });
        gsap.set(els.letters, { yPercent: 110, autoAlpha: 0 });
        gsap.set(els.meta, { y: 12, autoAlpha: 0 });
        gsap.set(els.body, { y: 22, autoAlpha: 0 });
        gsap.set(els.notes, { x: -14, autoAlpha: 0 });
        gsap.set(els.quote, { autoAlpha: 0 });
      });

      panels.forEach((p, i) => {
        gsap.set(p, {
          autoAlpha: 1,
          clipPath: i === 0 ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)',
        });
      });

      const playPanelText = (idx: number) => {
        const panel = panels[idx];
        if (!panel) return;
        const els = elementsFor(panel);
        gsap.killTweensOf([
          els.eyebrow,
          els.letters,
          els.meta,
          els.body,
          els.notes,
          els.quote,
        ]);
        gsap.set(els.eyebrow, { y: 14, autoAlpha: 0 });
        gsap.set(els.letters, { yPercent: 110, autoAlpha: 0 });
        gsap.set(els.meta, { y: 12, autoAlpha: 0 });
        gsap.set(els.body, { y: 22, autoAlpha: 0 });
        gsap.set(els.notes, { x: -14, autoAlpha: 0 });
        gsap.set(els.quote, { autoAlpha: 0 });

        const tl = gsap.timeline();
        tl.to(els.eyebrow, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' })
          .to(
            els.letters,
            { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'power4.out', stagger: 0.025 },
            '-=0.3',
          )
          .to(els.meta, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' }, '-=0.4')
          .to(
            els.body,
            { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1 },
            '-=0.3',
          )
          .to(
            els.notes,
            { x: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08 },
            '-=0.4',
          )
          .to(els.quote, { autoAlpha: 1, duration: 0.6, ease: 'power3.out' }, '-=0.4');
      };

      const firstImage = panels[0]?.querySelector('[data-j-image]') as HTMLElement | null;
      const sceneVeil = rootRef.current!.querySelector('[data-j-scene-veil]') as HTMLElement | null;
      const sceneTL = gsap.timeline();
      if (firstImage) {
        sceneTL.fromTo(
          firstImage,
          { scale: 1.18, filter: 'brightness(0.55)' },
          { scale: 1.02, filter: 'brightness(1)', duration: 2.4, ease: 'power2.out' },
          0,
        );
      }
      if (sceneVeil) {
        sceneTL.fromTo(
          sceneVeil,
          { opacity: 1 },
          { opacity: 0, duration: 1.6, ease: 'power2.out' },
          0,
        );
      }
      sceneTL.add(() => playPanelText(0), 0.6);

      let lastCurrent = 0;

      // Long-read pin: each chapter gets ~2.4 viewport heights so the visitor
      // has time to read the four body paragraphs and the three notes before
      // the next chapter clips in.
      const PANEL_LENGTH = 2.4;

      ScrollTrigger.create({
        trigger: rootRef.current!,
        start: 'top top',
        end: () => `+=${(total - 0.001) * window.innerHeight * PANEL_LENGTH}`,
        pin: true,
        pinType: 'transform',
        scrub: 1.1,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress * (total - 1);
          const current = Math.min(total - 1, Math.floor(progress));
          const localT = progress - current;

          const HOLD = 0.75;
          const transitionT = localT < HOLD ? 0 : (localT - HOLD) / (1 - HOLD);

          panels.forEach((p, i) => {
            if (i < current) {
              gsap.set(p, { clipPath: 'inset(0% 0% 100% 0%)' });
            } else if (i === current) {
              gsap.set(p, { clipPath: `inset(0% 0% ${transitionT * 100}% 0%)` });
            } else if (i === current + 1) {
              gsap.set(p, { clipPath: `inset(${(1 - transitionT) * 100}% 0% 0% 0%)` });
            } else {
              gsap.set(p, { clipPath: 'inset(100% 0% 0% 0%)' });
            }
          });

          if (current !== lastCurrent) {
            const prev = panels[lastCurrent];
            if (prev) {
              const e = elementsFor(prev);
              gsap.set([e.eyebrow, e.meta], { y: 0, autoAlpha: 1 });
              gsap.set(e.letters, { yPercent: 0, autoAlpha: 1 });
              gsap.set(e.body, { y: 0, autoAlpha: 1 });
              gsap.set(e.notes, { x: 0, autoAlpha: 1 });
              gsap.set(e.quote, { autoAlpha: 1 });
            }
            playPanelText(current);
            lastCurrent = current;
          }

          const rail = rootRef.current?.querySelector('[data-j-rail]') as HTMLElement | null;
          if (rail) rail.style.transform = `scaleY(${self.progress})`;

          const chapterEl = rootRef.current?.querySelector(
            '[data-j-chapter-ticker]',
          ) as HTMLElement | null;
          if (chapterEl && chapterEl.firstChild) {
            chapterEl.firstChild.nodeValue = ROMAN[current];
          }
        },
      });

      panels.forEach((panel, idx) => {
        const img = panel.querySelector('[data-j-image]') as HTMLElement | null;
        if (!img) return;
        gsap.fromTo(
          img,
          { scale: 1.02 },
          {
            scale: 1.12,
            ease: 'none',
            scrollTrigger: {
              trigger: rootRef.current!,
              start: () =>
                `top+=${Math.max(0, idx - 0.5) * window.innerHeight * PANEL_LENGTH} top`,
              end: () => `top+=${(idx + 0.5) * window.innerHeight * PANEL_LENGTH} top`,
              scrub: true,
            },
          },
        );
      });
    }, rootRef);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    return () => {
      window.removeEventListener('load', refresh);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative bg-maroon-deep text-ivory overflow-hidden"
      aria-label="The deep archive: six weaving traditions of India"
    >
      <div className="absolute top-8 left-10 z-30 pointer-events-none">
        <div className="text-display text-xl text-ivory leading-none">Thridha Varnam</div>
        <div className="gold-rule w-8 my-1" />
        <div className="eyebrow text-gold-soft text-[0.55rem]">The Journey · Deep Archive</div>
      </div>

      <div className="absolute top-8 right-10 z-30 pointer-events-none flex items-baseline gap-3">
        <span className="eyebrow text-ivory/50 text-[0.55rem]">Chapter</span>
        <span
          data-j-chapter-ticker
          className="text-display text-2xl text-gold leading-none"
        >
          I
        </span>
        <span className="eyebrow text-ivory/40 text-[0.55rem]">of VI</span>
      </div>

      <div className="hidden md:flex absolute right-10 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-3 pointer-events-none">
        <div className="relative w-px h-40 bg-ivory/10 overflow-hidden">
          <div
            data-j-rail
            className="absolute inset-x-0 top-0 h-full bg-gold origin-top"
            style={{ transform: 'scaleY(0)' }}
          />
        </div>
      </div>

      <div
        data-j-scene-veil
        className="absolute inset-0 z-40 bg-[#0B0604] pointer-events-none"
        style={{ opacity: 1 }}
      />

      <div className="relative h-screen">
        {/* CHAPTERS only carries long-form copy for the original heritage
            weaves (Banarasi, Kanjivaram, Mysore, Patola, plus the
            retired Paithani/Baluchari entries). Newer REGIONS additions
            (Mangalagiri, Pochampally, Gadwal) don't have chapter text
            yet, so filter them out here — without this the build crashes
            on `c.origins` for any region missing from CHAPTERS. */}
        {REGIONS.filter((r) => CHAPTERS[r.id]).map((r, idx) => {
          const c = CHAPTERS[r.id];
          return (
            <article
              key={r.id}
              data-j-chapter
              className="absolute inset-0 will-change-[clip-path]"
              style={{
                clipPath: idx === 0 ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)',
              }}
            >
              <div className="absolute inset-0 md:right-1/2 overflow-hidden">
                <div data-j-image className="absolute inset-0 will-change-transform">
                  <Image
                    src={r.image}
                    alt=""
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={95}
                    className="object-cover"
                  />
                </div>
                <div
                  aria-hidden
                  className="hidden md:block absolute inset-y-0 right-0 w-32 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(77,0,21,0.55) 60%, rgba(77,0,21,1) 100%)',
                  }}
                />
                <div className="md:hidden absolute inset-0 bg-ink/75 pointer-events-none" />
              </div>

              <div className="hidden md:block absolute inset-y-0 right-0 w-1/2 bg-maroon-deep" />

              <div
                className="absolute z-10 left-0 right-0 top-[92px] bottom-8 md:left-1/2 md:right-0 md:top-[88px] md:bottom-[32px] flex items-center"
              >
                <div className="w-full md:max-w-[560px] px-8 md:px-12 lg:px-14">
                  <div
                    data-j-eyebrow
                    className="eyebrow text-gold-soft text-[0.5rem] tracking-[0.45em] mb-2"
                  >
                    Chapter {ROMAN[idx]} · {r.name}
                  </div>

                  <h2 className="text-display text-[2.2rem] sm:text-[2.6rem] md:text-[2.4rem] lg:text-[2.8rem] xl:text-[3rem] leading-[0.95] tracking-tight text-ivory mb-2.5">
                    {r.name.split(' ').map((word, wi, words) => (
                      <Fragment key={wi}>
                        <span className="inline-block overflow-hidden align-baseline whitespace-nowrap">
                          {word.split('').map((ch, ci) => (
                            <span key={ci} data-j-letter className="inline-block">
                              {ch}
                            </span>
                          ))}
                        </span>
                        {wi < words.length - 1 ? ' ' : ''}
                      </Fragment>
                    ))}
                  </h2>

                  <div data-j-meta className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="eyebrow text-ivory/55 text-[0.5rem]">{r.place}</span>
                    <span className="w-1 h-1 rounded-full bg-gold/50" />
                    <span className="text-serif italic text-[0.8rem] text-gold/75">{r.era}</span>
                  </div>

                  <p
                    data-j-body
                    className="text-serif text-[0.85rem] md:text-[0.88rem] text-ivory/80 leading-[1.45] font-light mb-2.5"
                  >
                    <span className="text-gold-soft text-[0.5rem] tracking-[0.4em] uppercase mr-2">
                      Origins ·
                    </span>
                    {c.origins}
                  </p>

                  <p
                    data-j-body
                    className="text-serif text-[0.85rem] md:text-[0.88rem] text-ivory/80 leading-[1.45] font-light mb-3"
                  >
                    <span className="text-gold-soft text-[0.5rem] tracking-[0.4em] uppercase mr-2">
                      Technique ·
                    </span>
                    {c.technique}
                  </p>

                  <div className="mb-3">
                    <div className="eyebrow text-gold-soft text-[0.5rem] tracking-[0.4em] mb-1.5">
                      What to look for
                    </div>
                    <ol className="space-y-1">
                      {c.look_for.map((point, i) => (
                        <li
                          key={i}
                          data-j-note
                          className="flex gap-3 text-serif text-[0.8rem] text-ivory/75 leading-[1.4] font-light"
                        >
                          <span className="text-gold/70 text-[0.65rem] shrink-0 w-5 pt-[2px]">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <blockquote
                    data-j-quote
                    className="relative border-l border-gold/40 pl-4 text-serif italic text-[0.9rem] md:text-[0.95rem] text-gold/85 leading-snug font-light"
                  >
                    {c.pull_quote}
                  </blockquote>
                </div>
              </div>
            </article>
          );
        })}
      </div>

    </section>
  );
}
