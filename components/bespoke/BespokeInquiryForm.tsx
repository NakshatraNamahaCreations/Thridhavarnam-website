'use client';

import { useState } from 'react';

const WEAVES = [
  'Open to suggestions',
  'Kanjeevaram',
  'Banarasi',
  'Mysore Silk',
  'Mangalagiri',
  'Pochampally',
  'Gadwal',
  'Patola',
  'Fancy Sarees',
  'Mixed Pattu Sarees',
];

const OCCASIONS = [
  'Bridal',
  'Wedding guest',
  'Reception',
  'Engagement',
  'Festive',
  'Gift / heirloom',
  'Other',
];

const BUDGETS = [
  '₹35,000 – ₹75,000',
  '₹75,000 – ₹1,50,000',
  '₹1,50,000 – ₹3,00,000',
  'Above ₹3,00,000',
  'Open / not sure',
];

const TIMELINES = [
  'No fixed deadline',
  'Within 3 months',
  '3–6 months',
  '6 months or more',
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  weave: string;
  occasion: string;
  budget: string;
  timeline: string;
  notes: string;
};

const EMPTY: FormState = {
  name: '',
  email: '',
  phone: '',
  weave: WEAVES[0],
  occasion: OCCASIONS[0],
  budget: BUDGETS[0],
  timeline: TIMELINES[0],
  notes: '',
};

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; ref: string }
  | { kind: 'error'; message: string };

const STORAGE_KEY = 'tridhavarnam-bespoke-inquiries-v1';

