'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import BespokeInquiryForm from './BespokeInquiryForm';

const PROCESS_STEPS: { num: string; title: string; body: string }[] = [
  {
    num: '01',
    title: 'Tell us your vision',
    body: 'Share the occasion, weave preference, colour palette, motifs and budget. Photos and references help.',
  },
  {
    num: '02',
    title: 'Design consultation',
    body: 'A stylist calls you within 48 hours to finalise the design, fabric, zari grade and motif layout.',
  },
  {
    num: '03',
    title: 'Hand-weaving',
    body: 'Your saree is woven by master weavers in its native cluster. 12–16 weeks for bridal, 8–10 for festive.',
  },
  {
    num: '04',
    title: 'Quality check & delivery',
    body: 'Five-step finish inspection. Insured worldwide dispatch. Live progress photographs every two weeks.',
  },
];

const GALLERY: { src: string; weave: string }[] = [
  { src: '/bestsellers/Mayura%20kanjee.webp', weave: 'Kanjeevaram' },
  { src: '/bestsellers/raktharani%20banarasi.webp', weave: 'Banarasi' },
  { src: '/bestsellers/chandrika%20mysuru.webp', weave: 'Mysore Silk' },
  { src: '/bestsellers/Rasleela%20patola2.webp', weave: 'Patola' },
  { src: '/bestsellers/haldi%20paithani2.webp', weave: 'Fancy Sarees' },
  { src: '/bestsellers/katha%20baluchari.webp', weave: 'Mixed Pattu' },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How long does a bespoke saree take?',
    a: 'Bridal-grade Banarasi and Kanjivaram pieces take 12–16 weeks. Festive sarees take 8–10 weeks. Patola can take 6 months to a year depending on the complexity of the double-ikat pattern.',
  },
  {
    q: 'What does a bespoke saree cost?',
    a: 'Bespoke pieces start at ₹35,000 for festive weaves and go up to ₹3,00,000 and beyond for bridal-grade work in pure silver-gold zari. You pay 30% on confirmation and the balance before dispatch.',
  },
  {
    q: 'Can I see the saree being made?',
    a: 'Yes. We send progress photographs every two weeks during weaving, and you can request a live video walkthrough at any stage. For Bengaluru clients we host studio visits at our Jnanabharathi atelier by appointment.',
  },
  {
    q: 'Is the bespoke order refundable?',
    a: 'The 30% confirmation deposit is non-refundable once weaving begins, since each piece is unique. Up to that point, the deposit is fully refundable. The balance is only collected after you have approved the finished saree photographs.',
  },
  {
    q: 'Do you ship bespoke pieces worldwide?',
    a: 'Yes — insured, tracked and signature-on-delivery. Customs and duties are pre-paid by us for most countries. Delivery typically takes 7–10 working days after dispatch.',
  },
];

