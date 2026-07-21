'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PolicyHeader } from '@/components/policy/PolicyChrome';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

type Subject =
  | 'general'
  | 'order'
  | 'bespoke'
  | 'returns'
  | 'press'
  | 'wholesale';

const SUBJECTS: { id: Subject; label: string }[] = [
  { id: 'general', label: 'General enquiry' },
  { id: 'order', label: 'Order help' },
  { id: 'bespoke', label: 'Bespoke commission' },
  { id: 'returns', label: 'Returns & exchange' },
  { id: 'press', label: 'Press & collaboration' },
  { id: 'wholesale', label: 'Wholesale enquiry' },
];

export default function ContactView() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [subject, setSubject] = useState<Subject>('general');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const markTouched = (field: string) =>
    setTouched((t) => (t[field] ? t : { ...t, [field]: true }));

  const firstNameValid = firstName.trim().length >= 2;
  const lastNameValid = lastName.trim().length >= 1;
  const emailValid = EMAIL_RE.test(email.trim());
  const mobileValid = MOBILE_RE.test(mobile.trim());
  const messageValid = message.trim().length >= 10;

  const err = (field: string, hasValue: boolean, valid: boolean, msg: string) =>
    touched[field] && hasValue && !valid ? msg : '';

  const firstNameError = err('firstName', firstName.trim().length > 0, firstNameValid, 'Enter your first name (min 2 characters).');
  const lastNameError = err('lastName', lastName.trim().length > 0, lastNameValid, 'Enter your last name.');
  const emailError = err('email', email.trim().length > 0, emailValid, 'Enter a valid email address.');
  const mobileError = err('mobile', mobile.length > 0, mobileValid, 'Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.');
  const messageError = err('message', message.trim().length > 0, messageValid, 'Tell us a bit more — at least 10 characters.');

  const formValid = useMemo(
    () => firstNameValid && lastNameValid && emailValid && mobileValid && messageValid,
    [firstNameValid, lastNameValid, emailValid, mobileValid, messageValid],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) {
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
        message: true,
      });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const ref = `MSG-${Date.now().toString(36).slice(-5).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
      setSubmittedRef(ref);
      setSubmitting(false);
    }, 700);
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setMobile('');
    setSubject('general');
    setMessage('');
    setTouched({});
    setSubmittedRef(null);
  };

  return (
    <main className="bg-white text-gray-900">
      <PolicyHeader title="Contact Us" breadcrumb="Company / Contact" />

      <section className="max-w-[1100px] mx-auto px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-7">
            {submittedRef ? (
              <SuccessPanel referenceId={submittedRef} onReset={resetForm} />
            ) : (
              <>
                <h2 className="text-base font-bold text-gray-900 mb-2 uppercase tracking-wide">
                  Send us a message
                </h2>
                <p className="text-sm text-gray-700 mb-6">
                  Our care team replies within one working day, Monday to Saturday,
                  10:00 AM – 7:00 PM (IST).
                </p>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" required>First name</Label>
                      <input
                        id="firstName"
                        type="text"
                        required
                        autoComplete="given-name"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        onBlur={() => markTouched('firstName')}
                        aria-invalid={!!firstNameError}
                        className={fieldClass(!!firstNameError)}
                      />
                      <InlineError msg={firstNameError} />
                    </div>
                    <div>
                      <Label htmlFor="lastName" required>Last name</Label>
                      <input
                        id="lastName"
                        type="text"
                        required
                        autoComplete="family-name"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        onBlur={() => markTouched('lastName')}
                        aria-invalid={!!lastNameError}
                        className={fieldClass(!!lastNameError)}
                      />
                      <InlineError msg={lastNameError} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" required>Email</Label>
                      <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => markTouched('email')}
                        aria-invalid={!!emailError}
                        className={fieldClass(!!emailError)}
                      />
                      <InlineError msg={emailError} />
                    </div>
                    <div>
                      <Label htmlFor="mobile" required>Mobile number</Label>
                      <div
                        className={`flex border transition-colors ${
                          mobileError
                            ? 'border-[#75001F]'
                            : 'border-gray-300 focus-within:border-gray-900'
                        }`}
                      >
                        <span className="px-3 py-2.5 text-sm text-gray-500 border-r border-gray-300 bg-gray-50 select-none">
                          +91
                        </span>
                        <input
                          id="mobile"
                          type="tel"
                          required
                          inputMode="numeric"
                          maxLength={10}
                          autoComplete="tel-national"
                          placeholder="98765 43210"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                          onBlur={() => markTouched('mobile')}
                          aria-invalid={!!mobileError}
                          className="w-full bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                        />
                      </div>
                      <InlineError msg={mobileError} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <select
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value as Subject)}
                      className="w-full border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-900 appearance-none cursor-pointer"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="message" required>Message</Label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      placeholder="Order number, weave you're interested in, dates — whatever helps us serve you faster."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onBlur={() => markTouched('message')}
                      aria-invalid={!!messageError}
                      className={`${fieldClass(!!messageError)} resize-y min-h-[120px]`}
                    />
                    <InlineError msg={messageError} />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !formValid}
                    className="w-full md:w-auto bg-gray-900 text-white px-8 py-3 text-sm font-bold tracking-wide uppercase hover:bg-[#75001F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
                  >
                    {submitting ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-5 space-y-4">
            <ContactCard
              icon={<IconMail />}
              title="Email"
              body="Care team — replies within one working day."
              action={{ href: 'mailto:support@thridhavarnam.com', label: 'support@thridhavarnam.com' }}
            />
            <ContactCard
              icon={<IconPhone />}
              title="Phone"
              body="Mon – Sat · 10:00 AM – 7:00 PM (IST)"
              action={{ href: 'tel:+919949528787', label: '+91 99495 28787' }}
            />
            <ContactCard
              icon={<IconWhatsApp />}
              title="WhatsApp"
              body="Quick order help, dispatch updates and styling questions."
              action={{ href: 'https://wa.me/919949528787', label: 'Chat on WhatsApp', external: true }}
            />

            <div className="border border-gray-200 p-5 bg-gray-50">
              <h3 className="text-sm font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                Bengaluru Atelier
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Thridha Varnam Atelier<br />
                LTG LA GRAND, Block 2, No. 5<br />
                Jnanabharathi BDA Layout, Jnana Ganga Nagar<br />
                Bengaluru 560056 · Karnataka, India
              </p>
              <p className="mt-3 text-xs text-gray-600">
                Visit by appointment · Monday to Saturday · 10:00 AM – 7:00 PM (IST)
              </p>
            </div>

            <div className="border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                Looking for help?
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  <Link href="/shipping" className="text-[#75001F] hover:underline">
                    Shipping policy →
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-[#75001F] hover:underline">
                    Returns & exchange →
                  </Link>
                </li>
                <li>
                  <Link href="/care" className="text-[#75001F] hover:underline">
                    Saree care guide →
                  </Link>
                </li>
                <li>
                  <Link href="/bespoke" className="text-[#75001F] hover:underline">
                    Commission a bespoke saree →
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Label({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5">
      {children}
      {required && <span className="text-[#75001F] ml-0.5" aria-hidden>*</span>}
    </label>
  );
}

function fieldClass(invalid: boolean) {
  return `w-full border ${
    invalid ? 'border-[#75001F]' : 'border-gray-300 focus:border-gray-900'
  } bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors`;
}

function InlineError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-xs text-[#75001F] font-medium" role="alert">
      {msg}
    </p>
  );
}

function ContactCard({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action: { href: string; label: string; external?: boolean };
}) {
  return (
    <div className="border border-gray-200 p-5">
      <div className="flex items-start gap-3">
        <div className="shrink-0 text-[#75001F] mt-0.5">{icon}</div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h3>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{body}</p>
          <a
            href={action.href}
            target={action.external ? '_blank' : undefined}
            rel={action.external ? 'noopener noreferrer' : undefined}
            className="inline-block mt-2 text-sm font-semibold text-[#75001F] hover:underline break-all"
          >
            {action.label}
          </a>
        </div>
      </div>
    </div>
  );
}

function SuccessPanel({ referenceId, onReset }: { referenceId: string; onReset: () => void }) {
  return (
    <div className="border border-gray-200 bg-gray-50 p-8 text-center">
      <div className="mx-auto mb-4 w-12 h-12 border border-gray-900 flex items-center justify-center text-gray-900">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12.5 10 17.5 19.5 8" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-1.5">
        Thank you — message received
      </h2>
      <p className="text-sm text-gray-700 max-w-md mx-auto">
        We&apos;ve sent you a confirmation by email. Our care team will reply within
        one working day.
      </p>
      <div className="mt-4 inline-block bg-white border border-gray-200 px-4 py-2 text-xs text-gray-600">
        Reference · <span className="font-bold text-gray-900 tabular-nums">{referenceId}</span>
      </div>
      <div className="mt-6">
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-semibold text-[#75001F] hover:underline"
        >
          Send another message
        </button>
      </div>
    </div>
  );
}

function IconMail() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2.1L7.9 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2.1Z" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.5 3.5A10 10 0 0 0 3.7 16.1L2 22l6.1-1.6a10 10 0 0 0 4.8 1.2 10 10 0 0 0 7.6-18.1Zm-7.6 16h-.1a8.4 8.4 0 0 1-4.3-1.2l-.3-.2-3.6 1 1-3.5-.2-.3a8.3 8.3 0 1 1 7.5 4.2Zm4.6-6.2c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.2l-.8 1c-.2.2-.3.2-.6.1A6.8 6.8 0 0 1 9.4 11c-.3-.4.3-.4.7-1.3.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.3c0 1.4 1 2.7 1.2 2.9.1.2 2 3 4.8 4.2 1.8.7 2.5.8 3.3.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.4Z" />
    </svg>
  );
}
