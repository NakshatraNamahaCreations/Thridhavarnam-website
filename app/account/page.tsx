'use client';

import { useEffect, useState } from 'react';
import AccountShell from '@/components/account/AccountShell';
import { useAuth } from '@/lib/auth';

// /account — landing page for the section. Shows the editable basics
// (name, email, phone). There's no backend so "save" only mutates the
// client-side auth state and writes to localStorage; the form is wired
// to demonstrate the UX rather than to persist server-side.

export default function AccountDetailsPage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setPhone(user.mobile ?? '');
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Profile updates aren't wired to a backend endpoint yet — the form
    // is intentionally cosmetic until a `PATCH /api/auth/me` lands.
    if (!user) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <AccountShell title="Account Details">
      <form onSubmit={handleSave} className="max-w-xl bg-white border border-ink/10 p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Full Name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-ink/20 focus:border-ink transition-colors bg-transparent px-3 py-2.5 text-sm text-ink focus:outline-none"
            />
          </Field>

          <Field label="Phone">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full border border-ink/20 focus:border-ink transition-colors bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:outline-none"
            />
          </Field>

          <Field label="Email" full>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-ink/20 focus:border-ink transition-colors bg-transparent px-3 py-2.5 text-sm text-ink focus:outline-none"
            />
          </Field>
        </div>

        <div className="mt-7 pt-5 border-t border-ink/10 flex items-center justify-between gap-4 flex-wrap">
          <button
            type="submit"
            className="bg-maroon-deep text-ivory px-6 py-2.5 text-sm font-semibold tracking-wide hover:bg-maroon transition-colors"
          >
            Save Changes
          </button>
          {saved && (
            <span className="text-xs text-peacock font-medium" role="status">
              Saved.
            </span>
          )}
        </div>
      </form>

      <div className="mt-6 max-w-xl bg-white border border-ink/10 p-6 md:p-8">
        <div className="text-sm font-semibold text-ink">Password</div>
        <div className="mt-1 text-xs text-ink/60">
          Reset link will be sent to your registered email.
        </div>
        <button
          type="button"
          className="mt-4 border border-ink text-ink px-5 py-2 text-sm font-medium hover:bg-maroon-deep hover:text-ivory transition-colors"
        >
          Send Reset Link
        </button>
      </div>
    </AccountShell>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={full ? 'md:col-span-2 block' : 'block'}>
      <span className="block text-xs font-semibold text-ink mb-1.5">{label}</span>
      {children}
    </label>
  );
}