export default function BespokeView() {
  return (
    <div className="bg-white min-h-screen text-gray-900">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-3 text-xs text-gray-500">
          <nav aria-label="Breadcrumb">
            <Link href="/home" className="hover:text-gray-900">Home</Link>
            <span className="mx-1.5">/</span>
            <span className="text-gray-900">Bespoke</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="relative bg-[#1A0F0C] text-white overflow-hidden">
        {/* Image — right 58% only, NOT a full-bleed overlay */}
        <div className="absolute inset-y-0 right-0 w-full md:w-[60%] lg:w-[58%]">
          <Image
            src="/homebanner/Mayura%20kanjeevaram.webp"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover"
            style={{ objectPosition: '50% 22%' }}
            priority
          />
          {/* Seam fade — solid ink at the left edge of the image, easing to
              transparent so the dark panel blends smoothly into the photo */}
          <div
            className="absolute inset-y-0 left-0 w-[50%] pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, rgba(26,15,12,1) 0%, rgba(26,15,12,0.95) 12%, rgba(26,15,12,0.78) 28%, rgba(26,15,12,0.5) 48%, rgba(26,15,12,0.22) 70%, rgba(26,15,12,0.06) 88%, rgba(26,15,12,0) 100%)',
            }}
          />
        </div>

        {/* Mobile only — photo sits behind text, so cover it with a flat wash */}
        <div className="md:hidden absolute inset-0 bg-[#1A0F0C]/80 pointer-events-none" />

        <div className="relative max-w-[1720px] mx-auto px-4 lg:px-8 py-12 lg:py-20">
          <div className="max-w-xl">
            <div className="inline-block bg-[#75001F] text-white text-[0.65rem] font-bold tracking-[0.25em] uppercase px-2.5 py-1 mb-4">
              By Appointment
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3">
              Commission a Bespoke Saree
            </h1>
            <p className="text-base md:text-lg text-white/85 mb-6 max-w-xl">
              Hand-woven to your weave, colour, motifs and zari. 12–16 weeks
              from confirmation to delivery, with progress photographs every
              two weeks.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href="#inquiry"
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-200 transition-colors"
              >
                Start an inquiry
                <span aria-hidden>→</span>
              </a>
              <a
                href="#process"
                className="inline-flex items-center gap-2 border border-white/40 text-white px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-white/10 transition-colors"
              >
                How it works
              </a>
            </div>

            {/* Quick stats */}
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              <Stat label="Lead time" value="12–16 wks" />
              <Stat label="Starting at" value="₹35,000" />
              <Stat label="Master weavers" value="40+" />
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="bg-white border-t border-gray-200">
        <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-10 lg:py-14">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              How a Bespoke Order Works
            </h2>
            <p className="text-sm text-gray-700 max-w-2xl mx-auto">
              From the first conversation to the saree in your hand — a four-step
              process designed for clarity and zero surprises.
            </p>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROCESS_STEPS.map((step) => (
              <li
                key={step.num}
                className="bg-gray-50 border border-gray-200 p-5 lg:p-6"
              >
                <div className="text-3xl font-bold text-[#75001F] mb-2 tabular-nums">
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-10 lg:py-14">
          <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                Recent Commissions
              </h2>
              <p className="text-sm text-gray-700">
                A snapshot of what our weavers have hand-finished lately.
              </p>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-[#75001F] underline underline-offset-4"
            >
              See all sarees
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {GALLERY.map((item) => (
              <div
                key={item.src}
                className="relative aspect-[3/4] overflow-hidden bg-gray-100 group"
              >
                <Image
                  src={item.src}
                  alt={`${item.weave} bespoke saree`}
                  fill
                  sizes="(max-width: 768px) 50vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <div className="text-xs font-bold text-white tracking-wider uppercase">
                    {item.weave}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry form */}
      <section id="inquiry" className="bg-white border-t border-gray-200 scroll-mt-32">
        <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-10 lg:py-14">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Start Your Bespoke Inquiry
              </h2>
              <p className="text-sm text-gray-700">
                A stylist will call you within 48 hours. No commitment until you
                approve the design and quote.
              </p>
            </div>
            <BespokeInquiryForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-10 lg:py-14">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-5 text-center">
              Bespoke FAQs
            </h2>
            <div className="border-t border-gray-200 bg-white">
              {FAQS.map((f, i) => (
                <FaqRow key={i} q={f.q} a={f.a} defaultOpen={i === 0} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Trust icon="hand" label="Hand-woven by master weavers" />
          <Trust icon="shield" label="100% purchase protection" />
          <Trust icon="truck" label="Insured worldwide delivery" />
          <Trust icon="phone" label="Stylist support 7 days a week" />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xl md:text-2xl font-bold text-white tabular-nums">
        {value}
      </div>
      <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/70 mt-0.5">
        {label}
      </div>
    </div>
  );
}

function Trust({ icon, label }: { icon: 'hand' | 'shield' | 'truck' | 'phone'; label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-700">
      <span className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-[#75001F] shrink-0">
        <Icon name={icon} />
      </span>
      <span className="font-medium">{label}</span>
    </div>
  );
}

function Icon({ name }: { name: 'hand' | 'shield' | 'truck' | 'phone' }) {
  const c = {
    width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const, 'aria-hidden': true,
  };
  switch (name) {
    case 'hand':
      return (<svg {...c}><path d="M9 11V5a2 2 0 1 1 4 0v6" /><path d="M13 11V4a2 2 0 1 1 4 0v9" /><path d="M17 13V7a2 2 0 1 1 4 0v9a6 6 0 0 1-6 6h-3a8 8 0 0 1-8-8v-2a2 2 0 1 1 4 0v2" /></svg>);
    case 'shield':
      return (<svg {...c}><path d="M12 3 4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6z" /></svg>);
    case 'truck':
      return (<svg {...c}><path d="M3 7h11v9H3zM14 11h4l3 3v2h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" /></svg>);
    case 'phone':
      return (<svg {...c}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.34 1.9.66 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.54 2.81.66A2 2 0 0 1 22 16.92Z" /></svg>);
  }
}

function FaqRow({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-4 px-5 text-left group"
      >
        <span className="text-sm md:text-base font-semibold text-gray-900 group-hover:text-[#75001F] transition-colors">
          {q}
        </span>
        <span className={`text-2xl text-gray-500 transition-transform shrink-0 ${open ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      {open && (
        <p className="pb-4 px-5 text-sm text-gray-700 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

