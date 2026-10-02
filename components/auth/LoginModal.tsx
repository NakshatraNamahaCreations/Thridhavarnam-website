'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useLoginModal } from '@/lib/login-modal';
import { useAuth } from '@/lib/auth';
import { useScrollLock } from '@/lib/scroll-lock';

type Mode = 'signin' | 'signup' | 'forgot' | 'success';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginModal() {
  const { open, closeLogin, loginSucceeded } = useLoginModal();
  const { signIn, register } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // Per-field "touched" state — an inline error is only shown after the
  // user has blurred a field, so the form is never red on first open.
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const firstNameInputRef = useRef<HTMLInputElement | null>(null);

  const markTouched = (field: string) =>
    setTouched((t) => (t[field] ? t : { ...t, [field]: true }));

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLogin();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeLogin]);

  // Focus the right field whenever the modal opens or the mode switches.
  // `firstName` / `email` are intentionally NOT in deps — including the
  // typed value would re-run this on every keystroke and the 80ms focus
  // call would yank the cursor mid-word (only the first char would land).
  useEffect(() => {
    if (!open) {
      setMode('signin');
      setFirstName('');
      setLastName('');
      setMobile('');
      setDob('');
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setError(null);
      setNotice(null);
      setSubmitting(false);
      setTouched({});
      return;
    }
    const t = setTimeout(() => {
      if (mode === 'signup') firstNameInputRef.current?.focus();
      else emailInputRef.current?.focus();
    }, 80);
    return () => clearTimeout(t);
  }, [open, mode]);

  if (!open) return null;

  const emailValid = EMAIL_RE.test(email.trim());
  const passwordValid = password.length >= 8;
  const firstNameValid = firstName.trim().length >= 2;
  const lastNameValid = lastName.trim().length >= 1;
  const mobileValid = /^[6-9]\d{9}$/.test(mobile.trim());
  const dobValid = (() => {
    if (!dob) return false;
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return false;
    // Must be in the past and the user must be at least 13.
    const minAge = new Date();
    minAge.setFullYear(minAge.getFullYear() - 13);
    return d <= minAge;
  })();

  // Per-field error messages. An error is only surfaced when the user has
  // both blurred the field AND typed something wrong — an empty, untouched
  // field stays neutral. Empty required fields are signalled instead by the
  // disabled submit button + the red asterisk on the label.
  const err = (field: string, hasValue: boolean, valid: boolean, msg: string) =>
    touched[field] && hasValue && !valid ? msg : '';
  const firstNameError = err(
    'firstName',
    firstName.trim().length > 0,
    firstNameValid,
    'Enter your first name (min 2 characters).',
  );
  const lastNameError = err(
    'lastName',
    lastName.trim().length > 0,
    lastNameValid,
    'Enter your last name.',
  );
  const signupEmailError = err(
    'email',
    email.trim().length > 0,
    emailValid,
    'Enter a valid email address.',
  );
  const mobileError = err(
    'mobile',
    mobile.length > 0,
    mobileValid,
    'Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.',
  );
  const dobError = err(
    'dob',
    dob.length > 0,
    dobValid,
    'Enter a valid date of birth (must be 13+).',
  );
  const passwordError = err(
    'password',
    password.length > 0,
    passwordValid,
    'Password must be at least 8 characters.',
  );

  const signUpFormValid =
    firstNameValid &&
    lastNameValid &&
    emailValid &&
    mobileValid &&
    dobValid &&
    passwordValid &&
    agreed;
  const signInFormValid = emailValid && passwordValid;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) return setError('Enter a valid email address.');
    if (!passwordValid) return setError('Password must be at least 8 characters.');
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      setSubmitting(false);
      setMode('success');
      setNotice(null);
      // loginSucceeded closes the modal AND fires any pending action
      // (e.g. "open checkout" if the user was gated from the cart).
      setTimeout(() => loginSucceeded(), 1400);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    // Defence-in-depth — the submit button is already disabled when the
    // form is invalid, but a keyboard `Enter` could still fire submit.
    if (!signUpFormValid) {
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
        dob: true,
        password: true,
      });
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        mobile: mobile.trim(),
        dob,
      });
      setSubmitting(false);
      // Keep the just-typed email so the user doesn't have to retype it.
      // Wipe everything else (including the password) and land on the
      // sign-in screen with a confirmation notice.
      setPassword('');
      setFirstName('');
      setLastName('');
      setMobile('');
      setDob('');
      setTouched({});
      setError(null);
      setMode('signin');
      setNotice('Account created. Please sign in with your new credentials.');
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : 'Unable to create account. Please try again.');
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) return setError('Enter a valid email address.');
    setError(null);
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setNotice('Password reset link sent. Check your inbox.');
      setTimeout(() => {
        setMode('signin');
        setNotice(null);
      }, 1800);
    }, 700);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
      data-lenis-prevent
    >
      <button
        type="button"
        aria-label="Close login"
        onClick={closeLogin}
        className="absolute inset-0 bg-[#1B0E0A]/70 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-[920px] max-h-[92vh] overflow-hidden bg-bone no-pattern shadow-2xl grid grid-cols-1 md:grid-cols-2 rounded-2xl">
        <button
          type="button"
          aria-label="Close"
          onClick={closeLogin}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center text-ink hover:text-maroon bg-bone/85 hover:bg-bone transition-colors rounded-full"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>

        {/* Left: promotional pane */}
        <div className="relative hidden md:block bg-[#1B0E0A] min-h-[520px]">
          <Image
            src="/homebanner/Mayura kanjeevaram.webp"
            alt=""
            fill
            sizes="(max-width: 768px) 0px, 460px"
            className="object-cover object-[50%_25%]"
            priority={false}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(165deg, rgba(27,14,10,0.7) 0%, rgba(27,14,10,0.4) 38%, rgba(27,14,10,0.15) 70%, rgba(27,14,10,0.6) 100%)',
            }}
          />
          <div className="relative h-full flex flex-col justify-between p-8 lg:p-10 text-ivory">
            <div>
              <h2 className="text-2xl lg:text-[1.7rem] font-semibold leading-snug">
                Register and join the<br />House of Thridha Varnam.
              </h2>
              <ul className="mt-6 space-y-1.5 text-[0.78rem] text-ivory/80">
                <li>· Track every order end-to-end</li>
                <li>· Save your addresses for a one-tap checkout</li>
                <li>· Wishlist heirloom pieces across visits</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: form pane. overflow-y-auto so the footer "Create account" /
            "Sign in" link is always reachable when the modal is taller than
            the viewport (max-h-[92vh] on the outer container clips it
            otherwise). */}
        <div className="relative p-7 md:p-10 lg:p-12 flex flex-col overflow-y-auto max-h-[92vh]">
          <div className="flex flex-col items-center text-center">
            <img
              src="/brand/logo-vertical.svg"
              alt="Thridha Varnam"
              width={140}
              height={120}
              className="h-20 w-auto select-none"
              draggable={false}
            />
          </div>

          <div className="mt-8 md:mt-10">
            {mode === 'signin' && (
              <>
                <h1 id="login-title" className="text-2xl font-semibold text-ink text-center">
                  Sign in
                </h1>
                <p className="mt-1.5 text-sm text-ink/65 text-center">
                  Welcome back. Enter your details.
                </p>

                <form onSubmit={handleSignIn} className="mt-7 space-y-4" noValidate>
                  {notice && (
                    <p className="text-xs text-peacock font-medium bg-peacock/10 border border-peacock/30 px-3 py-2" role="status">
                      {notice}
                    </p>
                  )}
                  <EmailField
                    value={email}
                    onChange={setEmail}
                    inputRef={emailInputRef}
                    required
                    onBlur={() => markTouched('email')}
                    error={err('email', email.trim().length > 0, emailValid, 'Enter a valid email address.')}
                  />
                  <PasswordField
                    value={password}
                    onChange={setPassword}
                    visible={showPassword}
                    onToggleVisible={() => setShowPassword((v) => !v)}
                    autoComplete="current-password"
                    onBlur={() => markTouched('password')}
                    error={passwordError}
                  />

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs font-medium text-ink/65 hover:text-ink underline underline-offset-2"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {error && <ErrorRow>{error}</ErrorRow>}

                  <button
                    type="submit"
                    disabled={submitting || !signInFormValid}
                    className="w-full bg-maroon-deep text-ivory py-3 text-sm font-semibold tracking-wide hover:bg-maroon transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-maroon-deep"
                  >
                    {submitting ? 'Signing in…' : 'Sign In'}
                  </button>
                </form>

                <div className="mt-7 pt-5 border-t border-ink/10 text-center">
                  <p className="text-sm text-ink/65">
                    New to Thridha Varnam?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="font-semibold text-ink underline underline-offset-2 hover:text-maroon"
                    >
                      Create account
                    </button>
                  </p>
                </div>
              </>
            )}

            {mode === 'signup' && (
              <>
                <h1 id="login-title" className="text-2xl font-semibold text-ink text-center">
                  Create account
                </h1>
                <p className="mt-1.5 text-sm text-ink/65 text-center">
                  Join the house. It takes a minute.
                </p>

                <form onSubmit={handleSignUp} className="mt-7 space-y-4" noValidate>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-semibold text-ink mb-1.5">
                        First name<RequiredMark />
                      </label>
                      <input
                        ref={firstNameInputRef}
                        id="firstName"
                        type="text"
                        required
                        autoComplete="given-name"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        onBlur={() => markTouched('firstName')}
                        aria-invalid={!!firstNameError}
                        className={inputClass(!!firstNameError)}
                      />
                      <InlineError msg={firstNameError} />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-semibold text-ink mb-1.5">
                        Last name<RequiredMark />
                      </label>
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
                        className={inputClass(!!lastNameError)}
                      />
                      <InlineError msg={lastNameError} />
                    </div>
                  </div>

                  <EmailField
                    value={email}
                    onChange={setEmail}
                    inputRef={emailInputRef}
                    required
                    onBlur={() => markTouched('email')}
                    error={signupEmailError}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="mobile" className="block text-sm font-semibold text-ink mb-1.5">
                        Mobile number<RequiredMark />
                      </label>
                      <div
                        className={`flex border transition-colors ${
                          mobileError
                            ? 'border-maroon'
                            : 'border-ink/20 focus-within:border-ink'
                        }`}
                      >
                        <span className="px-3 py-3 text-sm text-ink/55 border-r border-ink/20 bg-ink/5 select-none">
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
                          className="w-full bg-transparent px-3 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none"
                        />
                      </div>
                      <InlineError msg={mobileError} />
                    </div>
                    <div>
                      <label htmlFor="dob" className="block text-sm font-semibold text-ink mb-1.5">
                        Date of birth<RequiredMark />
                      </label>
                      <input
                        id="dob"
                        type="date"
                        required
                        autoComplete="bday"
                        max={new Date().toISOString().split('T')[0]}
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        onBlur={() => markTouched('dob')}
                        aria-invalid={!!dobError}
                        className={inputClass(!!dobError)}
                      />
                      <InlineError msg={dobError} />
                    </div>
                  </div>

                  <PasswordField
                    value={password}
                    onChange={setPassword}
                    visible={showPassword}
                    onToggleVisible={() => setShowPassword((v) => !v)}
                    autoComplete="new-password"
                    helpText={passwordError ? undefined : 'At least 8 characters.'}
                    onBlur={() => markTouched('password')}
                    error={passwordError}
                  />

                  <button
                    type="submit"
                    disabled={submitting || !signUpFormValid}
                    className="w-full bg-maroon-deep text-ivory py-3 text-sm font-semibold tracking-wide hover:bg-maroon transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-maroon-deep"
                  >
                    {submitting ? 'Creating account…' : 'Create Account'}
                  </button>

                  <label className="flex items-start gap-2 text-xs text-ink/65 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 accent-ink shrink-0"
                    />
                    <span>
                      I accept that I have read &amp; understood{' '}
                      <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
                        Privacy Policy
                      </Link>{' '}
                      and{' '}
                      <Link href="/terms" className="underline underline-offset-2 hover:text-ink">
                        T&amp;Cs.
                      </Link>
                    </span>
                  </label>
                </form>

                <div className="mt-6 pt-5 border-t border-ink/10 text-center">
                  <p className="text-sm text-ink/65">
                    Already a member?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="font-semibold text-ink underline underline-offset-2 hover:text-maroon"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </>
            )}

            {mode === 'forgot' && (
              <>
                <h1 id="login-title" className="text-2xl font-semibold text-ink text-center">
                  Reset password
                </h1>
                <p className="mt-1.5 text-sm text-ink/65 text-center">
                  We'll send a reset link to your email.
                </p>

                <form onSubmit={handleForgot} className="mt-7 space-y-4">
                  <EmailField value={email} onChange={setEmail} inputRef={emailInputRef} />

                  {error && <ErrorRow>{error}</ErrorRow>}
                  {notice && (
                    <p className="text-xs text-peacock font-medium" role="status">
                      {notice}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-maroon-deep text-ivory py-3 text-sm font-semibold tracking-wide hover:bg-maroon transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="text-sm font-medium text-ink/65 hover:text-ink underline underline-offset-2"
                  >
                    ← Back to sign in
                  </button>
                </div>
              </>
            )}

            {mode === 'success' && (
              <div className="py-10 text-center">
                <div className="mx-auto mb-4 w-12 h-12 rounded-full border border-ink/20 flex items-center justify-center text-ink">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12.5 10 17.5 19.5 8" />
                  </svg>
                </div>
                <h1 id="login-title" className="text-xl font-semibold text-ink">
                  Welcome to the house
                </h1>
                <p className="mt-1.5 text-sm text-ink/65">
                  You're signed in. Closing…
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RequiredMark() {
  return (
    <span className="text-maroon ml-0.5" aria-hidden>
      *
    </span>
  );
}

function inputClass(invalid: boolean) {
  return `w-full border ${
    invalid ? 'border-maroon' : 'border-ink/20 focus:border-ink'
  } transition-colors bg-transparent px-3 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none`;
}

function InlineError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-[0.7rem] text-maroon font-medium" role="alert">
      {msg}
    </p>
  );
}

function EmailField({
  value,
  onChange,
  inputRef,
  required = false,
  onBlur,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  inputRef?: React.MutableRefObject<HTMLInputElement | null>;
  required?: boolean;
  onBlur?: () => void;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor="email" className="block text-sm font-semibold text-ink mb-1.5">
        Email{required && <RequiredMark />}
      </label>
      <input
        ref={(el) => {
          if (inputRef) inputRef.current = el;
        }}
        id="email"
        type="email"
        required={required}
        autoComplete="email"
        placeholder="you@example.com"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
        className={inputClass(!!error)}
      />
      <InlineError msg={error} />
    </div>
  );
}

function PasswordField({
  value,
  onChange,
  visible,
  onToggleVisible,
  autoComplete,
  helpText,
  onBlur,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  autoComplete: string;
  helpText?: string;
  onBlur?: () => void;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor="password" className="block text-sm font-semibold text-ink mb-1.5">
        Password<RequiredMark />
      </label>
      <div
        className={`relative border transition-colors ${
          error ? 'border-maroon' : 'border-ink/20 focus-within:border-ink'
        }`}
      >
        <input
          id="password"
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder="Enter password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={!!error}
          className="w-full bg-transparent px-3 py-3 pr-12 text-sm text-ink placeholder:text-ink/40 focus:outline-none"
        />
        <button
          type="button"
          onClick={onToggleVisible}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 text-ink/55 hover:text-ink"
        >
          {visible ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
      {error ? <InlineError msg={error} /> : helpText ? <p className="mt-1 text-[0.7rem] text-ink/55">{helpText}</p> : null}
    </div>
  );
}

function ErrorRow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-maroon font-medium" role="alert">
      {children}
    </p>
  );
}

function IconEye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m3 3 18 18" />
      <path d="M10.6 6.1A11 11 0 0 1 12 6c6.5 0 10 7 10 7a16 16 0 0 1-3.4 4.3" />
      <path d="M6.2 7.7A16.3 16.3 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 5-1.3" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