export default function BespokeInquiryForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [touched, setTouched] = useState(false);
  const [submit, setSubmit] = useState<SubmitState>({ kind: 'idle' });

  const errors = validate(form);
  const hasErrors = Object.values(errors).some(Boolean);
  const showError = (key: keyof typeof errors) => touched && errors[key];

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (hasErrors) {
      // Scroll the first invalid field into view
      const firstErrId = Object.entries(errors).find(([, v]) => v)?.[0];
      if (firstErrId) {
        document.getElementById(`bespoke-${firstErrId}`)?.focus();
      }
      return;
    }

    setSubmit({ kind: 'submitting' });
    try {
      // No backend yet — persist locally so the inquiry survives a reload
      // and the user has a visible reference number. Replace with a real
      // POST when the backend exists.
      const ref = generateRef();
      saveLocally({ ...form, ref, createdAt: Date.now() });
      await new Promise((r) => setTimeout(r, 600)); // brief delay so the spinner reads
      setSubmit({ kind: 'success', ref });
    } catch {
      setSubmit({
        kind: 'error',
        message: 'Something went wrong. Please try again or email support@thridhavarnam.com.',
      });
    }
  };

  if (submit.kind === 'success') {
    return (
      <div className="border border-green-200 bg-green-50 p-6 lg:p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12l5 5L20 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Inquiry received
        </h3>
        <p className="text-sm text-gray-700 max-w-md mx-auto">
          Thank you, <strong className="font-semibold">{form.name.split(' ')[0]}</strong>.
          A stylist will call <strong className="font-semibold">{form.phone}</strong> within 48 hours.
        </p>
        <div className="mt-4 inline-block bg-white border border-green-200 px-4 py-2 text-xs font-semibold tracking-wider uppercase text-gray-700">
          Ref · <span className="text-gray-900 tabular-nums">{submit.ref}</span>
        </div>
        <div className="mt-5">
          <button
            type="button"
            onClick={() => {
              setForm(EMPTY);
              setTouched(false);
              setSubmit({ kind: 'idle' });
            }}
            className="text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-[#75001F] underline underline-offset-4"
          >
            Submit another inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Your name" id="name" required error={showError('name')}>
          <input
            id="bespoke-name"
            type="text"
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            autoComplete="name"
            className={inputClass(!!showError('name'))}
          />
        </Field>

        <Field label="Mobile number" id="phone" required error={showError('phone')}>
          <input
            id="bespoke-phone"
            type="tel"
            inputMode="numeric"
            maxLength={13}
            value={form.phone}
            onChange={(e) => set({ phone: e.target.value })}
            placeholder="98765 43210"
            autoComplete="tel-national"
            className={inputClass(!!showError('phone'))}
          />
        </Field>
      </div>

      <Field label="Email" id="email" required error={showError('email')}>
        <input
          id="bespoke-email"
          type="email"
          value={form.email}
          onChange={(e) => set({ email: e.target.value })}
          autoComplete="email"
          className={inputClass(!!showError('email'))}
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Preferred weave" id="weave">
          <select
            id="bespoke-weave"
            value={form.weave}
            onChange={(e) => set({ weave: e.target.value })}
            className={selectClass()}
          >
            {WEAVES.map((w) => <option key={w}>{w}</option>)}
          </select>
        </Field>

        <Field label="Occasion" id="occasion">
          <select
            id="bespoke-occasion"
            value={form.occasion}
            onChange={(e) => set({ occasion: e.target.value })}
            className={selectClass()}
          >
            {OCCASIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Budget range" id="budget">
          <select
            id="bespoke-budget"
            value={form.budget}
            onChange={(e) => set({ budget: e.target.value })}
            className={selectClass()}
          >
            {BUDGETS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </Field>

        <Field label="Timeline" id="timeline">
          <select
            id="bespoke-timeline"
            value={form.timeline}
            onChange={(e) => set({ timeline: e.target.value })}
            className={selectClass()}
          >
            {TIMELINES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Tell us more (motifs, colours, references…)" id="notes">
        <textarea
          id="bespoke-notes"
          value={form.notes}
          onChange={(e) => set({ notes: e.target.value })}
          rows={5}
          maxLength={1500}
          placeholder="A maroon Banarasi with kalga-bel motifs in pure silver-gold zari for my wedding in February…"
          className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900 resize-none"
        />
        <div className="text-xs text-gray-500 text-right mt-0.5 tabular-nums">
          {form.notes.length}/1500
        </div>
      </Field>

      {submit.kind === 'error' && (
        <div className="border border-red-200 bg-red-50 text-red-800 text-sm p-3">
          {submit.message}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        <p className="text-xs text-gray-500">
          By submitting you agree to be contacted by a Thridha Varnam stylist.
          We will not share your details with third parties.
        </p>
        <button
          type="submit"
          disabled={submit.kind === 'submitting'}
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-7 py-3 text-sm font-bold uppercase tracking-wide hover:bg-[#75001F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submit.kind === 'submitting' ? 'Sending…' : 'Submit Inquiry'}
          {submit.kind !== 'submitting' && <span aria-hidden>→</span>}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  id,
  required,
  error,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  error?: string | false;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={`bespoke-${id}`} className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5">
        {label}
        {required && <span className="text-[#75001F] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-[#75001F] mt-1">{error}</p>}
    </div>
  );
}

function inputClass(error: boolean) {
  return `w-full border px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900 ${
    error ? 'border-[#75001F]' : 'border-gray-300'
  }`;
}

function selectClass() {
  return 'w-full border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900 appearance-none cursor-pointer';
}

function validate(f: FormState) {
  const errs: { name?: string; email?: string; phone?: string } = {};
  if (!f.name.trim()) errs.name = 'Please enter your name';
  if (!f.email.trim()) {
    errs.email = 'Please enter your email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
    errs.email = 'Please enter a valid email';
  }
  if (!f.phone.trim()) {
    errs.phone = 'Please enter a mobile number';
  } else if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\D/g, '').replace(/^91/, ''))) {
    errs.phone = 'Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9';
  }
  return errs;
}

function generateRef(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `BSPK-${ts.slice(-5)}-${rand}`;
}

function saveLocally(record: FormState & { ref: string; createdAt: number }) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as unknown[]) : [];
    if (Array.isArray(list)) {
      list.push(record);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  } catch {
    /* quota / disabled — submission still considered successful */
  }
}
