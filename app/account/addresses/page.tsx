'use client';

import { useState } from 'react';
import AccountShell from '@/components/account/AccountShell';
import { useAddresses, type Address, type AddressInput } from '@/lib/addresses';

// /account/addresses — the address book UI. Reads from the shared address
// store (lib/addresses.tsx) so anything the customer entered at checkout
// shows up here, and vice-versa. The store is scoped per-signed-in-user,
// so signing in as a different account swaps the visible list.

type FormShape = AddressInput & { id: string };

const emptyForm = (): FormShape => ({
  id: '',
  label: 'Home',
  fullName: '',
  phone: '',
  email: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  isDefault: false,
});

function toForm(a: Address): FormShape {
  return {
    id: a.id,
    label: a.label ?? 'Home',
    fullName: a.fullName,
    phone: a.phone,
    email: a.email,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    country: a.country || 'India',
    isDefault: !!a.isDefault,
  };
}

export default function AddressesPage() {
  const {
    addresses, hydrated, addAddress, updateAddress, removeAddress, makeDefault,
  } = useAddresses();
  const [editing, setEditing] = useState<FormShape | null>(null);

  const handleSave = (form: FormShape) => {
    if (form.id) {
      updateAddress(form.id, {
        label: form.label,
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        line1: form.line1,
        line2: form.line2,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        country: form.country,
        isDefault: form.isDefault,
      });
    } else {
      const { id: _id, ...input } = form;
      void _id;
      addAddress(input);
    }
    setEditing(null);
  };

  return (
    <AccountShell title="Addresses">
      {editing ? (
        <AddressForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-4 mb-5">
            <p className="text-sm text-ink/65">
              {addresses.length === 0
                ? 'Save addresses for faster checkout.'
                : `${addresses.length} saved`}
            </p>
            <button
              type="button"
              onClick={() => setEditing(emptyForm())}
              className="bg-maroon-deep text-ivory px-5 py-2 text-sm font-semibold tracking-wide hover:bg-maroon transition-colors"
            >
              Add Address
            </button>
          </div>

          {hydrated && addresses.length === 0 && (
            <div className="bg-white border border-ink/10 p-10 md:p-14 text-center">
              <div className="mx-auto w-12 h-12 border border-ink/20 flex items-center justify-center text-ink/55">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              </div>
              <div className="mt-4 text-base font-semibold text-ink">
                No addresses saved
              </div>
              <p className="mt-1 text-sm text-ink/65">
                Add a shipping address here or during checkout — it'll appear on this page automatically.
              </p>
            </div>
          )}

          {addresses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((a) => (
                <div key={a.id} className="bg-white border border-ink/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-ink">
                      {a.label || 'Address'}
                    </div>
                    {a.isDefault && (
                      <span className="text-[0.65rem] font-semibold tracking-wide uppercase border border-ink/30 px-2 py-0.5 text-ink/70">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="mt-3 text-sm text-ink/85 leading-relaxed">
                    <div className="font-medium text-ink">{a.fullName}</div>
                    <div>{a.line1}</div>
                    {a.line2 && <div>{a.line2}</div>}
                    <div>
                      {a.city}, {a.state} {a.pincode}
                    </div>
                    <div>{a.country}</div>
                    <div className="mt-1 text-ink/65">{a.phone}</div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-ink/10 flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setEditing(toForm(a))}
                      className="text-xs font-semibold text-ink hover:text-maroon underline underline-offset-2"
                    >
                      Edit
                    </button>
                    <span className="text-ink/30">·</span>
                    <button
                      type="button"
                      onClick={() => removeAddress(a.id)}
                      className="text-xs font-semibold text-ink hover:text-maroon underline underline-offset-2"
                    >
                      Delete
                    </button>
                    {!a.isDefault && (
                      <>
                        <span className="text-ink/30">·</span>
                        <button
                          type="button"
                          onClick={() => makeDefault(a.id)}
                          className="text-xs font-semibold text-ink hover:text-maroon underline underline-offset-2"
                        >
                          Set as default
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AccountShell>
  );
}

function AddressForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: FormShape;
  onCancel: () => void;
  onSave: (addr: FormShape) => void;
}) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormShape>(key: K, value: FormShape[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) return setError('Enter the recipient name.');
    if (!form.phone.trim()) return setError('Enter a contact number.');
    if (!form.line1.trim()) return setError('Enter the street address.');
    if (!form.city.trim() || !form.state.trim() || !form.pincode.trim())
      return setError('City, state and pincode are required.');
    setError(null);
    onSave(form);
  };

  return (
    <form onSubmit={submit} className="bg-white border border-ink/10 p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Label">
          <select
            value={form.label}
            onChange={(e) => set('label', e.target.value)}
            className="w-full border border-ink/20 focus:border-ink transition-colors bg-transparent px-3 py-2.5 text-sm text-ink focus:outline-none"
          >
            <option>Home</option>
            <option>Office</option>
            <option>Other</option>
          </select>
        </Field>

        <Field label="Full Name">
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            className="w-full border border-ink/20 focus:border-ink transition-colors bg-transparent px-3 py-2.5 text-sm text-ink focus:outline-none"
          />
        </Field>

        <Field label="Phone">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full border border-ink/20 focus:border-ink transition-colors bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:outline-none"
          />
        </Field>

        <Field label="Pincode">
          <input
            type="text"
            value={form.pincode}
            onChange={(e) => set('pincode', e.target.value)}
            className="w-full border border-ink/20 focus:border-ink transition-colors bg-transparent px-3 py-2.5 text-sm text-ink focus:outline-none"
          />
        </Field>

        <Field label="Address Line 1" full>
          <input
            type="text"
            value={form.line1}
            onChange={(e) => set('line1', e.target.value)}
            placeholder="House / flat, street"
            className="w-full border border-ink/20 focus:border-ink transition-colors bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:outline-none"
          />
        </Field>

        <Field label="Address Line 2" full>
          <input
            type="text"
            value={form.line2}
            onChange={(e) => set('line2', e.target.value)}
            placeholder="Landmark, area (optional)"
            className="w-full border border-ink/20 focus:border-ink transition-colors bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:outline-none"
          />
        </Field>

        <Field label="City">
          <input
            type="text"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            className="w-full border border-ink/20 focus:border-ink transition-colors bg-transparent px-3 py-2.5 text-sm text-ink focus:outline-none"
          />
        </Field>

        <Field label="State">
          <input
            type="text"
            value={form.state}
            onChange={(e) => set('state', e.target.value)}
            className="w-full border border-ink/20 focus:border-ink transition-colors bg-transparent px-3 py-2.5 text-sm text-ink focus:outline-none"
          />
        </Field>

        <Field label="Country" full>
          <input
            type="text"
            value={form.country}
            onChange={(e) => set('country', e.target.value)}
            className="w-full border border-ink/20 focus:border-ink transition-colors bg-transparent px-3 py-2.5 text-sm text-ink focus:outline-none"
          />
        </Field>
      </div>

      <label className="mt-5 flex items-center gap-2 text-sm text-ink/85 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={!!form.isDefault}
          onChange={(e) => set('isDefault', e.target.checked)}
          className="accent-ink"
        />
        Use as the default address
      </label>

      {error && (
        <p className="mt-4 text-xs text-maroon font-medium" role="alert">
          {error}
        </p>
      )}

      <div className="mt-7 pt-5 border-t border-ink/10 flex items-center gap-3">
        <button
          type="submit"
          className="bg-maroon-deep text-ivory px-6 py-2.5 text-sm font-semibold tracking-wide hover:bg-maroon transition-colors"
        >
          Save Address
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-semibold text-ink/70 hover:text-ink underline underline-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
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
